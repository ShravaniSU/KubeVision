import dotenv from 'dotenv'
import app from './app'
//import { startMetricsSimulator } from './jobs/metricsSimulator'

dotenv.config()

//startMetricsSimulator()

const port = Number(process.env.PORT ?? 3001)

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`)
})
