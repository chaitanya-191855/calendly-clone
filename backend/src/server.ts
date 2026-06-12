import dotenv from 'dotenv'
dotenv.config()

import app from './app'
import { pool } from './db/pool'
import { config } from './lib/config'

const server = app.listen(config.port, () => {
  console.log(`[server] Running on http://localhost:${config.port}`)
  console.log(`[server] Environment: ${config.nodeEnv}`)
})

// Graceful shutdown — close pool before exiting
async function shutdown(signal: string) {
  console.log(`[server] ${signal} received — shutting down gracefully`)
  server.close(async () => {
    await pool.end()
    console.log('[server] pg pool closed. Bye.')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
