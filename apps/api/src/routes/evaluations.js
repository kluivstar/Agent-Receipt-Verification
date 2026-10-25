import { Router } from 'express';
import { evaluationService } from '../services/evaluationService.js';
import { validateBody } from '../middleware/validate.js';
import { evaluateSubmissionSchema } from '@agentreceipt/shared';
import { Repository } from '../db/repository.js';

const router = Router();
const repo = new Repository();

// POST /api/v1/evaluations
router.post('/', validateBody(evaluateSubmissionSchema), async (req, res, next) => {
  try {
    const result = await evaluationService.evaluateSubmission(req.body);
    res.status(201).json({
      success: true,
      data: {
        evaluation: result.evaluation,
        receipt: result.receipt
      }
    });
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { code: 'RESOURCE_NOT_FOUND', message: err.message }
      });
    }
    if (err.message.includes('already been accepted') || err.message.includes('prohibited')) {
      return res.status(409).json({
        success: false,
        error: { code: 'STATE_CONFLICT', message: err.message }
      });
    }
    next(err);
  }
});

// GET /api/v1/evaluations/:id
router.get('/:id', (req, res, next) => {
  try {
    const evaluation = repo.getEvaluationById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        error: { code: 'EVALUATION_NOT_FOUND', message: `Evaluation '${req.params.id}' not found.` }
      });
    }
    res.json({ success: true, data: evaluation });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/evaluations/submission/:submissionId
router.get('/submission/:submissionId', (req, res, next) => {
  try {
    const evaluation = repo.getEvaluationBySubmissionId(req.params.submissionId);
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        error: { code: 'EVALUATION_NOT_FOUND', message: `No evaluation found for submission '${req.params.submissionId}'.` }
      });
    }
    res.json({ success: true, data: evaluation });
  } catch (err) {
    next(err);
  }
});

export default router;
