import { EventTypesRepository } from '../repositories/eventTypes.repo'
import { createError } from '../middleware/errorHandler'
import type { EventType } from '../types'
import type { CreateEventTypeInput, UpdateEventTypeInput } from '../schemas'

export class EventTypesService {
  private repo = new EventTypesRepository()

  async listEventTypes(userId: string): Promise<EventType[]> {
    return this.repo.findAllActive(userId)
  }

  async getEventTypeById(id: string, userId: string): Promise<EventType> {
    const et = await this.repo.findById(id)
    if (!et || et.user_id !== userId) throw createError(404, 'Event type not found')
    return et
  }

  async createEventType(userId: string, input: CreateEventTypeInput): Promise<EventType> {
    const existing = await this.repo.findBySlug(input.slug)
    if (existing) throw createError(409, 'Slug is already in use')
    return this.repo.create(userId, input)
  }

  async updateEventType(id: string, userId: string, input: UpdateEventTypeInput): Promise<EventType> {
    const et = await this.repo.findById(id)
    if (!et || et.user_id !== userId) throw createError(404, 'Event type not found')

    if (input.slug && input.slug !== et.slug) {
      const conflict = await this.repo.findBySlug(input.slug)
      if (conflict) throw createError(409, 'Slug is already in use')
    }

    return this.repo.update(id, input)
  }

  async deleteEventType(id: string, userId: string): Promise<void> {
    const et = await this.repo.findById(id)
    if (!et || et.user_id !== userId) throw createError(404, 'Event type not found')
    await this.repo.softDelete(id)
  }

  async getBySlug(slug: string) {
    return this.repo.findBySlug(slug)
  }
}
