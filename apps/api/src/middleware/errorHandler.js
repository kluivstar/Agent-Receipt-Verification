export function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  const requestId = req.id || 'unknown';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] [${requestId}] ${err.stack || err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    requestId,
    error: {
      code: err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR'),
      message: err.message || 'An unexpected server error occurred',
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    }
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    requestId: req.id,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} not found`
    }
  });
}
