import client from 'prom-client';
import { Request, Response, NextFunction } from 'express';

client.collectDefaultMetrics({ prefix: 'kubevision_' });

export const metricsRegistry = client.register;

export const httpRequestDuration = new client.Histogram({
  name: 'kubevision_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export function prometheusMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe(
      { method: req.method, route: req.path, status_code: res.statusCode.toString() },
      duration
    );
  });
  next();
}