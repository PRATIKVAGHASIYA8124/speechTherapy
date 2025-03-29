const request = require('supertest');
const app = require('../test-server');
const User = require('../models/User');
const ProgressReport = require('../models/ProgressReport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { connectDB, clearDatabase, closeDatabase } = require('./setup');

describe('Progress Reports Routes', () => {
  let therapistToken, supervisorToken, testTherapist, testSupervisor, testPatient;

  beforeAll(async () => {
    await connectDB();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    // Create test users
    testTherapist = await User.create({
      name: 'Test Therapist',
      email: 'therapist@example.com',
      password: 'password123',
      role: 'therapist',
      specialization: 'Speech Therapy',
      experience: 5
    });

    testSupervisor = await User.create({
      name: 'Test Supervisor',
      email: 'supervisor@example.com',
      password: 'password123',
      role: 'supervisor',
      specialization: 'Speech Therapy',
      experience: 10
    });

    testPatient = await User.create({
      name: 'Test Patient',
      email: 'patient@example.com',
      password: 'password123',
      role: 'patient',
      specialization: 'N/A',
      experience: 0
    });

    // Generate tokens
    therapistToken = jwt.sign({ userId: testTherapist._id }, config.jwtSecret);
    supervisorToken = jwt.sign({ userId: testSupervisor._id }, config.jwtSecret);
  });

  describe('POST /api/progress-reports', () => {
    it('should create a new progress report', async () => {
      const reportData = {
        patient: testPatient._id,
        sessionDetails: {
          date: new Date(),
          duration: 60,
          type: 'individual'
        },
        progress: {
          goals: ['Improve pronunciation'],
          achievements: ['Better clarity in speech'],
          challenges: ['Difficulty with certain sounds']
        },
        nextSteps: ['Practice specific sounds']
      };

      const response = await request(app)
        .post('/api/progress-reports')
        .set('Authorization', `Bearer ${therapistToken}`)
        .send(reportData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.patient.toString()).toBe(testPatient._id.toString());
    });

    it('should not create report without authentication', async () => {
      const response = await request(app)
        .post('/api/progress-reports')
        .send({});

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/progress-reports', () => {
    beforeEach(async () => {
      // Create a test report
      await ProgressReport.create({
        patient: testPatient._id,
        therapist: testTherapist._id,
        sessionDetails: {
          date: new Date(),
          duration: 60,
          type: 'individual'
        },
        progress: {
          goals: ['Test goal'],
          achievements: ['Test achievement'],
          challenges: ['Test challenge']
        },
        nextSteps: ['Test next step']
      });
    });

    it('should get all reports for therapist', async () => {
      const response = await request(app)
        .get('/api/progress-reports')
        .set('Authorization', `Bearer ${therapistToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get all reports for supervisor', async () => {
      const response = await request(app)
        .get('/api/progress-reports')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('PUT /api/progress-reports/:id/status', () => {
    let testReport;

    beforeEach(async () => {
      testReport = await ProgressReport.create({
        patient: testPatient._id,
        therapist: testTherapist._id,
        sessionDetails: {
          date: new Date(),
          duration: 60,
          type: 'individual'
        },
        progress: {
          goals: ['Test goal'],
          achievements: ['Test achievement'],
          challenges: ['Test challenge']
        },
        nextSteps: ['Test next step'],
        status: 'draft'
      });
    });

    it('should update report status to pending_approval', async () => {
      const response = await request(app)
        .put(`/api/progress-reports/${testReport._id}/status`)
        .set('Authorization', `Bearer ${therapistToken}`)
        .send({ status: 'pending_approval' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('pending_approval');
    });

    it('should allow supervisor to approve report', async () => {
      const response = await request(app)
        .put(`/api/progress-reports/${testReport._id}/status`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');
    });
  });
}); 