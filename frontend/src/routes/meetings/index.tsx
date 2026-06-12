import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { useMeetings } from '../../hooks/useMeetings'
import MeetingCard from '../../components/dashboard/MeetingCard'
import EmptyState from '../../components/ui/EmptyState'
import { FullPageSpinner } from '../../components/ui/Spinner'

const searchSchema = z.object({
  filter: z.enum(['upcoming', 'past']).default('upcoming'),
})

export const Route = createFileRoute('/meetings/')({
  validateSearch: searchSchema,
  component: MeetingsPage,
})

function MeetingsPage() {
  const { filter } = Route.useSearch()
  const { data: meetings, isLoading, error } = useMeetings(filter)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Meetings</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage your scheduled meetings.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {(['upcoming', 'past'] as const).map((tab) => (
          <Link
            key={tab}
            to="/meetings"
            search={{ filter: tab }}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
              filter === tab
                ? 'border-calendly-blue text-calendly-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab}
          </Link>
        ))}
      </div>

      {isLoading && <FullPageSpinner />}
      {error && (
        <div className="text-center py-12 text-red-500">
          Failed to load meetings. <button onClick={() => window.location.reload()} className="underline">Retry</button>
        </div>
      )}

      {!isLoading && !error && meetings?.length === 0 && (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          title={`No ${filter} meetings`}
          description={filter === 'upcoming' ? 'Share your booking link to get meetings scheduled.' : 'Past meetings will appear here.'}
        />
      )}

      {!isLoading && meetings && meetings.length > 0 && (
        <div className="space-y-3">
          {meetings.map((m: any) => (
            <MeetingCard key={m.id} meeting={m} showCancel={filter === 'upcoming'} />
          ))}
        </div>
      )}
    </div>
  )
}
