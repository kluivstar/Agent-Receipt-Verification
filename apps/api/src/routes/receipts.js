import { Router } from 'express';
import { receiptService } from '../services/receiptService.js';
import { validateQuery } from '../middleware/validate.js';
import { queryFilterSchema } from '@agentreceipt/shared';

const router = Router();

// GET /api/v1/receipts
router.get('/', validateQuery(queryFilterSchema), (req, res, next) => {
  try {
    const list = receiptService.listReceipts(req.query);
    res.json({
      success: true,
      data: list.items,
      pagination: list.pagination
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/receipts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const receipt = await receiptService.getReceipt(req.params.id);
    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: { code: 'RECEIPT_NOT_FOUND', message: `Receipt '${req.params.id}' was not found.` }
      });
    }
    res.json({ success: true, data: receipt });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/receipts/:id/export
router.get('/:id/export', async (req, res, next) => {
  try {
    const exported = await receiptService.exportReceiptJson(req.params.id);
    if (!exported) {
      return res.status(404).json({
        success: false,
        error: { code: 'RECEIPT_NOT_FOUND', message: `Receipt '${req.params.id}' was not found.` }
      });
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="agentreceipt-${req.params.id}.json"`);
    res.json(exported);
  } catch (err) {
    next(err);
  }
});

export default router;
