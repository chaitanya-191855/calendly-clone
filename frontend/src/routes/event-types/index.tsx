import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useEventTypes } from '../../hooks/useEventTypes'
import EventTypeCard from '../../components/dashboard/EventTypeCard'
import EventTypeFormModal from '../../components/dashboard/EventTypeFormModal'
import EmptyState from '../../components/ui/EmptyState'
import { FullPageSpinner } from '../../components/ui/Spinner'

export const Route = createFileRoute('/event-types/')({
  component: EventTypesPage,
})

function EventTypesPage() {
  const { data: eventTypes, isLoading, error } = useEventTypes()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (et: any) => { setEditTarget(et); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  if (isLoading) return <FullPageSpinner />
  if (error) return (
    <div className="text-center py-20 text-red-500">
      Failed to load event types. <button onClick={() => window.location.reload()} className="underline">Retry</button>
    </div>
  )

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Event Types</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create events to share for people to book on your calendar.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Event Type
        </button>
      </div>

      {!eventTypes?.length ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="No event types yet"
          description="Create your first event type so people can start booking time with you."
          action={<button onClick={openCreate} className="btn-primary">Create your first event type</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {eventTypes.map((et: any) => (
            <EventTypeCard key={et.id} eventType={et} onEdit={openEdit} />
          ))}
        </div>
      )}

      <EventTypeFormModal open={modalOpen} onClose={closeModal} editTarget={editTarget} />
    </div>
  )
}
