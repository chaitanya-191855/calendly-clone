import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { useBookingConfirmation } from '../../../hooks/useBooking'
import { FullPageSpinner } from '../../../components/ui/Spinner'

const searchSchema = z.object({ token: z.string() })

export const Route = createFileRoute('/book/$slug/confirmed')({
  validateSearch: searchSchema,
  component: ConfirmedPage,
})

function ConfirmedPage() {
  const { slug }  = Route.useParams()
  const { token } = Route.useSearch()
  const { data, isLoading } = useBookingConfirmation(token)

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <FullPageSpinner />
    </div>
  )

  const booking = data ?? {}

  const formattedDate = booking.start_time
    ? new Date(booking.start_time).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : ''

  const formattedTime = booking.start_time
    ? new Date(booking.start_time).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
      })
    : ''

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
        {/* Success checkmark */}
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirmed!</h1>
        <p className="text-gray-500 mb-8">
          You're scheduled. A calendar invitation has been sent to your email.
        </p>

        {booking.invitee_name && (
          <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-8 text-sm">
            <Row icon="calendar" label="Date"  value={formattedDate} />
            <Row icon="clock"    label="Time"  value={formattedTime} />
            <Row icon="person"   label="With"  value={booking.invitee_name} />
            <Row icon="email"    label="Email" value={booking.invitee_email} />
          </div>
        )}

        {/* Cancel link */}
        {token && (
          <p className="text-xs text-gray-400 mb-6">
            Need to cancel?{' '}
            <a
              href={`/api/book/${slug}/cancel?token=${token}`}
              className="text-red-500 underline hover:text-red-600"
            >
              Cancel this event
            </a>
          </p>
        )}

        <Link to="/" className="btn-secondary w-full justify-center">
          Return to homepage
        </Link>
      </div>
    </div>
  )
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  const icons: Record<string, JSX.Element> = {
    calendar: (
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    clock: (
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    person: (
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    email: (
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  }
  return (
    <div className="flex items-center gap-2.5">
      {icons[icon]}
      <span className="text-gray-400 w-10 flex-shrink-0">{label}</span>
      <span className="text-gray-700 font-medium">{value}</span>
    </div>
  )
}
