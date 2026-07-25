import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { activityEventsRepository } from '../repositories/activityEventsRepository.js';
import { coreTeamService } from './coreTeamService.js';
import { activityEventSchema } from '../validators/activityEventSchemas.js';
import { sanitizeActivityEventRecord } from '../utils/sanitize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_FILE = path.join(__dirname, '..', 'data', 'content.json');
import { activityEventsRepository } from "../repositories/activityEventsRepository.js";
import { coreTeamService } from "./coreTeamService.js";
import { activityEventSchema } from "../validators/activityEventSchemas.js";
import cacheService from "./cacheService.js";

export const activityEventsService = {
  async listActivityEvents(activityKey, { page = 1, limit = 20 } = {}) {
    const { rows, total } = await activityEventsRepository.listByActivityKey(activityKey, {
      page,
      limit,
    });
    return {
      rows: rows.map((row) => sanitizeActivityEventRecord(row)),
      total,
      page,
      limit,
    };
    const cacheKey = `activity_events:list:${activityKey}:${page}:${limit}`;
    const cached = cacheService.get(cacheKey);
    if (cached !== undefined) {
      console.log(`[Activity Events Service] Cache HIT for key "${cacheKey}"`);
      return cached;
    }

    console.log(
      `[Activity Events Service] Cache MISS for key "${cacheKey}". Fetching from database.`
    );
    const result = await activityEventsRepository.listByActivityKey(
      activityKey,
      { page, limit }
    );
    cacheService.set(cacheKey, result);
    return result;
  },

  async assertCanManage(body) {
    await coreTeamService.assertCanManageActivityEvent(body);
import { activityEventsRepository } from '../repositories/activityEventsRepository.js';
import { coreTeamService } from './coreTeamService.js';
import { activityEventSchema } from '../validators/activityEventSchemas.js';

export const activityEventsService = {
  async listActivityEvents(activityKey, { page = 1, limit = 20 } = {}) {
    return activityEventsRepository.listByActivityKey(activityKey, { page, limit });
  },

  async assertCanManage(body) {
    await coreTeamService.assertCanManageActivityEvent(body);
  },

  async addActivityEvent(activityKey, input) {
    await this.assertCanManage(input);

    const payload = {
      id: input.id,
      name: input.name,
      date: input.date,
      tagline: input.tagline,
      description: input.description,
      status: input.status,
      createdBy: {
        name: input.coreTeamName || '',
        email: input.coreTeamEmail || '',
        phone: input.coreTeamPhone || '',
      },
    };

    const validated = activityEventSchema.parse(payload);
    const created = await activityEventsRepository.create(activityKey, validated);
    return sanitizeActivityEventRecord(created);
    const parsed = activityEventSchema.parse(input);
    const created = await activityEventsRepository.create(activityKey, parsed);

    // Invalidate distributed cache after database mutation
    await cacheService.invalidateCache("activity_events");
    return created;
  },

  async deleteActivityEvent(activityKey, eventId) {
    const deleted = await activityEventsRepository.delete(activityKey, eventId);

    // Invalidate distributed cache after database mutation
    if (deleted) {
      await cacheService.invalidateCache("activity_events");
    }
    return deleted;
    const parsed = activityEventSchema.parse(input);
    return activityEventsRepository.create(activityKey, parsed);
  },

  async deleteActivityEvent(activityKey, eventId) {
    // Authorization is handled upstream by the requireAdmin middleware
    // via req.adminSession. No request body is needed for deletion.
    return activityEventsRepository.delete(activityKey, eventId);
  },

  async listAllActivities() {
    return activityEventsRepository.listAll();
  },
};
