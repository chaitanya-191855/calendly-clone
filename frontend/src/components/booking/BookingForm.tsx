import { useState } from 'react'
import Spinner from '../ui/Spinner'

interface Props {
  onSubmit: (data: { inviteeName: string; inviteeEmail: string; notes?: string }) => Promise<void>
  onBack: () => void
  selectedDate: string
  selectedTime: string
  eventTypeName: string
  durationMinutes: number
}

export default function BookingForm({ onSubmit, onBack, selectedDate, selectedTime, eventTypeName, durationMinutes }: Props) {
  const [name,   setName]    = useState('')
  const [email,  setEmail]   = useState('')
  const [notes,  setNotes]   = useState('')
  const [error,  setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onSubmit({ inviteeName: name.trim(), inviteeEmail: email.trim(), notes: notes.trim() || undefined })
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formattedDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const formattedTime = new Date(selectedTime).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })

  return (
    <div>
      {/* Meeting summary */}
      <div className="mb-5 p-3 bg-blue-50 rounded-lg text-sm text-gray-700 space-y-1">
        <p className="font-medium text-gray-900">{eventTypeName}</p>
        <p>{formattedDate} at {formattedTime}</p>
        <p className="text-gray-500">{durationMinutes} minutes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            required maxLength={255} placeholder="Jane Smith"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-calendly-blue/30 focus:border-calendly-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required placeholder="jane@company.com"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-calendly-blue/30 focus:border-calendly-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)}
            maxLength={1000} rows={3}
            placeholder="Please share anything that will help prepare for our meeting."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-calendly-blue/30 focus:border-calendly-blue"
          />
        </div>

        {error && (
          <div className={`text-sm px-3 py-2 rounded-lg ${error.toLowerCase().includes('no longer available') || error.toLowerCase().includes('conflict') ? 'text-orange-700 bg-orange-50' : 'text-red-600 bg-red-50'}`}>
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onBack} className="btn-secondary flex-1">
            ← Back
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? <Spinner size="sm" /> : 'Schedule Event'}
          </button>
        </div>
      </form>
    </div>
  )
}
