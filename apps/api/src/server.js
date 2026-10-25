import { createApp } from './app.js';
import { config } from './config/index.js';
import { getDatabase } from './db/index.js';

const app = createApp();

// Initialize DB schema on start
getDatabase();

const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(` AgentReceipt API Server running on port ${config.port}`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` App Mode:    ${config.appMode}`);
  console.log(` GenLayer:    ${config.genlayer.network} (${config.genlayer.contractAddress})`);
  console.log(` DB Path:     ${config.databasePath}`);
  console.log(`===============================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
