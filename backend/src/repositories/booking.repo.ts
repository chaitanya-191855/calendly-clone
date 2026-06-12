import { pool, withTransaction } from '../db/pool'
import type { Booking } from '../types'
import { createError } from '../middleware/errorHandler'

interface CreateBookingData {
  eventTypeId:  string
  inviteeName:  string
  inviteeEmail: string
  startTime:    Date
  endTime:      Date
  timezone:     string
  notes?:       string
}

export class BookingRepository {
  /**
   * Atomically check for overlapping bookings (SELECT FOR UPDATE)
   * then insert. Throws 409 if a conflict is found.
   */
  async createWithLock(data: CreateBookingData): Promise<Booking> {
    return withTransaction(async (client) => {
      // Lock conflicting rows — any booking that overlaps [startTime, endTime)
      const { rows: conflicts } = await client.query(
        `SELECT id FROM bookings
         WHERE event_type_id = $1
           AND status = 'confirmed'
           AND start_time < $3
           AND end_time   > $2
         FOR UPDATE`,
        [data.eventTypeId, data.startTime.toISOString(), data.endTime.toISOString()],
      )

      if (conflicts.length > 0) {
        throw createError(409, 'This time slot is no longer available')
      }

      const { rows } = await client.query<Booking>(
        `INSERT INTO bookings
           (event_type_id, invitee_name, invitee_email, start_time, end_time, timezone, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          data.eventTypeId,
          data.inviteeName,
          data.inviteeEmail,
          data.startTime.toISOString(),
          data.endTime.toISOString(),
          data.timezone,
          data.notes ?? null,
        ],
      )
      return rows[0]
    })
  }

  async findByCancelToken(token: string): Promise<Booking | null> {
    const { rows } = await pool.query<Booking>(
      `SELECT * FROM bookings WHERE cancel_token = $1`,
      [token],
    )
    return rows[0] ?? null
  }

  async findByEventTypeAndDate(eventTypeId: string, dateStr: string): Promise<Booking[]> {
    const { rows } = await pool.query<Booking>(
      `SELECT * FROM bookings
       WHERE event_type_id = $1
         AND status = 'confirmed'
         AND DATE(start_time AT TIME ZONE 'UTC') = $2::date`,
      [eventTypeId, dateStr],
    )
    return rows
  }

  async updateStatus(id: string, status: 'cancelled' | 'rescheduled'): Promise<void> {
    await pool.query(
      `UPDATE bookings SET status = $2::booking_status WHERE id = $1`,
      [id, status],
    )
  }
}
