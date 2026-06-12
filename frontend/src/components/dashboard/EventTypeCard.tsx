import { useState } from 'react'
import Badge from '../ui/Badge'
import ConfirmDialog from '../ui/ConfirmDialog'
import { useDeleteEventType } from '../../hooks/useEventTypes'

interface EventType {
  id: string; name: string; slug: string
  duration_minutes: number; description?: string
  color: string; is_active: boolean
}

interface Props {
  eventType: EventType
  onEdit: (et: EventType) => void
}

export default function EventTypeCard({ eventType: et, onEdit }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { mutate: deleteEt, isPending: deleting } = useDeleteEventType()
  const bookingUrl = `${window.location.origin}/book/${et.slug}`

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl)
      .then(() => alert('Link copied!'))
      .catch(() => {})
  }

  return (
    <>
      <div className="calendly-card p-5 flex flex-col gap-4 group">
        {/* Color bar */}
        <div className="flex items-start gap-3">
          <div
            className="w-1 self-stretch rounded-full flex-shrink-0"
            style={{ backgroundColor: et.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 leading-tight">{et.name}</h3>
              <Badge tone="blue">{et.duration_minutes} min</Badge>
            </div>
            {et.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{et.description}</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-2">
          {/* Public link */}
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-calendly-blue transition-colors min-w-0"
            title="Copy link"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="truncate">/book/{et.slug}</span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <a
              href={`/book/${et.slug}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
              title="View booking page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button
              onClick={() => onEdit(et)}
              className="p-1.5 text-gray-400 hover:text-calendly-blue hover:bg-blue-50 rounded transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => { deleteEt(et.id); setConfirmOpen(false) }}
        title="Delete event type?"
        description="This will remove it from your dashboard. Existing bookings are preserved."
        confirmLabel="Delete"
        loading={deleting}
      />
    </>
  )
}
