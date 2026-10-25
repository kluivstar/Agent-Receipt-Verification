import crypto from 'node:crypto';
import { Repository } from '../db/repository.js';
import { TASK_STATUS, SUBMISSION_STATUS } from '@agentreceipt/shared';
import { validateSafeUrl } from './ssrfValidator.js';

export class SubmissionService {
  constructor(repository = null) {
    this.repo = repository || new Repository();
  }

  async createSubmission(data) {
    const task = this.repo.getTaskById(data.taskId);
    if (!task) {
      throw new Error(`Task '${data.taskId}' not found`);
    }

    if (task.status === TASK_STATUS.ACCEPTED) {
      throw new Error(`Task '${data.taskId}' has already been completed and accepted. No further submissions are permitted.`);
    }

    if (task.status === TASK_STATUS.CANCELLED) {
      throw new Error(`Task '${data.taskId}' is cancelled.`);
    }

    // SSRF verification for deliverable URL if supplied
    if (data.deliverableUrl && data.deliverableUrl.trim().length > 0) {
      const check = await validateSafeUrl(data.deliverableUrl);
      if (!check.safe) {
        throw new Error(`Security validation failed for deliverable URL: ${check.reason}`);
      }
    }

    // SSRF verification for all evidence URLs
    if (Array.isArray(data.evidenceUrls)) {
      for (const url of data.evidenceUrls) {
        const check = await validateSafeUrl(url);
        if (!check.safe) {
          throw new Error(`Security validation failed for evidence URL '${url}': ${check.reason}`);
        }
      }
    }

    const id = 'sub_' + crypto.randomUUID().substring(0, 12);
    const now = new Date().toISOString();

    const submissionCommitment = '0x' + crypto.createHash('sha256')
      .update(JSON.stringify({
        taskId: data.taskId,
        submitter: data.submitter,
        deliverableUrl: data.deliverableUrl || null,
        deliverableContent: data.deliverableContent || null,
        evidenceUrls: data.evidenceUrls || []
      }))
      .digest('hex');

    const submission = {
      id,
      taskId: data.taskId,
      submitter: data.submitter,
      deliverableUrl: data.deliverableUrl || null,
      deliverableContent: data.deliverableContent || null,
      summary: data.summary,
      evidenceUrls: data.evidenceUrls || [],
      evidenceNotes: data.evidenceNotes || null,
      submissionCommitment,
      metadata: data.metadata || {},
      status: SUBMISSION_STATUS.PENDING,
      createdAt: now,
      updatedAt: now
    };

    const saved = this.repo.createSubmission(submission);

    // Transition task status to SUBMITTED
    this.repo.updateTaskStatus(task.id, TASK_STATUS.SUBMITTED);

    return saved;
  }

  getSubmission(id) {
    const submission = this.repo.getSubmissionById(id);
    if (!submission) return null;
    const task = this.repo.getTaskById(submission.taskId);
    const evaluation = this.repo.getEvaluationBySubmissionId(id);
    return {
      ...submission,
      task,
      evaluation
    };
  }

  getSubmissionsForTask(taskId) {
    return this.repo.getSubmissionsByTaskId(taskId);
  }
}

export const submissionService = new SubmissionService();
