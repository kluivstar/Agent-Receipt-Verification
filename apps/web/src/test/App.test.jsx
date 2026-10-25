import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { ReceiptViewer } from '../components/ReceiptViewer.jsx';

// Mock API calls
vi.mock('../lib/api.js', () => ({
  api: {
    getHealth: vi.fn().mockResolvedValue({ success: true }),
    getNetworkConfig: vi.fn().mockResolvedValue({
      data: {
        network: 'studionet',
        chainName: 'GenLayer StudioNet',
        chainId: 61999,
        appMode: 'demo',
        isConfigured: true
      }
    }),
    getMetrics: vi.fn().mockResolvedValue({
      data: { total: 4, ACCEPTED: 1, REJECTED: 1, NEEDS_REVIEW: 1, totalReceipts: 3 }
    }),
    listTasks: vi.fn().mockResolvedValue({ data: [] }),
    listReceipts: vi.fn().mockResolvedValue({ data: [] })
  }
}));

describe('AgentReceipt Frontend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders landing page with headline and primary CTA', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Every Agent Task/i)).toBeInTheDocument();
    expect(screen.getByText(/Deserves a Receipt/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create a Task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explore Demo Dashboard/i })).toBeInTheDocument();
  });

  it('renders receipt viewer with decision, commitments, and 4-point verification', () => {
    const mockReceipt = {
      id: 'rcpt_test_123',
      taskId: 'tsk_test_456',
      decision: 'ACCEPTED',
      agreementCommitment: '0x1234567890abcdef',
      submissionCommitment: '0xfedcba0987654321',
      networkIdentifier: 'studionet-simulator',
      transactionHash: '0xsim_mocktxhash',
      createdAt: new Date().toISOString(),
      evaluation: {
        rationale: 'All criteria passed with complete log evidence.',
        evaluationMethod: 'LOCAL_SIMULATOR',
        perCriterionResults: [
          {
            criterionId: 'c1',
            title: 'Latency Threshold',
            passed: true,
            score: 0.98,
            rationale: 'Observed p95 latency was 48ms',
            evidenceCited: ['https://example.com/logs.json']
          }
        ]
      },
      verificationSummary: {
        applicationRecordFound: true,
        onChainVerified: true,
        evidenceCount: 1,
        checksNote: 'Verified on ledger.'
      }
    };

    render(<ReceiptViewer receipt={mockReceipt} />);

    expect(screen.getByText(/Deliverable Accepted & Verified/i)).toBeInTheDocument();
    expect(screen.getByText(/4-Point Receipt Verification Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Latency Threshold/i)).toBeInTheDocument();
    expect(screen.getByText(/0x1234567890abcdef/i)).toBeInTheDocument();
  });

  it('renders dashboard with protocol metrics', async () => {
    render(
      <MemoryRouter initialEntries={['/app']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Protocol Overview/i)).toBeInTheDocument();
    expect(await screen.findByText(/Tasks Created/i)).toBeInTheDocument();
    expect(await screen.findByText(/Audit Receipts/i)).toBeInTheDocument();
  });
});
