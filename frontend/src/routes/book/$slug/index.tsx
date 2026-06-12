import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { bookingApi } from '../../../lib/api'
import { useEventTypeBySlug, useSlots } from '../../../hooks/useBooking'
import BookingCalendar from '../../../components/booking/BookingCalendar'
import TimeSlots from '../../../components/booking/TimeSlots'
import BookingForm from '../../../components/booking/BookingForm'
import { FullPageSpinner } from '../../../components/ui/Spinner'

export const Route = createFileRoute('/book/$slug/')({
  component: BookingPage,
})

type Step = 'calendar' | 'form'

function BookingPage() {
  const { slug } = Route.useParams()
  const navigate  = useNavigate()

  const { data: eventType, isLoading, error } = useEventTypeBySlug(slug)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ utc: string; display: string } | null>(null)
  const [step, setStep] = useState<Step>('calendar')

  const { data: slots, isFetching: slotsLoading } = useSlots(
    slug,
    selectedDate,
  )

  const inviteeTz = Intl.DateTimeFormat().resolvedOptions().timeZone

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  const handleSlotSelect = (slot: { utc: string; display: string }) => {
    setSelectedSlot(slot)
  }

  const handleBookingSubmit = async (formData: {
    inviteeName: string; inviteeEmail: string; notes?: string
  }) => {
    if (!selectedSlot || !eventType) return

    const startTime = new Date(selectedSlot.utc)
    const endTime   = new Date(startTime.getTime() + eventType.duration_minutes * 60_000)

    const booking = await bookingApi.create(slug, {
      ...formData,
      startTime: startTime.toISOString(),
      endTime:   endTime.toISOString(),
      timezone:  inviteeTz,
    })

    navigate({
      to:     '/book/$slug/confirmed',
      params: { slug },
      search: { token: booking.cancel_token },
    })
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <FullPageSpinner />
    </div>
  )

  if (error || !eventType) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500">This booking link doesn't exist or has been disabled.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-3xl">
        <div className="flex flex-col md:flex-row">
          {/* Left panel — host info */}
          <div className="md:w-72 p-8 border-b md:border-b-0 md:border-r border-gray-100 flex-shrink-0">
            <div
              className="w-12 h-12 rounded-full text-white flex items-center justify-center font-bold text-lg mb-4"
              style={{ backgroundColor: eventType.color }}
            >
              {eventType.user_name?.slice(0, 2).toUpperCase() ?? 'AJ'}
            </div>
            <p className="text-sm text-gray-500 mb-0.5">{eventType.user_name}</p>
            <h1 className="text-xl font-semibold text-gray-900 mb-4 leading-tight">{eventType.name}</h1>

            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {eventType.duration_minutes} minutes
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
                {inviteeTz}
              </div>
            </div>

            {eventType.description && (
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">{eventType.description}</p>
            )}
          </div>

          {/* Right panel */}
          <div className="flex-1 p-8">
            {step === 'calendar' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Select a Date & Time</h2>
                <BookingCalendar
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                />

                {selectedDate && (
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric',
                      })}
                    </h3>
                    <TimeSlots
                      slots={slots ?? []}
                      selectedSlot={selectedSlot}
                      onSelect={handleSlotSelect}
                      loading={slotsLoading}
                    />
                    {selectedSlot && (
                      <button
                        onClick={() => setStep('form')}
                        className="btn-primary w-full justify-center mt-4"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {step === 'form' && selectedSlot && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Enter Details</h2>
                <BookingForm
                  onSubmit={handleBookingSubmit}
                  onBack={() => setStep('calendar')}
                  selectedDate={selectedDate!}
                  selectedTime={selectedSlot.utc}
                  eventTypeName={eventType.name}
                  durationMinutes={eventType.duration_minutes}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
