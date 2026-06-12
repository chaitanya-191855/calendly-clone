import { MeetingsRepository } from '../repositories/meetings.repo'
import { createError } from '../middleware/errorHandler'
import type { BookingWithType } from '../types'

export class MeetingsService {
  private repo = new MeetingsRepository()

  async getUpcoming(userId: string): Promise<BookingWithType[]> {
    return this.repo.findUpcoming(userId)
  }

  async getPast(userId: string): Promise<BookingWithType[]> {
    return this.repo.findPast(userId)
  }

  async cancelMeeting(id: string, userId: string): Promise<void> {
    const row = await this.repo.findByIdWithOwner(id)
    if (!row) throw createError(404, 'Meeting not found')
    if (row.user_id !== userId) throw createError(403, 'Forbidden')
    await this.repo.cancel(id)
  }
}
