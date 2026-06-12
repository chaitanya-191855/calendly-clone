import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAvailability, useUpdateAvailability } from '../../hooks/useAvailability'
import AvailabilityGrid, { type Window } from '../../components/dashboard/AvailabilityGrid'
import TimezoneSelect from '../../components/dashboard/TimezoneSelect'
import { FullPageSpinner } from '../../components/ui/Spinner'
import Spinner from '../../components/ui/Spinner'

export const Route = createFileRoute('/availability/')({
  component: AvailabilityPage,
})

function AvailabilityPage() {
  const { data: schedule, isLoading, error } = useAvailability()
  const { mutateAsync: updateSchedule, isPending: saving } = useUpdateAvailability()

  const [timezone, setTimezone] = useState('America/New_York')
  const [windows,  setWindows]  = useState<Window[]>([])
  const [saved,    setSaved]    = useState(false)
  const [saveError, setSaveError] = useState('')

  // Populate from loaded schedule
  useEffect(() => {
    if (!schedule) return
    setTimezone(schedule.timezone ?? 'America/New_York')
    setWindows(
      (schedule.windows ?? []).map((w: any) => ({
        dayOfWeek: w.day_of_week,
        startTime: (w.start_time ?? '').slice(0, 5),
        endTime:   (w.end_time   ?? '').slice(0, 5),
      })),
    )
  }, [schedule])

  const handleSave = async () => {
    setSaveError('')
    try {
      await updateSchedule({ timezone, windows })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setSaveError(err.message ?? 'Failed to save')
    }
  }

  if (isLoading) return <FullPageSpinner />
  if (error) return (
    <div className="text-center py-20 text-red-500">
      Failed to load availability. <button onClick={() => window.location.reload()} className="underline">Retry</button>
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Availability</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure when you're available for bookings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Timezone */}
        <div className="calendly-card p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Timezone</h2>
          <TimezoneSelect value={timezone} onChange={setTimezone} />
        </div>

        {/* Weekly hours */}
        <div className="calendly-card p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Weekly Hours</h2>
          <AvailabilityGrid windows={windows} onChange={setWindows} />
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <><Spinner size="sm" /> Saving…</> : 'Save Changes'}
          </button>
          {saved     && <span className="text-sm text-green-600 font-medium">✓ Saved</span>}
          {saveError && <span className="text-sm text-red-600">{saveError}</span>}
        </div>
      </div>
    </div>
  )
}
