import fs from 'fs'
import path from 'path'
import { pool } from './pool'

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations')
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  if (files.length === 0) {
    console.log('[migrate] No migration files found.')
    return
  }

  for (const file of files) {
    const filePath = path.join(migrationsDir, file)
    const sql = fs.readFileSync(filePath, 'utf-8')

    console.log(`[migrate] Running: ${file}`)

    try {
      await pool.query(sql)
    } catch (err: any) {
      // Gracefully skip "already exists" errors so migrations are re-runnable
      if (
        err.code === '42P07' || // relation already exists
        err.code === '42710' || // object already exists
        err.code === '42723'    // function already exists
      ) {
        console.warn(`  [skip] ${err.message.split('\n')[0]}`)
      } else {
        console.error(`  [error] Failed on file: ${file}\n${err.message}`)
        throw err
      }
    }

    console.log(`  [done]  ${file}`)
  }

  console.log('[migrate] All migrations completed.')
}

runMigrations()
  .catch((err) => {
    console.error('[migrate] Fatal error:', err)
    process.exit(1)
  })
  .finally(() => pool.end())
