import { AvailabilityRepository } from '../repositories/availability.repo'
import { EventTypesRepository } from '../repositories/eventTypes.repo'
import { BookingRepository } from '../repositories/booking.repo'
import { withTransaction } from '../db/pool'
import { createError } from '../middleware/errorHandler'
import type { ScheduleWithWindows, TimeSlot } from '../types'
import type { UpdateAvailabilityInput } from '../schemas'

export class AvailabilityService {
  private repo         = new AvailabilityRepository()
  private etRepo       = new EventTypesRepository()
  private bookingRepo  = new BookingRepository()

  async getSchedule(userId: string): Promise<ScheduleWithWindows> {
    const schedule = await this.repo.findDefaultSchedule(userId)
    if (!schedule) throw createError(404, 'No default schedule found')
    return schedule
  }

  async updateSchedule(userId: string, input: UpdateAvailabilityInput): Promise<void> {
    const schedule = await this.repo.findDefaultSchedule(userId)
    if (!schedule) throw createError(404, 'No default schedule found')

    await withTransaction(async (client) => {
      await this.repo.updateScheduleTimezone(schedule.id, input.timezone, client)
      await this.repo.replaceWindows(schedule.id, input.windows, client)
    })
  }

  async getAvailableSlots(slug: string, dateStr: string, inviteeTz: string): Promise<TimeSlot[]> {
    const eventType = await this.etRepo.findBySlug(slug)
    if (!eventType) throw createError(404, 'Event type not found')

    const schedule = await this.repo.findDefaultSchedule(eventType.user_id)
    if (!schedule) return []

    // Determine day of week in the HOST's timezone
    const [year, month, day] = dateStr.split('-').map(Number)
    const localDate = new Date(year, month - 1, day)
    const dayOfWeek = localDate.getDay()

    const window = schedule.windows.find((w) => w.day_of_week === dayOfWeek)
    if (!window) return []

    // Existing bookings for that event type on that date
    const existingBookings = await this.bookingRepo.findByEventTypeAndDate(
      eventType.id,
      dateStr,
    )

    const slots: TimeSlot[] = []
    const duration = eventType.duration_minutes

    // Generate slots every `duration` minutes within the window
    const [startH, startM] = window.start_time.split(':').map(Number)
    const [endH, endM]     = window.end_time.split(':').map(Number)

    let cursor = startH * 60 + startM
    const windowEnd = endH * 60 + endM

    const now = new Date()

    while (cursor + duration <= windowEnd) {
      const slotStart = new Date(Date.UTC(year, month - 1, day,
        cursor % 60 === cursor
          ? Math.floor(cursor / 60)
          : Math.floor(cursor / 60),
        cursor % 60))

      // Re-derive correctly
      const totalMinutes = cursor
      const h = Math.floor(totalMinutes / 60)
      const m = totalMinutes % 60
      const utcSlotStart = new Date(Date.UTC(year, month - 1, day, h, m))
      const utcSlotEnd   = new Date(utcSlotStart.getTime() + duration * 60_000)

      // Skip past slots
      if (utcSlotStart <= now) {
        cursor += duration
        continue
      }

      // Skip conflicting bookings
      const hasConflict = existingBookings.some(
        (b) =>
          new Date(b.start_time) < utcSlotEnd &&
          new Date(b.end_time)   > utcSlotStart,
      )

      if (!hasConflict) {
        const display = utcSlotStart.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: inviteeTz,
        })
        slots.push({ utc: utcSlotStart.toISOString(), display })
      }

      cursor += duration
    }

    return slots
  }
}
