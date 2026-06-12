import { useState, useMemo } from 'react'

const TIMEZONES = [
  // Americas
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'America/Honolulu', 'America/Toronto', 'America/Vancouver',
  'America/Mexico_City', 'America/Bogota', 'America/Lima', 'America/Santiago',
  'America/Sao_Paulo', 'America/Buenos_Aires',
  // Europe
  'Europe/London', 'Europe/Dublin', 'Europe/Lisbon', 'Europe/Paris', 'Europe/Berlin',
  'Europe/Rome', 'Europe/Madrid', 'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Vienna',
  'Europe/Warsaw', 'Europe/Prague', 'Europe/Stockholm', 'Europe/Helsinki', 'Europe/Athens',
  'Europe/Istanbul', 'Europe/Moscow',
  // Asia / Pacific
  'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Bangkok',
  'Asia/Singapore', 'Asia/Hong_Kong', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul',
  'Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Pacific/Auckland',
  // Africa
  'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi',
  // UTC
  'UTC',
]

function getOffset(tz: string): string {
  try {
    const now = new Date()
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: tz, timeZoneName: 'shortOffset',
    }).formatToParts(now)
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? ''
  } catch {
    return ''
  }
}

interface Props {
  value: string
  onChange: (tz: string) => void
}

export default function TimezoneSelect({ value, onChange }: Props) {
  const [search, setSearch] = useState('')
  const [open, setOpen]     = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return TIMEZONES.filter((tz) =>
      tz.toLowerCase().includes(q) || getOffset(tz).toLowerCase().includes(q),
    )
  }, [search])

  const display = `${value.replace('_', ' ')} (${getOffset(value)})`

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-left bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-calendly-blue/30 focus:border-calendly-blue"
      >
        <span className="truncate">{display}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search timezone…"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-calendly-blue"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto">
            {filtered.map((tz) => (
              <li key={tz}>
                <button
                  type="button"
                  onClick={() => { onChange(tz); setOpen(false); setSearch('') }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-blue-50 transition-colors ${value === tz ? 'text-calendly-blue font-medium bg-blue-50' : 'text-gray-700'}`}
                >
                  <span>{tz.replace(/_/g, ' ')}</span>
                  <span className="text-gray-400 text-xs">{getOffset(tz)}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-sm text-gray-400 text-center">No timezones found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
