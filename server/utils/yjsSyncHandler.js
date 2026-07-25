import * as Y from "yjs";
import { withDb } from "../repositories/db.js";
import logger from "./logger.js";

// In-memory documents map
const docs = new Map();
const dbWriteIntervals = new Map();

/**
 * Get or create Y.Doc for a room
 * @param {string} roomId
 * @returns {Y.Doc}
 */
export function getOrCreateDoc(roomId) {
  if (docs.has(roomId)) {
    return docs.get(roomId);
  }

  const doc = new Y.Doc();
  docs.set(roomId, doc);

  // Load initial content from PostgreSQL if available
  withDb(async (client) => {
    // Ensure table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id VARCHAR(255) PRIMARY KEY,
        document_content TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const result = await client.query(
      "SELECT document_content FROM workspaces WHERE id = $1",
      [roomId]
    );
    if (result.rows.length > 0) {
      const content = result.rows[0].document_content || "";
      const ytext = doc.getText("documentContent");
      ytext.insert(0, content);
      logger.info(`Loaded workspace ${roomId} content from database`);
    } else {
      // Create empty record for workspace
      await client.query(
        "INSERT INTO workspaces (id, document_content) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [roomId, ""]
      );
    }
  }).catch((err) => {
    logger.error(
      `Error initializing workspace ${roomId} database: ${err.message}`
    );
  });

  return doc;
}

/**
 * Handle Yjs update from a client
 * Appends binary CRDT delta updates to the corresponding document, and queues
 * a debounced save to PostgreSQL to optimize network and database resources.
 * @param {string} roomId - The unique identifier of the workspace room
 * @param {Uint8Array} updateBuffer - The binary patch containing client updates
 */
export function handleYjsUpdate(roomId, updateBuffer) {
  const doc = getOrCreateDoc(roomId);
  Y.applyUpdate(doc, updateBuffer);

  // Debounce/Throttle database writes to every 5 seconds to reduce write load
  if (!dbWriteIntervals.has(roomId)) {
    const timeout = setTimeout(() => {
      dbWriteIntervals.delete(roomId);
      saveWorkspaceToDb(roomId);
    }, 5000);
    dbWriteIntervals.set(roomId, timeout);
  }
}

/**
 * Save workspace content to PostgreSQL
 * @param {string} roomId
 */
export async function saveWorkspaceToDb(roomId) {
  const doc = docs.get(roomId);
  if (!doc) return;

  const content = doc.getText("documentContent").toString();

  try {
    await withDb(async (client) => {
      await client.query(
        `INSERT INTO workspaces (id, document_content, updated_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (id) DO UPDATE SET document_content = EXCLUDED.document_content, updated_at = NOW()`,
        [roomId, content]
      );
    });
    logger.debug(`Saved workspace ${roomId} to database`);
  } catch (err) {
    logger.error(
      `Failed to save workspace ${roomId} to database: ${err.message}`
    );
  }
}

/**
 * Clean up room documents
 * @param {string} roomId
 */
export function cleanupRoom(roomId) {
  if (dbWriteIntervals.has(roomId)) {
    clearTimeout(dbWriteIntervals.get(roomId));
    dbWriteIntervals.delete(roomId);
  }
  // Save final state before cleanup
  saveWorkspaceToDb(roomId).then(() => {
    docs.delete(roomId);
  });
}
