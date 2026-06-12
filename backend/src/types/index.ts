export interface User {
  id: string
  name: string
  email: string
  timezone: string
  created_at: Date
}

export interface EventType {
  id: string
  user_id: string
  name: string
  slug: string
  duration_minutes: number
  description: string | null
  color: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface EventTypeWithUser extends EventType {
  user_name: string
}

export interface AvailabilitySchedule {
  id: string
  user_id: string
  name: string
  timezone: string
  is_default: boolean
  created_at: Date
}

export interface AvailabilityWindow {
  id: string
  schedule_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export interface ScheduleWithWindows extends AvailabilitySchedule {
  windows: AvailabilityWindow[]
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'rescheduled'

export interface Booking {
  id: string
  event_type_id: string
  invitee_name: string
  invitee_email: string
  start_time: Date
  end_time: Date
  timezone: string
  status: BookingStatus
  cancel_token: string
  notes: string | null
  created_at: Date
}

export interface BookingWithType extends Booking {
  event_type_name: string
  color: string
  duration_minutes: number
}

export interface TimeSlot {
  utc: string
  display: string
}

export interface DateOverride {
  id: string
  schedule_id: string
  date: string
  start_time: string | null
  end_time: string | null
  is_unavailable: boolean
}
