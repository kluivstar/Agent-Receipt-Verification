import { Router } from 'express';
import { taskService } from '../services/taskService.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { createTaskSchema, updateTaskStatusSchema, queryFilterSchema } from '@agentreceipt/shared';

const router = Router();

// GET /api/v1/tasks/metrics
router.get('/metrics', (req, res, next) => {
  try {
    const metrics = taskService.getMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/tasks
router.get('/', validateQuery(queryFilterSchema), (req, res, next) => {
  try {
    const result = taskService.listTasks(req.query);
    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/tasks
router.post('/', validateBody(createTaskSchema), (req, res, next) => {
  try {
    const task = taskService.createTask(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/tasks/:id
router.get('/:id', (req, res, next) => {
  try {
    const task = taskService.getTask(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: `Task with ID '${req.params.id}' was not found.` }
      });
    }
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/tasks/:id/status
router.patch('/:id/status', validateBody(updateTaskStatusSchema), (req, res, next) => {
  try {
    const updated = taskService.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
