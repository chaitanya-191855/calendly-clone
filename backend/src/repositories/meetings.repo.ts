import { pool } from '../db/pool'
import type { BookingWithType } from '../types'

export class MeetingsRepository {
  async findUpcoming(userId: string): Promise<BookingWithType[]> {
    const { rows } = await pool.query<BookingWithType>(
      `SELECT b.*, et.name AS event_type_name, et.color, et.duration_minutes
       FROM bookings b
       JOIN event_types et ON b.event_type_id = et.id
       WHERE et.user_id = $1
         AND b.status = 'confirmed'
         AND b.start_time > NOW()
       ORDER BY b.start_time ASC`,
      [userId],
    )
    return rows
  }

  async findPast(userId: string): Promise<BookingWithType[]> {
    const { rows } = await pool.query<BookingWithType>(
      `SELECT b.*, et.name AS event_type_name, et.color, et.duration_minutes
       FROM bookings b
       JOIN event_types et ON b.event_type_id = et.id
       WHERE et.user_id = $1
         AND (b.start_time < NOW() OR b.status IN ('cancelled', 'rescheduled'))
       ORDER BY b.start_time DESC`,
      [userId],
    )
    return rows
  }

  async findByIdWithOwner(id: string): Promise<{ id: string; user_id: string } | null> {
    const { rows } = await pool.query<{ id: string; user_id: string }>(
      `SELECT b.id, et.user_id
       FROM bookings b
       JOIN event_types et ON b.event_type_id = et.id
       WHERE b.id = $1`,
      [id],
    )
    return rows[0] ?? null
  }

  async cancel(id: string): Promise<void> {
    await pool.query(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1`,
      [id],
    )
  }
}
