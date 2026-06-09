import { supabaseRequest, HAS_SUPABASE, requiredEnv, normalizePrivateKey } from '../storage/supabaseClient.js';
import { google } from 'googleapis';
import { ZodError } from 'zod';
import { normalizeFormSubmission } from '../validators/formSchemas.js';
import { getPublicAppUrl } from '../utils/publicAppUrl.js';
import { sendWelcomeVerificationEmail } from './emailService.js';
import { broadcastSSEEvent } from './sseService.js';
import { emitToRoom, getRoom } from '../config/socket.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function toSafeString(value, max = 4000) {
  return String(value ?? '').trim().slice(0, max);
}

// ── Offline retry queue ────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QUEUE_FILE = path.join(__dirname, '..', 'data', 'pending-forms.json');

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 5000; // 5 seconds, doubled each retry

let pendingQueue = [];
let processing = false;

function loadQueue() {
  try {
    if (fs.existsSync(QUEUE_FILE)) {
      pendingQueue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    }
  } catch {
    pendingQueue = [];
  }
}

function saveQueue() {
  try {
    const dir = path.dirname(QUEUE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(pendingQueue, null, 2), 'utf8');
  } catch (err) {
    console.error('[Forms Queue] Failed to persist queue:', err);
  }
}

function enqueue(formType, payload) {
  pendingQueue.push({
    formType,
    payload,
    retries: 0,
    timestamp: Date.now(),
  });
  saveQueue();
  if (!processing) processQueue();
}

function dequeue(index) {
  pendingQueue.splice(index, 1);
  saveQueue();
}

async function processQueue() {
  if (processing || pendingQueue.length === 0) return;
  processing = true;

  const batch = [...pendingQueue];
  pendingQueue = [];

  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];
    try {
      await formsService.appendToSupabaseForms(item.formType, item.payload);
      // success — drop from queue (do NOT re-add)
    } catch {
      item.retries++;
      if (item.retries < MAX_RETRIES) {
        batch.push(item);
      } else {
        console.error(`[Forms Queue] Max retries exceeded for ${item.formType}:`, item.payload);
      }
    }
  }

  pendingQueue = batch;
  saveQueue();
  processing = false;

  if (pendingQueue.length > 0) {
    const delay = BASE_DELAY_MS * Math.pow(2, pendingQueue[0].retries);
    setTimeout(processQueue, Math.min(delay, 120000));
  }
}

// Load persisted queue on startup
loadQueue();
if (pendingQueue.length > 0) {
  setTimeout(processQueue, 3000);
}

export const formsService = {
  async appendToSupabaseForms(formType, payload) {
    if (!HAS_SUPABASE) return false;
    try {
      await supabaseRequest('form_submissions', {
        method: 'POST',
        body: [{
          form_type: formType,
          full_name: toSafeString(payload.fullName, 140),
          college_email: toSafeString(payload.collegeEmail, 140),
          whatsapp: toSafeString(payload.whatsapp, 40),
          payload,
        }],
      });
      return true;
    } catch {
      return false;
    }
  },

  async appendFormToSheet(formType, payload) {
    const clientEmail = requiredEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const privateKey = normalizePrivateKey(requiredEnv('GOOGLE_PRIVATE_KEY'));
    const spreadsheetId = requiredEnv('GOOGLE_SHEET_ID');

    const defaultTab = process.env.GOOGLE_SHEET_TAB_NAME || 'Responses';
    const tabMap = {
      membership: process.env.GOOGLE_MEMBERSHIP_TAB_NAME || 'MembershipResponses',
      recruitment: process.env.GOOGLE_RECRUITMENT_TAB_NAME || 'RecruitmentResponses',
      core_team: process.env.GOOGLE_CORE_TEAM_TAB_NAME || 'CoreTeamResponses',
    };
    const sheetName = tabMap[formType] || defaultTab;

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const now = new Date().toISOString();
    const row = [
      now,
      formType,
      toSafeString(payload.fullName, 140),
      toSafeString(payload.collegeEmail, 140),
      toSafeString(payload.whatsapp, 40),
      JSON.stringify(payload),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });
  },

  async handleForm(formType, body) {
    try {
      const payload = normalizeFormSubmission(formType, body || {});
      const savedToSupabase = await this.appendToSupabaseForms(formType, payload);
      let savedToSheet = false;
      try {
        await this.appendFormToSheet(formType, payload);
        savedToSheet = true;
      } catch (sheetErr) {
        console.error('[Forms Service] Google Sheets append failed:', sheetErr);
      }

      // If both storage backends failed, queue for retry instead of losing data
      if (!savedToSupabase && !savedToSheet) {
        enqueue(formType, payload);
        console.warn(`[Forms Service] Queued ${formType} submission for retry (both storage backends failed)`);
      }

      // Trigger standard welcome verification email
      try {
        const verifyUrl = `${getPublicAppUrl()}/verify?email=${encodeURIComponent(body.collegeEmail)}`;
        await sendWelcomeVerificationEmail(
          body.collegeEmail,
          body.fullName,
          verifyUrl,
        );
      } catch (emailErr) {
        console.error('[Forms Service] Failed to send welcome verification email:', emailErr);
      }

      // Broadcast real-time metric updates via SSE and Socket
      try {
        broadcastSSEEvent('registration', {
          formType,
          fullName: payload.fullName,
          timestamp: new Date().toISOString(),
        });
        emitToRoom(getRoom('admin'), 'admin:new-registration', {
          formType,
          userName: payload.fullName,
          timestamp: new Date(),
        });
      } catch (realtimeErr) {
        console.error('[Forms Service] Failed to broadcast real-time updates:', realtimeErr);
      }

      return { ok: true };
    } catch (e) {
      if (e instanceof ZodError) {
        const issues = e.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
        const err = new Error('Invalid form submission');
        err.details = issues;
        throw err;
      }
      throw e;
    }
  },
};
