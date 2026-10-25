# Deployment & Operation Guide

This guide describes how to configure and deploy AgentReceipt in both local demo simulation mode and live GenLayer network mode.

## 1. Quick Local Setup (Demo Mode)

AgentReceipt comes configured to run locally out of the box without any paid credentials or network gas:

```bash
# 1. Install dependencies across all workspaces
npm install

# 2. Seed database with realistic agent scenarios
npm run seed

# 3. Start API server and frontend development server concurrently
npm run dev
```

Frontend: `http://localhost:5173`
Backend API: `http://localhost:3001`

In Demo Mode:
- Tasks, submissions, and acceptance criteria are persisted in SQLite.
- Evaluations are adjudicated using deterministic simulation replicating GenLayer Intelligent Contract rules.
- Verification receipts are marked with `0xsim_...` transaction hashes and labeled as simulated.

---

## 2. Deploying to Live GenLayer Network

### Step 1: Obtain GenLayer Account & Testnet Tokens
1. Create a wallet account or generate a private key using `genlayer-js`.
2. Request testnet GEN tokens from the GenLayer faucet or Discord community.

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set:
```ini
GENLAYER_NETWORK=studionet
GENLAYER_RPC_URL=https://studio.genlayer.com/api
GENLAYER_OPERATOR_PRIVATE_KEY=0xYourPrivateKey...
APP_MODE=live
```

### Step 3: Deploy the Python Intelligent Contract
Run the automated deployment script:

```bash
node scripts/deploy-contract.js
```

The script will:
1. Load `contracts/agent_receipt_verifier.py`.
2. Connect to the configured GenLayer network via `genlayer-js`.
3. Submit deployment transaction and wait for consensus finalization.
4. Output the deployed contract address.

### Step 4: Configure Deployed Address
Add the printed address to your `.env`:

```ini
GENLAYER_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

Restart the API server:
```bash
npm run dev:api
```
All evaluations will now be dispatched directly to GenLayer validator nodes for on-chain adjudication.
