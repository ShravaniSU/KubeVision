import express, { type Request, type Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

import clusterRoutes from './routes/clusters'
import nodeRoutes from './routes/nodes'
import deploymentRoutes from './routes/deployments'
import podRoutes from './routes/pods'
import logRoutes from './routes/logs'
import metricRoutes from './routes/metrics'
import releaseRoutes from './routes/releases'
import blueGreenRoutes from './routes/blueGreen'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { metricsRegistry, prometheusMiddleware } from './lib/prometheus'
import k8sRoutes from './routes/k8s';

dotenv.config()

const app = express()
const origin = process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173']

app.use(cors({ origin }))
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(prometheusMiddleware)

app.get('/api/health', (_req: Request, res: Response) => {
  return res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/metrics', async (_req: Request, res: Response) => {
  res.set('Content-Type', metricsRegistry.contentType)
  res.send(await metricsRegistry.metrics())
})

app.use('/api/clusters', clusterRoutes)
app.use('/api/nodes', nodeRoutes)
app.use('/api/deployments', deploymentRoutes)
app.use('/api', podRoutes)
app.use('/api', logRoutes)
app.use('/api/metrics', metricRoutes)
app.use('/api', releaseRoutes)
app.use('/api/bluegreen', blueGreenRoutes)
app.use('/api/k8s', k8sRoutes)
app.use(notFoundHandler)
app.use(errorHandler)

export default app
