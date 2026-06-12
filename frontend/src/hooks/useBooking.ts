import { useQuery, useMutation } from '@tanstack/react-query'
import { bookingApi } from '../lib/api'

export function useEventTypeBySlug(slug: string) {
  return useQuery({
    queryKey: ['event-type-slug', slug],
    queryFn:  () => bookingApi.getEventType(slug),
  })
}

export function useSlots(slug: string, date: string | null) {
  return useQuery({
    queryKey: ['slots', slug, date],
    queryFn:  () => bookingApi.getSlots(slug, date!),
    enabled:  !!date,
  })
}

export function useCreateBooking(slug: string) {
  return useMutation({
    mutationFn: (data: unknown) => bookingApi.create(slug, data),
  })
}

export function useBookingConfirmation(token: string) {
  return useQuery({
    queryKey: ['booking-confirm', token],
    queryFn:  () => bookingApi.getConfirmation(token),
    enabled:  !!token,
  })
}
