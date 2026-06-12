import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from './lib/config'
import { generalLimiter } from './middleware/rateLimit'
import { errorHandler } from './middleware/errorHandler'
import eventTypesRouter from './routes/eventTypes.router'
import availabilityRouter from './routes/availability.router'
import bookRouter from './routes/book.router'
import meetingsRouter from './routes/meetings.router'

const app = express()

// Trust first proxy (Render / Railway behind load balancer)
app.set('trust proxy', 1)

// Security headers
app.use(helmet())

// CORS — only allow the configured frontend origin
app.use(
  cors({
    origin: config.frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  }),
)

// Body parsing with size limit
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Request logging in non-test environments
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'))
}

// Global rate limiter
app.use('/api', generalLimiter)

// Health check (useful for Render / CI)
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// Routes — each layer calls only its neighbour
app.use('/api/event-types', eventTypesRouter)
app.use('/api/availability', availabilityRouter)
app.use('/api/book',         bookRouter)
app.use('/api/meetings',     meetingsRouter)

// Global error handler — must be last
app.use(errorHandler)

export default app
