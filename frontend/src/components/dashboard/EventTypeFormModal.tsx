import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'
import { useCreateEventType, useUpdateEventType } from '../../hooks/useEventTypes'

const DURATIONS = [15, 30, 45, 60, 90]
const COLORS = ['#006BFF', '#00A2FF', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#6B7280']

interface EventType {
  id: string; name: string; slug: string
  duration_minutes: number; description?: string; color: string
}

interface Props {
  open: boolean
  onClose: () => void
  editTarget?: EventType | null
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export default function EventTypeFormModal({ open, onClose, editTarget }: Props) {
  const isEdit = !!editTarget
  const [name, setName]           = useState('')
  const [slug, setSlug]           = useState('')
  const [duration, setDuration]   = useState(30)
  const [description, setDesc]    = useState('')
  const [color, setColor]         = useState('#006BFF')
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError]         = useState('')

  const createMut = useCreateEventType()
  const updateMut = useUpdateEventType(editTarget?.id ?? '')

  const isPending = createMut.isPending || updateMut.isPending

  // Populate form when editing
  useEffect(() => {
    if (editTarget) {
      setName(editTarget.name)
      setSlug(editTarget.slug)
      setDuration(editTarget.duration_minutes)
      setDesc(editTarget.description ?? '')
      setColor(editTarget.color)
      setSlugTouched(true)
    } else {
      setName(''); setSlug(''); setDuration(30); setDesc(''); setColor('#006BFF'); setSlugTouched(false)
    }
    setError('')
  }, [editTarget, open])

  // Auto-generate slug from name unless user has manually edited it
  useEffect(() => {
    if (!slugTouched && name) setSlug(slugify(name))
  }, [name, slugTouched])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const payload = { name: name.trim(), slug: slug.trim(), duration_minutes: duration, description: description.trim() || undefined, color }
    try {
      if (isEdit) {
        await updateMut.mutateAsync(payload)
      } else {
        await createMut.mutateAsync(payload)
      }
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Event Type' : 'New Event Type'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)} required maxLength={255}
            placeholder="30 Minute Meeting"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-calendly-blue/30 focus:border-calendly-blue"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL slug *</label>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-calendly-blue/30 focus-within:border-calendly-blue">
            <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">/book/</span>
            <input
              type="text" value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
              required minLength={2} maxLength={100} pattern="[a-z0-9][a-z0-9\-]*[a-z0-9]"
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
          <div className="flex gap-2 flex-wrap">
            {DURATIONS.map((d) => (
              <button
                key={d} type="button"
                onClick={() => setDuration(d)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  duration === d
                    ? 'bg-calendly-blue text-white border-calendly-blue'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c} type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea
            value={description} onChange={(e) => setDesc(e.target.value)} maxLength={500} rows={3}
            placeholder="Share some information about this meeting type…"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-calendly-blue/30 focus:border-calendly-blue"
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center">
            {isPending ? <Spinner size="sm" /> : isEdit ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
