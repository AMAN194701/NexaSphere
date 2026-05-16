import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ZodError } from 'zod';
import errorHandler from './middleware/errorHandler.js';

import { adminAuthMiddleware } from './middleware/adminAuthMiddleware.js';
import * as eventsController from './controllers/eventsController.js';
import * as activityEventsController from './controllers/activityEventsController.js';
import * as coreTeamController from './controllers/coreTeamController.js';
import * as formsController from './controllers/formsController.js';
import { eventsService } from './services/eventsService.js';
import { coreTeamService } from './services/coreTeamService.js';
import { HAS_SUPABASE } from './storage/supabaseClient.js';
import { ensureContentFile } from './storage/contentFileStore.js';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean) : true,
  credentials: false,
}));
app.use(express.json({ limit: '512kb' }));

function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  const { method, path } = req;

  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6;
    const status = res.statusCode;
    const message = `[${method}] ${path} → ${status} (${Math.round(duration)}ms)`;

    if (status >= 500) {
      console.error(message);
    } else if (status >= 400) {
      console.warn(message);
    } else {
      console.log(message);
    }
  });

  next();
}

app.use(requestLogger);

const adminAuth = adminAuthMiddleware.requireAdmin;

app.on('CORE_TEAM_MEMBER_ADDED', (event) => console.log(`[EVENT] CORE_TEAM_MEMBER_ADDED:`, event));
app.on('CORE_TEAM_MEMBER_REMOVED', (event) => console.log(`[EVENT] CORE_TEAM_MEMBER_REMOVED:`, event));

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
}

function isPhoneish(s) {
  const v = String(s || '').trim();
  return /^[+()\-\s0-9]{8,20}$/.test(v);
}

app.get('/healthz', async (req, res) => {
  const events = await eventsService.listEvents();
  res.json({ ok: true, events: events.length, storage: HAS_SUPABASE ? 'supabase' : 'file' });
});

app.get('/api/content/events', eventsController.listEvents);

app.get('/api/content/activity-events/:activityKey', activityEventsController.listActivityEvents);
app.post('/api/content/activity-events/:activityKey', activityEventsController.addActivityEvent);
app.delete('/api/content/activity-events/:activityKey/:eventId', activityEventsController.deleteActivityEvent);

app.post('/api/admin/login', adminAuthMiddleware.login);
app.post('/api/admin/logout', adminAuthMiddleware.logout);

app.get('/api/admin/events', adminAuth, eventsController.adminListEvents);
app.post('/api/admin/events', adminAuth, eventsController.adminCreateEvent);
app.put('/api/admin/events/:id', adminAuth, eventsController.adminUpdateEvent);
app.delete('/api/admin/events/:id', adminAuth, eventsController.adminDeleteEvent);

app.get('/api/content/core-team', async (req, res) => {
  try {
    const members = await coreTeamService.listMembers();
    return res.json(members);
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to load core team' });
  }
});

app.get('/api/admin/core-team', adminAuth, coreTeamController.adminListCoreTeamMembers);
app.post('/api/admin/core-team', adminAuth, coreTeamController.adminAddCoreTeamMember);
app.delete('/api/admin/core-team/:id', adminAuth, coreTeamController.adminDeleteCoreTeamMember);

async function handleForm(formType, req, res) {
  try {
    const payload = normalizeFormSubmission(formType, req.body || {});

    const savedToSupabase = await appendToSupabaseForms(formType, payload);
    try {
      await appendFormToSheet(formType, payload);
    } catch (sheetErr) {
      if (!savedToSupabase) throw sheetErr;
    }
    return res.json({ ok: true });
  } catch (e) {
    if (e instanceof ZodError) {
      return res.status(400).json({
        error: 'Invalid form submission',
        issues: e.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    return res.status(500).json({ error: e?.message || 'Submission failed' });
  }
}

app.post('/api/forms/membership', formsController.makeHandleForm('membership'));
app.post('/api/forms/recruitment', formsController.makeHandleForm('recruitment'));
app.post('/api/core-team/apply', formsController.makeHandleForm('core_team'));

// Centralized error handler (should be last middleware)
app.use(errorHandler);

const port = Number(process.env.PORT || 8787);
if (!process.env.VERCEL) {
  const boot = HAS_SUPABASE ? Promise.resolve() : ensureContentFile();
  boot.then(() => {
    app.listen(port, () => {
      console.log(`NexaSphere server listening on http://localhost:${port}`);
    });
  });
} else {
  app.listen(port, () => {
    console.log(`NexaSphere server listening on http://localhost:${port}`);
  });
}

export default app;
