import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Application } from '../src/models/Application.js';
import { Interview } from '../src/models/Interview.js';
import { Company } from '../src/models/Company.js';

const TEST_DB_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/careertrack_test';

describe('CareerTrack API Test Suite', () => {
  let user1Token = '';
  let user1Id = '';
  let user2Token = '';
  let user2Id = '';
  let testAppId = '';
  let testInterviewId = '';

  beforeAll(async () => {
    // Ensure disconnected from main DB if open, and connect exclusively to test DB
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(TEST_DB_URI);

    // Clean test DB
    await Promise.all([
      User.deleteMany({ email: /@test\.com$/ }),
      Application.deleteMany({}),
      Interview.deleteMany({}),
      Company.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      User.deleteMany({ email: /@test\.com$/ }),
      Application.deleteMany({}),
      Interview.deleteMany({}),
      Company.deleteMany({}),
    ]);
    await mongoose.connection.close();
  });

  describe('Health API', () => {
    it('GET /api/health returns 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
    });
  });

  describe('Authentication APIs', () => {
    it('POST /api/auth/register registers a new user', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test Engineer',
        email: 'engineer@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('engineer@test.com');
      expect(res.body.data.accessToken).toBeDefined();

      user1Token = res.body.data.accessToken;
      user1Id = res.body.data.user.id;
    });

    it('POST /api/auth/register rejects duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Duplicate Engineer',
        email: 'engineer@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login logs in with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'engineer@test.com',
        password: 'Password123!',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('POST /api/auth/login rejects invalid password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'engineer@test.com',
        password: 'WrongPassword',
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me returns authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('engineer@test.com');
    });

    it('Register a second user for cross-user security isolation testing', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Second User',
        email: 'second@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(res.status).toBe(201);
      user2Token = res.body.data.accessToken;
      user2Id = res.body.data.user.id;
    });
  });

  describe('Application APIs & Authorization Security', () => {
    it('POST /api/applications creates an application for user 1', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          company: 'Acme Corp',
          jobTitle: 'Backend Engineer',
          status: 'Applied',
          priority: 'High',
          workArrangement: 'Remote',
          employmentType: 'Full-time',
          salaryMin: 120000,
          salaryMax: 150000,
          source: 'LinkedIn',
          notes: 'Initial test note',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company).toBe('Acme Corp');
      testAppId = res.body.data._id;
    });

    it('GET /api/applications returns user 1 applications with pagination', async () => {
      const res = await request(app)
        .get('/api/applications?page=1&limit=10')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/applications/:id returns application details', async () => {
      const res = await request(app)
        .get(`/api/applications/${testAppId}`)
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.jobTitle).toBe('Backend Engineer');
    });

    it('SECURITY: User 2 CANNOT access User 1 application', async () => {
      const res = await request(app)
        .get(`/api/applications/${testAppId}`)
        .set('Authorization', `Bearer ${user2Token}`);
      expect(res.status).toBe(404);
    });

    it('PATCH /api/applications/:id/status updates status and creates timeline activity', async () => {
      const res = await request(app)
        .patch(`/api/applications/${testAppId}/status`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          status: 'Interview',
          notes: 'Invited to recruiter screen',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Interview');
    });

    it('GET /api/applications/stats returns status distribution stats', async () => {
      const res = await request(app)
        .get('/api/applications/stats')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/applications/export returns RFC CSV download', async () => {
      const res = await request(app)
        .get('/api/applications/export')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Acme Corp');
    });
  });

  describe('Interview APIs & Cross-User Protection', () => {
    it('POST /api/interviews schedules an interview for user 1', async () => {
      const res = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          applicationId: testAppId,
          round: 'Round 1: Technical Coding',
          type: 'Technical Interview',
          scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
          durationMinutes: 60,
          mode: 'Online',
          meetingLink: 'https://meet.test.com/abc',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.round).toBe('Round 1: Technical Coding');
      testInterviewId = res.body.data._id;
    });

    it('SECURITY: User 2 cannot schedule an interview on User 1 application', async () => {
      const res = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          applicationId: testAppId,
          round: 'Malicious Round',
          type: 'Technical Interview',
          scheduledAt: new Date().toISOString(),
        });
      expect(res.status).toBe(404);
    });

    it('PATCH /api/interviews/:id/outcome records outcome and feedback', async () => {
      const res = await request(app)
        .patch(`/api/interviews/${testInterviewId}/outcome`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          outcome: 'Passed',
          feedback: 'Excellent algorithms knowledge',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.outcome).toBe('Passed');
    });

    it('GET /api/interviews/calendar returns calendar events', async () => {
      const res = await request(app)
        .get('/api/interviews/calendar')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Dashboard & Analytics APIs', () => {
    it('GET /api/dashboard/summary returns dynamic metrics', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.summary.total).toBeGreaterThanOrEqual(1);
      expect(res.body.data.metrics).toBeDefined();
    });

    it('GET /api/analytics/overview returns computed cohorts', async () => {
      const res = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.totalApplications).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/analytics/source-effectiveness returns source performance', async () => {
      const res = await request(app)
        .get('/api/analytics/source-effectiveness')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Application Deletion & Cascading Clean-up', () => {
    it('DELETE /api/applications/:id deletes application and its interviews', async () => {
      const res = await request(app)
        .delete(`/api/applications/${testAppId}`)
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);

      // Verify it's gone
      const checkApp = await Application.findById(testAppId);
      expect(checkApp).toBeNull();

      // Verify associated interview was cascade deleted
      const checkInterview = await Interview.findById(testInterviewId);
      expect(checkInterview).toBeNull();
    });
  });
});
