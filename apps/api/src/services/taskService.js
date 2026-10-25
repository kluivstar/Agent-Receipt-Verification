import crypto from 'node:crypto';
import { Repository } from '../db/repository.js';
import { TASK_STATUS } from '@agentreceipt/shared';

export class TaskService {
  constructor(repository = null) {
    this.repo = repository || new Repository();
  }

  createTask(data) {
    const id = 'tsk_' + crypto.randomUUID().substring(0, 12);
    const now = new Date().toISOString();

    const agreementCommitment = '0x' + crypto.createHash('sha256')
      .update(JSON.stringify({
        title: data.title,
        criteria: data.acceptanceCriteria,
        instructions: data.deliverableInstructions,
        requester: data.requester
      }))
      .digest('hex');

    const task = {
      id,
      title: data.title,
      description: data.description,
      requester: data.requester,
      assignedAgent: data.assignedAgent || null,
      deliverableType: data.deliverableType,
      deliverableInstructions: data.deliverableInstructions,
      acceptanceCriteria: data.acceptanceCriteria,
      evidenceRequirements: data.evidenceRequirements,
      deadline: data.deadline || null,
      status: TASK_STATUS.OPEN,
      agreementCommitment,
      metadata: data.metadata || {},
      createdAt: now,
      updatedAt: now
    };

    return this.repo.createTask(task);
  }

  getTask(id) {
    const task = this.repo.getTaskById(id);
    if (!task) return null;

    const submissions = this.repo.getSubmissionsByTaskId(id);
    const receipt = this.repo.getReceiptByTaskId(id);
    const evaluations = this.repo.getEvaluationsByTaskId(id);

    return {
      ...task,
      submissions,
      evaluations,
      receipt
    };
  }

  listTasks(filters) {
    return this.repo.listTasks(filters);
  }

  getMetrics() {
    return this.repo.getTaskMetrics();
  }

  updateStatus(id, status) {
    const task = this.repo.getTaskById(id);
    if (!task) {
      throw new Error(`Task '${id}' not found`);
    }
    return this.repo.updateTaskStatus(id, status);
  }
}

export const taskService = new TaskService();
