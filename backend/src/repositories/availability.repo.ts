import { pool, withTransaction } from '../db/pool'
import type { PoolClient } from 'pg'
import type { ScheduleWithWindows } from '../types'

interface WindowInput {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export class AvailabilityRepository {
  async findDefaultSchedule(userId: string): Promise<ScheduleWithWindows | null> {
    const { rows } = await pool.query<ScheduleWithWindows>(
      `SELECT s.*,
         COALESCE(
           json_agg(w ORDER BY w.day_of_week) FILTER (WHERE w.id IS NOT NULL),
           '[]'
         ) AS windows
       FROM availability_schedules s
       LEFT JOIN availability_windows w ON w.schedule_id = s.id
       WHERE s.user_id = $1 AND s.is_default = TRUE
       GROUP BY s.id`,
      [userId],
    )
    return rows[0] ?? null
  }

  async updateScheduleTimezone(
    scheduleId: string,
    timezone: string,
    client?: PoolClient,
  ): Promise<void> {
    const executor = client ?? pool
    await executor.query(
      `UPDATE availability_schedules SET timezone = $2 WHERE id = $1`,
      [scheduleId, timezone],
    )
  }

  async replaceWindows(
    scheduleId: string,
    windows: WindowInput[],
    client: PoolClient,
  ): Promise<void> {
    await client.query(
      `DELETE FROM availability_windows WHERE schedule_id = $1`,
      [scheduleId],
    )
    for (const w of windows) {
      await client.query(
        `INSERT INTO availability_windows (schedule_id, day_of_week, start_time, end_time)
         VALUES ($1, $2, $3, $4)`,
        [scheduleId, w.dayOfWeek, w.startTime, w.endTime],
      )
    }
  }
}
