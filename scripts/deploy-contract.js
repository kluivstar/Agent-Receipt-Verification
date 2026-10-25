import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient, createAccount, chains } from 'genlayer-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function deploy() {
  console.log('--- GenLayer Intelligent Contract Deployment ---');

  const networkName = process.env.GENLAYER_NETWORK || 'studionet';
  const privateKey = process.env.GENLAYER_OPERATOR_PRIVATE_KEY;
  const chain = chains[networkName] || chains.studionet;

  if (!privateKey) {
    console.error('Error: GENLAYER_OPERATOR_PRIVATE_KEY is not set in .env.');
    console.log('To deploy to a live GenLayer network, configure an account private key with testnet GEN.');
    process.exit(1);
  }

  const account = createAccount(privateKey);
  const client = createClient({
    chain,
    account
  });

  const contractPath = path.resolve(__dirname, '../contracts/agent_receipt_verifier.py');
  if (!fs.existsSync(contractPath)) {
    console.error('Contract file not found at:', contractPath);
    process.exit(1);
  }

  const contractCode = fs.readFileSync(contractPath, 'utf8');
  console.log(`Connecting to ${chain.name} (Chain ID: ${chain.id})...`);
  console.log(`Deployer Account: ${account.address}`);
  console.log('Submitting contract bytecode to GenVM...');

  try {
    const txHash = await client.deployContract({
      code: contractCode,
      args: []
    });

    console.log(`Deployment transaction submitted: ${txHash}`);
    console.log('Waiting for validator equivalence consensus and state finalization...');

    let receipt;
    if (typeof client.waitForFinalization === 'function') {
      receipt = await client.waitForFinalization({ hash: txHash });
    } else {
      receipt = await client.waitForTransactionReceipt({ hash: txHash });
    }

    const deployedAddress = receipt.contractAddress;
    console.log(`\nSUCCESS: Contract deployed at address: ${deployedAddress}`);
    console.log(`View on Explorer: ${chain.blockExplorers?.default?.url || 'https://genlayer-explorer.vercel.app'}`);
    console.log(`\nNext Step: Set GENLAYER_CONTRACT_ADDRESS=${deployedAddress} and APP_MODE=live in your .env file.`);
  } catch (err) {
    console.error('Deployment failed:', err.message || err);
    process.exit(1);
  }
}

deploy();
