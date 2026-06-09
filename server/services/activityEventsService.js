import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { activityEventsRepository } from '../repositories/activityEventsRepository.js';
import { coreTeamService } from './coreTeamService.js';
import { activityEventSchema } from '../validators/activityEventSchemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_FILE = path.join(__dirname, '..', 'data', 'content.json');

export const activityEventsService = {
  async listActivityEvents(activityKey, { page = 1, limit = 20 } = {}) {
    return activityEventsRepository.listByActivityKey(activityKey, { page, limit });
  },

  async assertCanManage(body) {
    await coreTeamService.assertCanManageActivityEvent(body);
  },

  async addActivityEvent(activityKey, input) {
    await this.assertCanManage(input);
    const parsed = activityEventSchema.parse(input);
    return activityEventsRepository.create(activityKey, parsed);
  },

  async deleteActivityEvent(activityKey, eventId) {
    return activityEventsRepository.delete(activityKey, eventId);
  },

  async listAllActivities() {
    try {
      const raw = await fs.readFile(CONTENT_FILE, 'utf8');
      const data = JSON.parse(raw);
      return data.activityEvents || {};
    } catch {
      return {};
    }
  },
};
