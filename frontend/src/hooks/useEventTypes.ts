import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventTypesApi } from '../lib/api'

export const EVENT_TYPES_KEY = ['event-types'] as const

export function useEventTypes() {
  return useQuery({
    queryKey: EVENT_TYPES_KEY,
    queryFn:  eventTypesApi.list,
  })
}

export function useCreateEventType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => eventTypesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: EVENT_TYPES_KEY }),
  })
}

export function useUpdateEventType(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => eventTypesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: EVENT_TYPES_KEY }),
  })
}

export function useDeleteEventType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventTypesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: EVENT_TYPES_KEY }),
  })
}
