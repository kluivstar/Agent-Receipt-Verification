import { getDatabase } from './index.js';
import { Repository } from './repository.js';
import { TASK_STATUS, SUBMISSION_STATUS, EVALUATION_DECISION, EVALUATION_METHOD, RECEIPT_STATUS } from '@agentreceipt/shared';
import crypto from 'node:crypto';

export function seedDemoData() {
  const db = getDatabase();
  const repo = new Repository(db);

  // Clear existing demo rows if needed
  db.exec('DELETE FROM receipts;');
  db.exec('DELETE FROM evaluations;');
  db.exec('DELETE FROM submissions;');
  db.exec('DELETE FROM tasks;');

  console.log('[Seed] Seeding realistic AI agent tasks and receipts...');

  // --- 1. ACCEPTED SCENARIO: Vendor Due Diligence & Latency Benchmark ---
  const task1Id = 'tsk_vendor_bench_01';
  const task1Criteria = [
    {
      id: 'crit_lat_01',
      title: 'p95 Latency Threshold',
      description: 'Vendor inference latency must remain under 60ms p95 for a 1k-token prompt benchmark.',
      passCondition: 'p95 latency <= 60ms verified across 500 requests per region.',
      weight: 3,
      required: true
    },
    {
      id: 'crit_sla_02',
      title: 'Contractual SLA Documentation',
      description: 'Vendor must publicly provide an SLA guaranteeing at least 99.9% monthly uptime with automated credits.',
      passCondition: 'SLA document link confirms >=99.9% uptime commit with credit table.',
      weight: 2,
      required: true
    },
    {
      id: 'crit_geo_03',
      title: 'Multi-Region Replication',
      description: 'Inference endpoints must be operational in US-East, EU-Central, and AP-East.',
      passCondition: 'Active health-check responses confirmed across all 3 regions.',
      weight: 2,
      required: true
    }
  ];

  const task1 = repo.createTask({
    id: task1Id,
    title: 'Multi-Region LLM Inference Benchmark & SLA Due Diligence',
    description: 'Autonomous evaluation agent required to benchmark 3 inference vendors for our customer-facing copilot. Evaluate latency, SLA contracts, and multi-region resilience.',
    requester: '0xAgentRequester_Alpha89',
    assignedAgent: '0xInferenceEval_AgentX',
    deliverableType: 'URL_REPORT',
    deliverableInstructions: 'Provide comprehensive benchmark report URL, raw latency distribution logs in JSON format, and official SLA contractual links.',
    acceptanceCriteria: task1Criteria,
    evidenceRequirements: 'Raw CSV/JSON latency runs, HTTP ping traces from 3 global nodes, and vendor terms of service PDF.',
    deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: TASK_STATUS.ACCEPTED,
    agreementCommitment: '0x' + crypto.createHash('sha256').update(JSON.stringify(task1Criteria)).digest('hex'),
    metadata: { domain: 'infrastructure', priority: 'high' },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  });

  const sub1Id = 'sub_vendor_bench_01';
  const sub1 = repo.createSubmission({
    id: sub1Id,
    taskId: task1Id,
    submitter: '0xInferenceEval_AgentX',
    deliverableUrl: 'https://benchmark-reports.agentnet.ai/v1/inference-audit-q4.html',
    deliverableContent: '# Executive Benchmark Summary\nEvaluated Anthropic, Together, and Groq endpoints. All endpoints met the 60ms p95 threshold in US-East and EU-Central with 99.95% documented SLA.',
    summary: 'Executed 1,500 total synthetic prompt invocations across 3 cloud regions. Validated SLA guarantees and verified sub-48ms median latency across all endpoints.',
    evidenceUrls: [
      'https://benchmark-reports.agentnet.ai/data/latency-distribution-2026.json',
      'https://benchmark-reports.agentnet.ai/data/sla-contract-commit.pdf'
    ],
    evidenceNotes: 'Latency logs sampled over 48 continuous hours with zero 5xx server faults.',
    submissionCommitment: '0x' + crypto.createHash('sha256').update('sub1-deliverable-data').digest('hex'),
    metadata: { toolset: 'wrk2-loadtester' },
    status: SUBMISSION_STATUS.EVALUATED,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  });

  const eval1Id = 'eval_vendor_bench_01';
  const eval1 = repo.createEvaluation({
    id: eval1Id,
    taskId: task1Id,
    submissionId: sub1Id,
    evaluationVersion: 1,
    decision: EVALUATION_DECISION.ACCEPTED,
    perCriterionResults: [
      {
        criterionId: 'crit_lat_01',
        title: 'p95 Latency Threshold',
        passed: true,
        score: 0.98,
        rationale: 'Observed p95 latency was 48.2ms, well within the 60ms threshold specified.',
        evidenceCited: ['https://benchmark-reports.agentnet.ai/data/latency-distribution-2026.json']
      },
      {
        criterionId: 'crit_sla_02',
        title: 'Contractual SLA Documentation',
        passed: true,
        score: 0.96,
        rationale: 'SLA appendix verified with 99.95% financial backing guarantee.',
        evidenceCited: ['https://benchmark-reports.agentnet.ai/data/sla-contract-commit.pdf']
      },
      {
        criterionId: 'crit_geo_03',
        title: 'Multi-Region Replication',
        passed: true,
        score: 0.94,
        rationale: '3 out of 3 regional healthcheck clusters confirmed operational.',
        evidenceCited: ['https://benchmark-reports.agentnet.ai/data/latency-distribution-2026.json']
      }
    ],
    rationale: 'All acceptance criteria were rigorously satisfied with verified empirical evidence. Deliverable fully accepted.',
    evidenceReferences: [
      'https://benchmark-reports.agentnet.ai/data/latency-distribution-2026.json',
      'https://benchmark-reports.agentnet.ai/data/sla-contract-commit.pdf'
    ],
    missingEvidence: [],
    confidenceScore: 0.96,
    evaluationMethod: EVALUATION_METHOD.LOCAL_SIMULATOR,
    contractTxReference: null,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  });

  repo.createReceipt({
    id: 'rcpt_bench_accept_99',
    taskId: task1Id,
    submissionId: sub1Id,
    evaluationId: eval1Id,
    decision: EVALUATION_DECISION.ACCEPTED,
    agreementCommitment: task1.agreementCommitment,
    submissionCommitment: sub1.submissionCommitment,
    contractAddress: '0x71C841961e564d26270E455d36e2fFeD97b98218',
    networkIdentifier: 'studionet-simulator',
    transactionHash: '0xsim_7c4d1890ef9923a105f29910ba76cd31ea710298319aa517',
    verificationStatus: RECEIPT_STATUS.ACCEPTED,
    verificationMetadata: {
      evaluator: EVALUATION_METHOD.LOCAL_SIMULATOR,
      isSimulated: true,
      criteriaCount: 3,
      passedCriteriaCount: 3,
      validatorConsensus: 'Local deterministic evaluation simulator run according to GenLayer acceptance rules.',
      evaluatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  });

  // --- 2. REJECTED SCENARIO: Smart Contract Static Analysis ---
  const task2Id = 'tsk_sec_audit_02';
  const task2Criteria = [
    {
      id: 'crit_reent_01',
      title: 'Zero High/Critical Reentrancy',
      description: 'Static analysis must confirm no reentrancy vulnerabilities exist in the vault contract.',
      passCondition: 'Slither check finds zero open reentrancy vulnerabilities.',
      weight: 3,
      required: true
    },
    {
      id: 'crit_cov_02',
      title: 'Branch Test Coverage >= 90%',
      description: 'Automated test suite must provide branch coverage report proving >=90% branches tested.',
      passCondition: 'LCOV HTML or JSON coverage report with >=90.0% branch coverage.',
      weight: 3,
      required: true
    }
  ];

  const task2 = repo.createTask({
    id: task2Id,
    title: 'DeFi Yield Vault Static Security Analysis & Branch Coverage Audit',
    description: 'Audit agent tasked with running automated security tools (Slither, Echidna) and verifying branch test coverage on an ERC-4626 vault implementation.',
    requester: '0xProtocolDAO_Gov',
    assignedAgent: '0xSecAuditor_AgentBot',
    deliverableType: 'CODE_REPOSITORY',
    deliverableInstructions: 'Submit repository PR containing test harness, lcov-report.json, and Slither JSON output.',
    acceptanceCriteria: task2Criteria,
    evidenceRequirements: 'Raw Slither JSON output and test coverage report artifact.',
    deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: TASK_STATUS.REJECTED,
    agreementCommitment: '0x' + crypto.createHash('sha256').update(JSON.stringify(task2Criteria)).digest('hex'),
    metadata: { domain: 'security', priority: 'critical' },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  });

  const sub2Id = 'sub_sec_audit_02';
  const sub2 = repo.createSubmission({
    id: sub2Id,
    taskId: task2Id,
    submitter: '0xSecAuditor_AgentBot',
    deliverableUrl: 'https://github.com/agent-vaults/core-audit-pr-42',
    deliverableContent: '# Security Audit Execution\nRan Slither v0.10.4. No reentrancy discovered. Note: Branch coverage test run timed out on CI runner and was omitted.',
    summary: 'Analyzed all 12 vault contracts. Zero critical reentrancy vulnerabilities. Branch coverage artifacts are currently incomplete due to CI timeout.',
    evidenceUrls: [
      'https://github.com/agent-vaults/core-audit-pr-42/blob/main/slither-output.json'
    ],
    evidenceNotes: 'Branch coverage report missing from artifacts.',
    submissionCommitment: '0x' + crypto.createHash('sha256').update('sub2-deliverable-data').digest('hex'),
    metadata: { ciRunner: 'github-actions' },
    status: SUBMISSION_STATUS.REJECTED,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  });

  const eval2Id = 'eval_sec_audit_02';
  repo.createEvaluation({
    id: eval2Id,
    taskId: task2Id,
    submissionId: sub2Id,
    evaluationVersion: 1,
    decision: EVALUATION_DECISION.REJECTED,
    perCriterionResults: [
      {
        criterionId: 'crit_reent_01',
        title: 'Zero High/Critical Reentrancy',
        passed: true,
        score: 0.95,
        rationale: 'Slither output parsed with 0 reentrancy alerts.',
        evidenceCited: ['https://github.com/agent-vaults/core-audit-pr-42/blob/main/slither-output.json']
      },
      {
        criterionId: 'crit_cov_02',
        title: 'Branch Test Coverage >= 90%',
        passed: false,
        score: 0.15,
        rationale: 'Failed mandatory requirement: LCOV coverage report was missing and branch coverage was not documented.',
        evidenceCited: []
      }
    ],
    rationale: 'Mandatory criterion "Branch Test Coverage >= 90%" failed verification due to missing test coverage artifact. Deliverable rejected.',
    evidenceReferences: [
      'https://github.com/agent-vaults/core-audit-pr-42/blob/main/slither-output.json'
    ],
    missingEvidence: ['Branch Test Coverage >= 90% (lcov-report.json)'],
    confidenceScore: 0.92,
    evaluationMethod: EVALUATION_METHOD.LOCAL_SIMULATOR,
    contractTxReference: null,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  });

  repo.createReceipt({
    id: 'rcpt_audit_reject_44',
    taskId: task2Id,
    submissionId: sub2Id,
    evaluationId: eval2Id,
    decision: EVALUATION_DECISION.REJECTED,
    agreementCommitment: task2.agreementCommitment,
    submissionCommitment: sub2.submissionCommitment,
    contractAddress: '0x71C841961e564d26270E455d36e2fFeD97b98218',
    networkIdentifier: 'studionet-simulator',
    transactionHash: '0xsim_991823a01ffbe872391283c749281a8b3019842183e871',
    verificationStatus: RECEIPT_STATUS.REJECTED,
    verificationMetadata: {
      evaluator: EVALUATION_METHOD.LOCAL_SIMULATOR,
      isSimulated: true,
      criteriaCount: 2,
      passedCriteriaCount: 1,
      validatorConsensus: 'Local deterministic evaluation simulator run according to GenLayer acceptance rules.',
      evaluatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  });

  // --- 3. NEEDS REVIEW SCENARIO: Quantitative Backtest ---
  const task3Id = 'tsk_quant_model_03';
  const task3Criteria = [
    {
      id: 'crit_sharpe_01',
      title: 'Out-of-Sample Sharpe Ratio > 1.80',
      description: 'The strategy must demonstrate an annualized out-of-sample Sharpe ratio exceeding 1.80 on ETH/USDC 1-minute candle bars.',
      passCondition: 'Backtest metrics JSON indicates Sharpe >= 1.80.',
      weight: 3,
      required: true
    },
    {
      id: 'crit_drawdown_02',
      title: 'Maximum Drawdown < 12%',
      description: 'Historical peak-to-trough drawdown must not exceed 12% across the entire 12-month test window.',
      passCondition: 'Maximum recorded drawdown < 12.0%.',
      weight: 2,
      required: true
    }
  ];

  const task3 = repo.createTask({
    id: task3Id,
    title: 'ETH/USDC High-Frequency Orderbook Arbitrage Strategy Backtest',
    description: 'Algorithmic trading firm requires automated backtest evaluation of an agent-generated statistical arbitrage model incorporating 10bps exchange fee schedules.',
    requester: '0xAlphaCapital_QuantDesk',
    assignedAgent: '0xQuantResearcher_Agent7',
    deliverableType: 'TEXT_ANALYSIS',
    deliverableInstructions: 'Provide complete backtest summary and link to serialized vector backtest metrics.',
    acceptanceCriteria: task3Criteria,
    evidenceRequirements: 'Serialized portfolio equity curve JSON and transaction logs.',
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: TASK_STATUS.NEEDS_REVIEW,
    agreementCommitment: '0x' + crypto.createHash('sha256').update(JSON.stringify(task3Criteria)).digest('hex'),
    metadata: { domain: 'quantitative-finance', frequency: '1m' },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 0.5).toISOString()
  });

  const sub3Id = 'sub_quant_model_03';
  const sub3 = repo.createSubmission({
    id: sub3Id,
    taskId: task3Id,
    submitter: '0xQuantResearcher_Agent7',
    deliverableUrl: 'https://quant-vault.agentnet.ai/backtests/eth-stat-arb-run-09.json',
    deliverableContent: '# Strategy Backtest Results\nExecuted over 2025-2026 out-of-sample window. Annualized Sharpe: 1.78. Max drawdown: 8.4%. Note: Sharpe is within 1% of the 1.80 target.',
    summary: 'Model yielded 1.78 annualized Sharpe ratio with 8.4% max drawdown. High market volatility in November slightly compressed Sharpe, but overall capital protection held.',
    evidenceUrls: [
      'https://quant-vault.agentnet.ai/equity-curves/run-09-equity.csv'
    ],
    evidenceNotes: 'Equity curve demonstrates resilience during major market drawdowns.',
    submissionCommitment: '0x' + crypto.createHash('sha256').update('sub3-deliverable-data').digest('hex'),
    metadata: { backtestEngine: 'vectorbt' },
    status: SUBMISSION_STATUS.EVALUATING,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 0.5).toISOString()
  });

  const eval3Id = 'eval_quant_model_03';
  repo.createEvaluation({
    id: eval3Id,
    taskId: task3Id,
    submissionId: sub3Id,
    evaluationVersion: 1,
    decision: EVALUATION_DECISION.NEEDS_REVIEW,
    perCriterionResults: [
      {
        criterionId: 'crit_sharpe_01',
        title: 'Out-of-Sample Sharpe Ratio > 1.80',
        passed: false,
        score: 0.72,
        rationale: 'Observed Sharpe ratio is 1.78 against requested target > 1.80. Outcome is borderline and within statistical error margin.',
        evidenceCited: ['https://quant-vault.agentnet.ai/equity-curves/run-09-equity.csv']
      },
      {
        criterionId: 'crit_drawdown_02',
        title: 'Maximum Drawdown < 12%',
        passed: true,
        score: 0.96,
        rationale: 'Maximum drawdown measured at 8.4%, well below the 12% maximum boundary.',
        evidenceCited: ['https://quant-vault.agentnet.ai/equity-curves/run-09-equity.csv']
      }
    ],
    rationale: 'Sharpe ratio achieved was 1.78 (target > 1.80). Because drawdown and risk metrics are favorable, case is flagged for human or senior agent adjudication.',
    evidenceReferences: [
      'https://quant-vault.agentnet.ai/equity-curves/run-09-equity.csv'
    ],
    missingEvidence: [],
    confidenceScore: 0.68,
    evaluationMethod: EVALUATION_METHOD.LOCAL_SIMULATOR,
    contractTxReference: null,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString()
  });

  repo.createReceipt({
    id: 'rcpt_quant_review_12',
    taskId: task3Id,
    submissionId: sub3Id,
    evaluationId: eval3Id,
    decision: EVALUATION_DECISION.NEEDS_REVIEW,
    agreementCommitment: task3.agreementCommitment,
    submissionCommitment: sub3.submissionCommitment,
    contractAddress: '0x71C841961e564d26270E455d36e2fFeD97b98218',
    networkIdentifier: 'studionet-simulator',
    transactionHash: '0xsim_110293fa001bbcf8892120349a18d184001920491823',
    verificationStatus: RECEIPT_STATUS.NEEDS_REVIEW,
    verificationMetadata: {
      evaluator: EVALUATION_METHOD.LOCAL_SIMULATOR,
      isSimulated: true,
      criteriaCount: 2,
      passedCriteriaCount: 1,
      validatorConsensus: 'Local deterministic evaluation simulator run according to GenLayer acceptance rules.',
      evaluatedAt: new Date(Date.now() - 86400000 * 0.5).toISOString()
    },
    createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString()
  });

  // --- 4. OPEN TASK (Ready for user to submit a deliverable!) ---
  const task4Id = 'tsk_open_ai_eval_04';
  const task4Criteria = [
    {
      id: 'crit_open_01',
      title: 'Comprehensive Vendor Matrix',
      description: 'Deliverable must include a side-by-side comparison table evaluating pricing, context window, and throughput across 3 AI agent frameworks.',
      passCondition: 'Table contains at least 3 frameworks with price and throughput columns.',
      weight: 2,
      required: true
    },
    {
      id: 'crit_open_02',
      title: 'Verifiable Evidence Links',
      description: 'At least one publicly verifiable benchmark or documentation URL must be provided in evidence.',
      passCondition: 'Evidence array includes at least one valid HTTP/HTTPS URL.',
      weight: 2,
      required: true
    }
  ];

  repo.createTask({
    id: task4Id,
    title: 'Autonomous Agent Framework Comparative Evaluation (Open)',
    description: 'We need an independent agent to benchmark CrewAI, AutoGen, and LangGraph for autonomous decision accuracy. Ready for submission and verification.',
    requester: '0xResearchLead_AgentNet',
    assignedAgent: null, // open for any agent
    deliverableType: 'URL_REPORT',
    deliverableInstructions: 'Provide markdown comparison report or public research URL with latency benchmarks and framework recommendations.',
    acceptanceCriteria: task4Criteria,
    evidenceRequirements: 'Links to benchmark scripts or framework documentation.',
    deadline: new Date(Date.now() + 86400000 * 10).toISOString(),
    status: TASK_STATUS.OPEN,
    agreementCommitment: '0x' + crypto.createHash('sha256').update(JSON.stringify(task4Criteria)).digest('hex'),
    metadata: { domain: 'agent-frameworks', difficulty: 'medium' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  console.log('[Seed] Demo data seeding complete! 4 tasks (Accepted, Rejected, Needs Review, Open), 3 submissions, 3 receipts.');
}

// Run directly if called as a script
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDemoData();
}
