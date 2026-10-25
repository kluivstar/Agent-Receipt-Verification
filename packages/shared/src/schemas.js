import { z } from 'zod';
import { TASK_STATUS, EVALUATION_DECISION } from './constants.js';

export const criterionSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  title: z.string().min(2, 'Criterion title must have at least 2 characters'),
  description: z.string().min(5, 'Description must have at least 5 characters'),
  passCondition: z.string().min(3, 'Pass condition must be specified'),
  weight: z.number().min(1).max(10).default(1),
  required: z.boolean().default(true)
});

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Task title is required (min 3 chars)').max(150),
  description: z.string().min(10, 'Task description must provide clear scope (min 10 chars)'),
  requester: z.string().min(3, 'Requester identifier/address is required'),
  assignedAgent: z.string().optional().nullable(),
  deliverableType: z.enum(['URL_REPORT', 'CODE_REPOSITORY', 'TEXT_ANALYSIS', 'DATASET', 'API_ENDPOINT']).default('URL_REPORT'),
  deliverableInstructions: z.string().min(5, 'Deliverable instructions are required'),
  acceptanceCriteria: z.array(criterionSchema).min(1, 'At least one acceptance criterion is required'),
  evidenceRequirements: z.string().min(5, 'Evidence requirements must be stated'),
  deadline: z.string().datetime().optional().nullable(),
  metadata: z.record(z.any()).optional().default({})
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TASK_STATUS)
});

export const createSubmissionSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  submitter: z.string().min(3, 'Submitter identifier/agent ID is required'),
  deliverableUrl: z.string().url('Must be a valid URL (http/https)').optional().nullable().or(z.literal('')),
  deliverableContent: z.string().optional().nullable().or(z.literal('')),
  summary: z.string().min(10, 'Executive summary of completed work is required (min 10 chars)'),
  evidenceUrls: z.array(z.string().url('Evidence item must be a valid URL')).optional().default([]),
  evidenceNotes: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().default({})
}).refine(data => (data.deliverableUrl && data.deliverableUrl.trim().length > 0) || (data.deliverableContent && data.deliverableContent.trim().length > 0), {
  message: 'Either deliverable URL or text deliverable content must be provided',
  path: ['deliverableUrl']
});

export const criterionResultSchema = z.object({
  criterionId: z.string(),
  title: z.string(),
  passed: z.boolean(),
  score: z.number().min(0).max(1).optional(),
  rationale: z.string(),
  evidenceCited: z.array(z.string()).optional().default([])
});

export const evaluateSubmissionSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
  mode: z.enum(['demo', 'contract']).default('demo'),
  forceSimulation: z.boolean().optional().default(false)
});

export const queryFilterSchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  requester: z.string().optional(),
  submitter: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});
