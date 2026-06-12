import { useState } from 'react'
import Badge from '../ui/Badge'
import ConfirmDialog from '../ui/ConfirmDialog'
import { useCancelMeeting } from '../../hooks/useMeetings'

interface Meeting {
  id: string; invitee_name: string; invitee_email: string
  event_type_name: string; duration_minutes: number
  start_time: string; end_time: string; timezone: string
  status: 'confirmed' | 'cancelled' | 'rescheduled'
  color: string
}

interface Props {
  meeting: Meeting
  showCancel?: boolean
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }),
  }
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export default function MeetingCard({ meeting: m, showCancel = true }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { mutate: cancelMeeting, isPending } = useCancelMeeting()
  const { date, time } = formatDateTime(m.start_time)
  const isUpcoming = m.status === 'confirmed' && new Date(m.start_time) > new Date()

  return (
    <>
      <div className="calendly-card p-5 flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
          style={{ backgroundColor: m.color }}
        >
          {initials(m.invitee_name)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900">{m.invitee_name}</p>
              <p className="text-sm text-gray-500">{m.invitee_email}</p>
            </div>
            <Badge tone={m.status === 'confirmed' ? 'green' : 'gray'}>
              {m.status}
            </Badge>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {date}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {time}
            </span>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: m.color + '20', color: m.color }}
            >
              {m.event_type_name} · {m.duration_minutes} min
            </span>
          </div>
        </div>

        {/* Cancel button */}
        {showCancel && isUpcoming && (
          <button
            onClick={() => setConfirmOpen(true)}
            className="flex-shrink-0 text-sm text-gray-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
          >
            Cancel
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => { cancelMeeting(m.id); setConfirmOpen(false) }}
        title="Cancel this meeting?"
        description={`This will cancel the meeting with ${m.invitee_name}.`}
        confirmLabel="Cancel Meeting"
        loading={isPending}
      />
    </>
  )
}
