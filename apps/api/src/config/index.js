import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env first, then local .env if present
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databasePath: process.env.DATABASE_PATH || path.resolve(__dirname, '../../data/agentreceipt.sqlite'),
  genlayer: {
    network: process.env.GENLAYER_NETWORK || 'studionet',
    rpcUrl: process.env.GENLAYER_RPC_URL || 'https://studio.genlayer.com/api',
    contractAddress: process.env.GENLAYER_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    operatorPrivateKey: process.env.GENLAYER_OPERATOR_PRIVATE_KEY || null,
  },
  appMode: (process.env.APP_MODE || 'demo').toLowerCase(), // 'demo' or 'live'
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 200
  }
};
