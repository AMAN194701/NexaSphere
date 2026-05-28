import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { adminListCoreTeamMembers, adminAddCoreTeamMember, adminDeleteCoreTeamMember } from '../controllers/coreTeamController.js';
import { coreTeamService } from '../services/coreTeamService.js';

const app = express();
app.use(express.json());
// Mock request user/admin session for testing emission
app.use((req, res, next) => {
  req.adminSession = { username: 'testAdmin' };
  next();
});
app.get('/team', adminListCoreTeamMembers);
app.post('/team', adminAddCoreTeamMember);
app.delete('/team/:id', adminDeleteCoreTeamMember);

describe('coreTeamController', () => {
  beforeEach(() => {
    coreTeamService.listMembers = jest.fn();
    coreTeamService.addMember = jest.fn();
    coreTeamService.deleteMember = jest.fn();
    jest.clearAllMocks();
  });

  describe('adminListCoreTeamMembers', () => {
    it('returns a 200 and the list of members', async () => {
      coreTeamService.listMembers.mockResolvedValue([{ name: 'Alice' }]);
      const res = await request(app).get('/team');
      expect(res.status).toBe(200);
      expect(res.body.members).toEqual([{ name: 'Alice' }]);
    });
  });

  describe('adminAddCoreTeamMember', () => {
    it('returns 400 if required fields are missing', async () => {
      const res = await request(app).post('/team').send({ name: 'Alice', section: 'A', whatsapp: '1234567890' }); // Missing other fields
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing required fields');
    });

    it('returns 400 if email is invalid', async () => {
      const res = await request(app).post('/team').send({
        name: 'Alice', role: 'Dev', year: '3', branch: 'CSE', section: 'A', email: 'invalid-email', whatsapp: '1234567890'
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid email format');
    });

    it('returns 201 and creates member successfully', async () => {
      coreTeamService.addMember.mockResolvedValue({ id: '123', name: 'Alice' });
      const res = await request(app).post('/team').send({
        name: 'Alice', role: 'Dev', year: '3', branch: 'CSE', section: 'A', email: 'alice@example.com', whatsapp: '1234567890'
      });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Alice');
      expect(coreTeamService.addMember).toHaveBeenCalled();
    });
  });

  describe('adminDeleteCoreTeamMember', () => {
    it('returns 404 if member is not found', async () => {
      coreTeamService.deleteMember.mockResolvedValue(false);
      const res = await request(app).delete('/team/123');
      expect(res.status).toBe(404); // wrapAsync sends 500 by default for thrown errors unless we catch, wait NotFoundError sends 404? Let's check: wrapAsync is custom
    });

    it('returns 200 ok when deleted', async () => {
      coreTeamService.deleteMember.mockResolvedValue(true);
      const res = await request(app).delete('/team/123');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });
});
