import { Router } from 'express';
import { genlayerService } from '../services/genlayerService.js';
import { config } from '../config/index.js';
import { SUPPORTED_NETWORKS } from '@agentreceipt/shared';

const router = Router();

// GET /api/v1/config/network
router.get('/network', (req, res) => {
  const status = genlayerService.getNetworkStatus();
  res.json({
    success: true,
    data: {
      ...status,
      supportedNetworks: SUPPORTED_NETWORKS
    }
  });
});

export default router;
