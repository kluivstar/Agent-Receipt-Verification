import crypto from 'node:crypto';

export function requestLogger(req, res, next) {
  const reqId = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip || req.socket?.remoteAddress
    };
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[REQ] ${logData.method} ${logData.path} ${logData.status} ${logData.durationMs}ms - ID: ${logData.requestId}`);
    }
  });

  next();
}
