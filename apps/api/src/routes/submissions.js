import { Router } from 'express';
import { submissionService } from '../services/submissionService.js';
import { validateBody } from '../middleware/validate.js';
import { createSubmissionSchema } from '@agentreceipt/shared';

const router = Router();

// POST /api/v1/submissions
router.post('/', validateBody(createSubmissionSchema), async (req, res, next) => {
  try {
    const submission = await submissionService.createSubmission(req.body);
    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: err.message }
      });
    }
    if (err.message.includes('Security validation') || err.message.includes('SSRF') || err.message.includes('already been completed')) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_SUBMISSION', message: err.message }
      });
    }
    next(err);
  }
});

// GET /api/v1/submissions/:id
router.get('/:id', (req, res, next) => {
  try {
    const submission = submissionService.getSubmission(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: { code: 'SUBMISSION_NOT_FOUND', message: `Submission with ID '${req.params.id}' was not found.` }
      });
    }
    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/submissions/task/:taskId
router.get('/task/:taskId', (req, res, next) => {
  try {
    const list = submissionService.getSubmissionsForTask(req.params.taskId);
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

export default router;
