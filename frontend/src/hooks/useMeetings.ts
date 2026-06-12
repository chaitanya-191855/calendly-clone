import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { meetingsApi } from '../lib/api'

export const meetingsKey = (filter: 'upcoming' | 'past') => ['meetings', filter] as const

export function useMeetings(filter: 'upcoming' | 'past') {
  return useQuery({
    queryKey: meetingsKey(filter),
    queryFn:  () => meetingsApi.list(filter),
  })
}

export function useCancelMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => meetingsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meetings'] })
    },
  })
}
