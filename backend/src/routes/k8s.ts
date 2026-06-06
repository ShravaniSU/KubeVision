import { Router, Request, Response } from 'express';
import {
  getCluster,
  getNodes,
  getDeployments,
  getPods,
  getPodLogs,
  getMetricsHistory,
  getCurrentMetrics,
} from '../services/k8sService';

const router = Router();

// Cluster
router.get('/cluster', async (req: Request, res: Response) => {
  try {
    const data = await getCluster();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Nodes
router.get('/nodes', async (req: Request, res: Response) => {
  try {
    const data = await getNodes();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Deployments
router.get('/deployments', async (req: Request, res: Response) => {
  try {
    const data = await getDeployments();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Pods — all or filtered by deployment
router.get('/pods', async (req: Request, res: Response) => {
  try {
    const deployment = req.query.deployment as string | undefined;
    const data = await getPods(deployment);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Pod logs
router.get('/pods/:podName/logs', async (req: Request, res: Response) => {
  try {
    const lines = parseInt(req.query.lines as string) || 100;
    const data = await getPodLogs(req.params.podName, lines);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Metrics — current snapshot
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const data = await getCurrentMetrics();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Metrics — history for charts
router.get('/metrics/history', async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const data = await getMetricsHistory(hours);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;