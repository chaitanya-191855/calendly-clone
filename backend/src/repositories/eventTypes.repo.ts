import { pool } from '../db/pool'
import type { EventType, EventTypeWithUser } from '../types'
import type { CreateEventTypeInput, UpdateEventTypeInput } from '../schemas'

export class EventTypesRepository {
  async findAllActive(userId: string): Promise<EventType[]> {
    const { rows } = await pool.query<EventType>(
      `SELECT id, user_id, name, slug, duration_minutes, description, color, is_active, created_at, updated_at
       FROM event_types
       WHERE user_id = $1 AND is_active = TRUE
       ORDER BY created_at DESC`,
      [userId],
    )
    return rows
  }

  async findById(id: string): Promise<EventType | null> {
    const { rows } = await pool.query<EventType>(
      `SELECT id, user_id, name, slug, duration_minutes, description, color, is_active, created_at, updated_at
       FROM event_types WHERE id = $1`,
      [id],
    )
    return rows[0] ?? null
  }

  async findBySlug(slug: string): Promise<EventTypeWithUser | null> {
    const { rows } = await pool.query<EventTypeWithUser>(
      `SELECT et.*, u.name AS user_name
       FROM event_types et
       JOIN users u ON et.user_id = u.id
       WHERE et.slug = $1`,
      [slug],
    )
    return rows[0] ?? null
  }

  async create(userId: string, data: CreateEventTypeInput): Promise<EventType> {
    const { rows } = await pool.query<EventType>(
      `INSERT INTO event_types (user_id, name, slug, duration_minutes, description, color)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, data.name, data.slug, data.duration_minutes, data.description ?? null, data.color],
    )
    return rows[0]
  }

  async update(id: string, data: UpdateEventTypeInput): Promise<EventType> {
    const fields = Object.keys(data).filter((k) => data[k as keyof typeof data] !== undefined)
    if (fields.length === 0) {
      const et = await this.findById(id)
      return et!
    }

    const setClauses = fields.map((f, i) => `"${f}" = $${i + 2}`).join(', ')
    const values = fields.map((f) => data[f as keyof typeof data])

    const { rows } = await pool.query<EventType>(
      `UPDATE event_types SET ${setClauses} WHERE id = $1 RETURNING *`,
      [id, ...values],
    )
    return rows[0]
  }

  async softDelete(id: string): Promise<void> {
    await pool.query(
      `UPDATE event_types SET is_active = FALSE WHERE id = $1`,
      [id],
    )
  }
}
