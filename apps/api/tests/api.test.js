import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { getDatabase, closeDatabase } from '../src/db/index.js';
import { seedDemoData } from '../src/db/seed.js';

describe('AgentReceipt REST API (v1)', () => {
  let app;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    app = createApp();
    seedDemoData();
  });

  afterAll(() => {
    closeDatabase();
  });

  describe('GET /api/v1/health', () => {
    it('returns 200 with service health info', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.service).toBe('AgentReceipt API');
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('GET /api/v1/config/network', () => {
    it('returns network and chain configuration status', async () => {
      const res = await request(app).get('/api/v1/config/network');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.supportedNetworks).toBeDefined();
      expect(res.body.data.network).toBeDefined();
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('lists tasks with pagination and status filtering', async () => {
      const res = await request(app).get('/api/v1/tasks?status=ACCEPTED');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].status).toBe('ACCEPTED');
      expect(res.body.pagination).toBeDefined();
    });

    it('searches tasks by text query', async () => {
      const res = await request(app).get('/api/v1/tasks?search=Benchmark');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      const text = (res.body.data[0].title + ' ' + res.body.data[0].description).toLowerCase();
      expect(text).toContain('benchmark');
    });
  });

  describe('POST /api/v1/tasks', () => {
    it('creates a new validated task with acceptance criteria', async () => {
      const newTask = {
        title: 'Security Slither Audit for Bridge Contracts',
        description: 'Run automated static security analysis on bridge contracts with strict criteria.',
        requester: '0xTestRequester_Unit01',
        deliverableType: 'CODE_REPOSITORY',
        deliverableInstructions: 'Provide GitHub PR link and slither analysis json output.',
        acceptanceCriteria: [
          {
            title: 'Zero High Findings',
            description: 'No unhandled high severity warnings.',
            passCondition: 'High severity count == 0.',
            required: true
          }
        ],
        evidenceRequirements: 'Slither output report and git commit hash.'
      };

      const res = await request(app).post('/api/v1/tasks').send(newTask);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toMatch(/^tsk_/);
      expect(res.body.data.status).toBe('OPEN');
      expect(res.body.data.agreementCommitment).toMatch(/^0x/);
    });

    it('rejects task creation with missing acceptance criteria', async () => {
      const invalidTask = {
        title: 'Invalid Task',
        description: 'Short',
        requester: '0xUser',
        deliverableInstructions: 'None',
        acceptanceCriteria: [], // Invalid: empty
        evidenceRequirements: 'None'
      };

      const res = await request(app).post('/api/v1/tasks').send(invalidTask);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('retrieves task details with submissions and receipt', async () => {
      const res = await request(app).get('/api/v1/tasks/tsk_vendor_bench_01');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('tsk_vendor_bench_01');
      expect(res.body.data.submissions).toBeDefined();
      expect(res.body.data.receipt).toBeDefined();
    });

    it('returns 404 for non-existent task ID', async () => {
      const res = await request(app).get('/api/v1/tasks/tsk_non_existent_999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TASK_NOT_FOUND');
    });
  });

  describe('POST /api/v1/submissions', () => {
    it('submits deliverable for open task and updates status', async () => {
      const submissionPayload = {
        taskId: 'tsk_open_ai_eval_04',
        submitter: '0xBenchmarkAgent_Pro',
        deliverableUrl: 'https://github.com/agentnet/benchmarks-2026',
        summary: 'Benchmarked CrewAI vs AutoGen vs LangGraph across 100 autonomous trials.',
        evidenceUrls: ['https://raw.githubusercontent.com/agentnet/benchmarks-2026/main/data.csv']
      };

      const res = await request(app).post('/api/v1/submissions').send(submissionPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toMatch(/^sub_/);
      expect(res.body.data.submissionCommitment).toMatch(/^0x/);

      // Verify task status transitioned to SUBMITTED
      const taskRes = await request(app).get('/api/v1/tasks/tsk_open_ai_eval_04');
      expect(taskRes.body.data.status).toBe('SUBMITTED');
    });

    it('rejects deliverable submission for already accepted task', async () => {
      const lateSubmission = {
        taskId: 'tsk_vendor_bench_01', // Already ACCEPTED in seed
        submitter: '0xLateAgent',
        deliverableUrl: 'https://example.com/late',
        summary: 'Late submission that must be rejected.'
      };

      const res = await request(app).post('/api/v1/submissions').send(lateSubmission);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('already been completed');
    });
  });

  describe('POST /api/v1/evaluations and Receipt generation', () => {
    it('evaluates submitted deliverable and creates persistent receipt', async () => {
      // Find the submission we just created for tsk_open_ai_eval_04
      const subListRes = await request(app).get('/api/v1/submissions/task/tsk_open_ai_eval_04');
      expect(subListRes.body.data.length).toBeGreaterThan(0);
      const subId = subListRes.body.data[0].id;

      const evalRes = await request(app).post('/api/v1/evaluations').send({
        submissionId: subId,
        mode: 'demo',
        forceSimulation: true
      });

      expect(evalRes.status).toBe(201);
      expect(evalRes.body.success).toBe(true);
      expect(evalRes.body.data.evaluation.decision).toBeDefined();
      expect(evalRes.body.data.receipt.id).toMatch(/^rcpt_/);

      // Verify receipt is retrievable
      const receiptRes = await request(app).get(`/api/v1/receipts/${evalRes.body.data.receipt.id}`);
      expect(receiptRes.status).toBe(200);
      expect(receiptRes.body.data.verificationSummary.applicationRecordFound).toBe(true);
    });

    it('prevents modifying a finalized accepted evaluation', async () => {
      // Try evaluating already accepted submission
      const res = await request(app).post('/api/v1/evaluations').send({
        submissionId: 'sub_vendor_bench_01',
        mode: 'demo'
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('STATE_CONFLICT');
    });
  });

  describe('GET /api/v1/receipts/:id/export', () => {
    it('exports audit-ready JSON receipt with cryptographic commitments', async () => {
      const res = await request(app).get('/api/v1/receipts/rcpt_bench_accept_99/export');
      expect(res.status).toBe(200);
      expect(res.body.protocol).toBe('AgentReceipt-v1.0');
      expect(res.body.receiptId).toBe('rcpt_bench_accept_99');
      expect(res.body.agreement.agreementCommitment).toBeDefined();
      expect(res.body.submission.submissionCommitment).toBeDefined();
      expect(res.body.evaluation.perCriterionResults).toBeDefined();
    });
  });
});
