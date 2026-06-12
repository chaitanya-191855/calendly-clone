const DAYS = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
]

const TIMES: string[] = []
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    const hh = h.toString().padStart(2, '0')
    const mm = m.toString().padStart(2, '0')
    TIMES.push(`${hh}:${mm}`)
  }
}

function to12h(time: string) {
  const [h, m] = time.split(':').map(Number)
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12  = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export interface Window {
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface Props {
  windows: Window[]
  onChange: (windows: Window[]) => void
}

export default function AvailabilityGrid({ windows, onChange }: Props) {
  const getWindow = (day: number) => windows.find((w) => w.dayOfWeek === day)

  const toggle = (day: number) => {
    if (getWindow(day)) {
      onChange(windows.filter((w) => w.dayOfWeek !== day))
    } else {
      onChange([...windows, { dayOfWeek: day, startTime: '09:00', endTime: '17:00' }]
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek))
    }
  }

  const update = (day: number, field: 'startTime' | 'endTime', value: string) => {
    onChange(windows.map((w) => w.dayOfWeek === day ? { ...w, [field]: value } : w))
  }

  return (
    <div className="space-y-1">
      {DAYS.map(({ label, value: day }) => {
        const w = getWindow(day)
        const enabled = !!w

        return (
          <div
            key={day}
            className={`flex items-center gap-4 py-3 px-4 rounded-lg transition-colors ${enabled ? 'bg-white' : 'bg-gray-50'}`}
          >
            {/* Toggle */}
            <button
              type="button"
              onClick={() => toggle(day)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${enabled ? 'bg-calendly-blue' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} style={{ transform: enabled ? 'translateX(18px)' : 'translateX(2px)' }} />
            </button>

            {/* Day label */}
            <span className={`w-24 text-sm font-medium flex-shrink-0 ${enabled ? 'text-gray-900' : 'text-gray-400'}`}>
              {label}
            </span>

            {/* Time selectors */}
            {enabled && w ? (
              <div className="flex items-center gap-2 flex-1">
                <select
                  value={w.startTime}
                  onChange={(e) => update(day, 'startTime', e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-calendly-blue bg-white"
                >
                  {TIMES.filter((t) => t < w.endTime).map((t) => (
                    <option key={t} value={t}>{to12h(t)}</option>
                  ))}
                </select>
                <span className="text-gray-400 text-sm">–</span>
                <select
                  value={w.endTime}
                  onChange={(e) => update(day, 'endTime', e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-calendly-blue bg-white"
                >
                  {TIMES.filter((t) => t > w.startTime).map((t) => (
                    <option key={t} value={t}>{to12h(t)}</option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="text-sm text-gray-300">Unavailable</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
