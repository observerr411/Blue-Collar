// Entry point for BlueCollar API
import express from 'express'
import cors from 'cors'
import { corsConfig } from './config/cors.js'
import authRoutes from './routes/auth.js'
import categoryRoutes from './routes/categories.js'
import workerRoutes from './routes/workers.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors(corsConfig))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/workers', workerRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'bluecollar-api' })
})

app.listen(PORT, () => {
  console.log(`BlueCollar API running on port ${PORT}`)
})

export default app
