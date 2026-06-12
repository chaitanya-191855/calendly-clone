import { useState } from 'react'

interface Props {
  selectedDate: string | null
  onSelectDate: (date: string) => void
  availableDates?: Set<string>
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function BookingCalendar({ selectedDate, onSelectDate, availableDates }: Props) {
  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const firstDay  = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const isPast = (d: number) => {
    const date = new Date(viewYear, viewMonth, d)
    date.setHours(23, 59, 59)
    return date < today
  }

  const isToday = (d: number) => {
    return viewYear === today.getFullYear() &&
           viewMonth === today.getMonth() &&
           d === today.getDate()
  }

  // Navigate to prev month only if there are past months with potential dates
  const canGoPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth} disabled={!canGoPrev}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold text-gray-900">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />

          const dateStr   = toDateStr(viewYear, viewMonth, day)
          const past      = isPast(day)
          const today_    = isToday(day)
          const selected  = selectedDate === dateStr
          const hasSlots  = availableDates ? availableDates.has(dateStr) : !past

          return (
            <button
              key={day}
              onClick={() => !past && onSelectDate(dateStr)}
              disabled={past || !hasSlots}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-full font-medium transition-colors
                ${selected        ? 'bg-calendly-blue text-white' :
                  today_          ? 'border-2 border-calendly-blue text-calendly-blue hover:bg-blue-50' :
                  past || !hasSlots ? 'text-gray-300 cursor-default' :
                  'text-gray-700 hover:bg-blue-50 hover:text-calendly-blue cursor-pointer'}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
