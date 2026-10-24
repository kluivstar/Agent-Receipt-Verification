# AgentReceipt

> **A GenLayer-Powered Verification Protocol for Autonomous AI Agents**

AgentReceipt is a decentralized verification and adjudication layer for the agentic economy. When AI agents delegate tasks to other agents, completed work requires independent, auditable verification against agreed-upon criteria before acceptance and settlement.

AgentReceipt binds tasks to cryptographic acceptance commitments, evaluates submissions using a **GenLayer Intelligent Contract** with decentralized LLM equivalence consensus, and produces auditable, exportable verification receipts.

---

## Features

- **Verifiable Agreements**: Requesters commit to structured acceptance criteria with explicit pass conditions and weights before submission. Pre-submission commitments are hashed using SHA-256 (`agreementCommitment`).
- **SSRF-Protected Evidence Ingestion**: Worker agents submit deliverable URLs and evidence links. External links are protected against SSRF by validating HTTP/HTTPS protocols, resolving DNS records, and blocking private, loopback, and link-local IP addresses.
- **GenLayer Intelligent Contract Adjudication**: Executes non-deterministic LLM assessment inside GenLayer's GenVM equivalence principle sandbox (`gl.eq_principle.prompt_non_comparative`), reaching validator consensus on structured outcomes.
- **Auditable Receipts**: Produces cryptographically bound receipts with a **4-Point Verification Status**:
  1. Application Record Found
  2. Ledger / On-Chain Verification
  3. Evidence Artifact Inspection
  4. Cryptographic Commitment Binding
- **Exportable Receipts**: Export audit-grade JSON receipts for integration into escrow smart contracts, DAOs, or agent orchestrators.
- **Developer-Tool Aesthetics**: Built to the visual standards of Linear, Stripe, and Vercel with a charcoal dark mode, crisp typography, and Lucide icons.
- **Isolated Demo & Live Modes**: Operates in full offline Demo Simulation mode out of the box, with seamless configuration for live GenLayer StudioNet / Bradbury testnets.

---

## Monorepo Architecture

```
agentreceipt/
├── apps/
│   ├── web/                    # React 18, Vite, Tailwind CSS, Lucide React
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI & ReceiptViewer & ContractInspector
│   │   │   ├── pages/          # Landing, Dashboard, Task List, Detail, Submit, Receipts
│   │   │   └── lib/            # API client and constants
│   │   └── dist/               # Production build bundle
│   └── api/                    # Node.js, Express, native SQLite, Zod, Helmet
│       ├── src/
│       │   ├── config/         # Environment configuration
│       │   ├── db/             # Schema, SQLite sync connection, modular repository, seed
│       │   ├── services/       # Task, Submission, Evaluation, Receipt, SSRF, GenLayer
│       │   ├── routes/         # Versioned REST endpoints (/api/v1)
│       │   └── middleware/     # Rate limiting, logger, validation, error handler
│       └── tests/              # Supertest & Vitest API integration tests
├── contracts/
│   └── agent_receipt_verifier.py  # GenLayer Python Intelligent Contract
├── tests/
│   └── contracts/              # Python pytest suite testing the Intelligent Contract
├── packages/
│   └── shared/                 # Shared schemas, Zod validators, and constants
├── docs/                       # Architecture, GenLayer Protocol, and Deployment specs
├── scripts/
│   └── deploy-contract.js      # Automated GenLayer deployment script
├── .env.example
├── package.json
└── README.md
```

---

## Prerequisites

- **Node.js**: `v20.x` or later (tested on `v24.13.0` with native `node:sqlite`).
- **Python**: `3.10`+ (tested on `3.12.8` with `pytest 9.1.1` for contract test suite).
- **npm**: `v10.x` or later.

---

## Quickstart (Local Demo Mode)

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize and Seed the Database
Seed the database with realistic AI agent scenarios (Vendor Latency Benchmark, Security Audit, Quant Backtest, Open AI Evaluation):
```bash
npm run seed
```

### 3. Run the Development Servers
```bash
npm run dev
```
- **Web App**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:3001](http://localhost:3001)
- **API Health Check**: [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health)

---

## Testing

### Run All Tests
```bash
# Contract Tests (Python pytest)
python -m pytest tests/contracts -v

# API Integration Tests (Vitest + Supertest)
npm run test:api

# Frontend Component & Route Tests (Vitest + React Testing Library)
npm run test:web
```

All 7 Python contract tests, 13 API integration tests, and frontend UI tests pass with 100% test success.

---

## GenLayer Intelligent Contract (`contracts/agent_receipt_verifier.py`)

The verification contract runs on GenVM:

```python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class AgentReceiptVerifier(gl.Contract):
    owner: Address
    tasks: dict[str, dict]
    submissions: dict[str, dict]
    evaluations: dict[str, dict]
    receipts: dict[str, dict]

    @gl.public.write
    def register_task(self, task_id: str, title: str, ...):
        ...

    @gl.public.write
    def submit_deliverable(self, task_id: str, submission_id: str, ...):
        ...

    @gl.public.write
    def evaluate_submission(self, task_id: str, submission_id: str) -> str:
        # Non-deterministic LLM assessment inside equivalence principle
        def run_assessment():
            prompt = f"Evaluate deliverable against criteria..."
            return gl.nondet.exec_prompt(prompt, response_format="json")

        result_json = gl.eq_principle.prompt_non_comparative(
            run_assessment,
            criteria="Validators must agree on whether required criteria passed."
        )
        ...
```

---

## Deploying to a Live GenLayer Network

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure your private key and network:
   ```ini
   GENLAYER_NETWORK=studionet
   GENLAYER_RPC_URL=https://studio.genlayer.com/api
   GENLAYER_OPERATOR_PRIVATE_KEY=0xYourPrivateKeyWithGEN...
   APP_MODE=live
   ```
3. Deploy the contract:
   ```bash
   node scripts/deploy-contract.js
   ```
4. Copy the resulting contract address into your `.env`:
   ```ini
   GENLAYER_CONTRACT_ADDRESS=0xYourDeployedAddress
   ```
5. Restart the API server:
   ```bash
   npm run dev:api
   ```

---

## REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/health` | `GET` | Health check and system mode |
| `/api/v1/config/network` | `GET` | GenLayer network and chain config status |
| `/api/v1/tasks` | `GET` | Filter and paginate tasks (`status`, `search`, `page`, `limit`) |
| `/api/v1/tasks` | `POST` | Create a new task with validated acceptance criteria |
| `/api/v1/tasks/metrics` | `GET` | Summary statistics of task statuses and verified receipts |
| `/api/v1/tasks/:id` | `GET` | Retrieve task details, submissions, and receipt |
| `/api/v1/submissions` | `POST` | Submit deliverable URL/text with SSRF-protected evidence links |
| `/api/v1/evaluations` | `POST` | Adjudicate submission via GenLayer Intelligent Contract |
| `/api/v1/receipts` | `GET` | Filter and list all verification receipts |
| `/api/v1/receipts/:id` | `GET` | Full audit receipt with 4-point verification status |
| `/api/v1/receipts/:id/export`| `GET` | Download JSON receipt |

---

## Security & Fairness Guarantees

- **SSRF Protection**: URL ingestion enforces HTTP/HTTPS, resolves DNS records, and strictly blocks private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`, CGNAT, and link-local IPv6).
- **State Machine Integrity**: Completed accepted tasks are locked against duplicate submissions or retroactive criteria modification.
- **Clear Demarcation**: Simulated demo receipts are tagged with `0xsim_...` and explicitly labeled as simulated, distinguishing them from verified on-chain transactions.

---

## License

MIT
