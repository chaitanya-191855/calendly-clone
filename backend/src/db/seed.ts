import { pool } from './pool'
import dotenv from 'dotenv'

dotenv.config()

async function seed() {
  console.log('[seed] Starting...')

  // ── User ──────────────────────────────────────────────────────────────────
  const userResult = await pool.query<{ id: string }>(
    `INSERT INTO users (name, email, timezone)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    ['Alex Johnson', 'alex@example.com', 'America/New_York'],
  )
  const userId = userResult.rows[0].id
  console.log(`[seed] User: ${userId}`)

  // Write DEFAULT_USER_ID to .env hint if not set
  if (!process.env.DEFAULT_USER_ID) {
    console.log(`[seed] ⚠  Set DEFAULT_USER_ID=${userId} in your backend/.env`)
  }

  // ── Event Types ───────────────────────────────────────────────────────────
  const eventTypes = [
    { name: 'Quick Chat',              slug: 'quick-chat',   duration: 15, color: '#006BFF' },
    { name: '30 Minute Meeting',       slug: '30min',        duration: 30, color: '#00A2FF' },
    { name: '60 Minute Consultation',  slug: 'consultation', duration: 60, color: '#8B5CF6' },
  ]

  const etIds: Record<string, string> = {}
  for (const et of eventTypes) {
    const r = await pool.query<{ id: string }>(
      `INSERT INTO event_types (user_id, name, slug, duration_minutes, color)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [userId, et.name, et.slug, et.duration, et.color],
    )
    etIds[et.slug] = r.rows[0].id
  }
  console.log('[seed] Event types inserted.')

  // ── Availability Schedule ─────────────────────────────────────────────────
  const schedResult = await pool.query<{ id: string }>(
    `INSERT INTO availability_schedules (user_id, name, timezone, is_default)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [userId, 'Working Hours', 'America/New_York', true],
  )

  let scheduleId: string
  if (schedResult.rows.length > 0) {
    scheduleId = schedResult.rows[0].id
  } else {
    const r = await pool.query<{ id: string }>(
      `SELECT id FROM availability_schedules WHERE user_id = $1 AND is_default = TRUE LIMIT 1`,
      [userId],
    )
    scheduleId = r.rows[0].id
  }

  // Mon–Fri, 09:00–17:00 (day_of_week: 1=Mon … 5=Fri)
  for (const day of [1, 2, 3, 4, 5]) {
    await pool.query(
      `INSERT INTO availability_windows (schedule_id, day_of_week, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [scheduleId, day, '09:00:00', '17:00:00'],
    )
  }
  console.log('[seed] Availability schedule inserted.')

  // ── Bookings ──────────────────────────────────────────────────────────────
  const now = new Date()
  const bookings = [
    // Upcoming confirmed
    {
      name: 'Sarah Chen', email: 'sarah.chen@example.com',
      slug: '30min', daysOffset: +2,
      tz: 'America/New_York', status: 'confirmed',
    },
    {
      name: 'Marcus Williams', email: 'marcus@example.com',
      slug: 'quick-chat', daysOffset: +4,
      tz: 'America/Chicago', status: 'confirmed',
    },
    {
      name: 'Priya Patel', email: 'priya@example.com',
      slug: 'consultation', daysOffset: +6,
      tz: 'America/Los_Angeles', status: 'confirmed',
    },
    // Past
    {
      name: 'Jordan Lee', email: 'jordan@example.com',
      slug: '30min', daysOffset: -3,
      tz: 'America/New_York', status: 'confirmed',
    },
    {
      name: 'Tom Rivera', email: 'tom@example.com',
      slug: 'quick-chat', daysOffset: -5,
      tz: 'Europe/London', status: 'cancelled',
    },
  ]

  for (const b of bookings) {
    const etId = etIds[b.slug]
    const etRow = eventTypes.find((e) => e.slug === b.slug)!
    const startTime = new Date(now)
    startTime.setDate(startTime.getDate() + b.daysOffset)
    startTime.setHours(14, 0, 0, 0) // 2 PM UTC

    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + etRow.duration)

    await pool.query(
      `INSERT INTO bookings
         (event_type_id, invitee_name, invitee_email, start_time, end_time, timezone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7::booking_status)
       ON CONFLICT DO NOTHING`,
      [etId, b.name, b.email, startTime.toISOString(), endTime.toISOString(), b.tz, b.status],
    )
  }
  console.log('[seed] Bookings inserted.')
  console.log('[seed] Done ✓')
}

seed()
  .catch((err) => {
    console.error('[seed] Fatal error:', err)
    process.exit(1)
  })
  .finally(() => pool.end())
