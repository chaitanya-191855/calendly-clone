import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { availabilityApi } from '../lib/api'

export const AVAILABILITY_KEY = ['availability'] as const

export function useAvailability() {
  return useQuery({
    queryKey: AVAILABILITY_KEY,
    queryFn:  availabilityApi.get,
  })
}

export function useUpdateAvailability() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => availabilityApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: AVAILABILITY_KEY }),
  })
}
