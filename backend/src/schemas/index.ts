import { z } from 'zod'

const RESERVED_SLUGS = ['api', 'admin', 'book', 'meetings', 'availability', 'static', 'health']

export const CreateEventTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).trim(),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Slug must be lowercase alphanumeric with hyphens')
    .refine((s) => !RESERVED_SLUGS.includes(s), { message: 'This slug is reserved' }),
  duration_minutes: z.coerce
    .number()
    .refine((n) => [15, 30, 45, 60, 90].includes(n), { message: 'Duration must be 15, 30, 45, 60, or 90' }),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
    .optional()
    .default('#006BFF'),
})

export const UpdateEventTypeSchema = CreateEventTypeSchema.partial()

export const UpdateAvailabilitySchema = z.object({
  timezone: z.string().refine(
    (tz) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz })
        return true
      } catch {
        return false
      }
    },
    { message: 'Invalid IANA timezone' },
  ),
  windows: z
    .array(
      z
        .object({
          dayOfWeek: z.number().int().min(0).max(6),
          startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
          endTime:   z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
        })
        .refine((w) => w.startTime < w.endTime, {
          message: 'startTime must be before endTime',
        }),
    )
    .max(7),
})

export const CreateBookingSchema = z.object({
  inviteeName:  z.string().min(1).max(255).transform((s) => s.replace(/<[^>]*>/g, '').trim()),
  inviteeEmail: z.string().email(),
  startTime:    z.string().datetime({ message: 'startTime must be an ISO datetime string' }),
  endTime:      z.string().datetime({ message: 'endTime must be an ISO datetime string' }),
  timezone:     z.string().min(1).max(50),
  notes:        z.string().max(1000).optional(),
})

export const SlotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
})

export const MeetingsQuerySchema = z.object({
  filter: z.enum(['upcoming', 'past']).default('upcoming'),
})

export type CreateEventTypeInput  = z.infer<typeof CreateEventTypeSchema>
export type UpdateEventTypeInput  = z.infer<typeof UpdateEventTypeSchema>
export type UpdateAvailabilityInput = z.infer<typeof UpdateAvailabilitySchema>
export type CreateBookingInput    = z.infer<typeof CreateBookingSchema>
