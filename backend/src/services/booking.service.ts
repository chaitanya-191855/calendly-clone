import { BookingRepository } from '../repositories/booking.repo'
import { EventTypesRepository } from '../repositories/eventTypes.repo'
import { createError } from '../middleware/errorHandler'
import type { Booking, EventTypeWithUser } from '../types'
import type { CreateBookingInput } from '../schemas'

export class BookingService {
  private repo   = new BookingRepository()
  private etRepo = new EventTypesRepository()

  async getEventTypeBySlug(slug: string): Promise<EventTypeWithUser | null> {
    return this.etRepo.findBySlug(slug)
  }

  async createBooking(slug: string, input: CreateBookingInput): Promise<Booking> {
    const eventType = await this.etRepo.findBySlug(slug)
    if (!eventType || !eventType.is_active) {
      throw createError(404, 'Event type not found')
    }

    return this.repo.createWithLock({
      eventTypeId:  eventType.id,
      inviteeName:  input.inviteeName,
      inviteeEmail: input.inviteeEmail,
      startTime:    new Date(input.startTime),
      endTime:      new Date(input.endTime),
      timezone:     input.timezone,
      notes:        input.notes,
    })
  }

  async getByToken(token: string): Promise<Booking | null> {
    return this.repo.findByCancelToken(token)
  }

  async cancelByToken(token: string): Promise<void> {
    const booking = await this.repo.findByCancelToken(token)
    if (!booking) throw createError(404, 'Booking not found')
    if (booking.status !== 'confirmed') throw createError(400, 'Booking is already cancelled')
    await this.repo.updateStatus(booking.id, 'cancelled')
  }
}
