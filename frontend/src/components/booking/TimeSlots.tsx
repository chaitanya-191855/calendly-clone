import Spinner from '../ui/Spinner'

interface Slot { utc: string; display: string }

interface Props {
  slots: Slot[]
  selectedSlot: Slot | null
  onSelect: (slot: Slot) => void
  loading?: boolean
}

export default function TimeSlots({ slots, selectedSlot, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-gray-400">No available times on this day.</p>
        <p className="text-xs text-gray-300 mt-1">Try selecting a different date.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
      {slots.map((slot) => {
        const isSelected = selectedSlot?.utc === slot.utc
        return (
          <button
            key={slot.utc}
            onClick={() => onSelect(slot)}
            className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
              isSelected
                ? 'bg-calendly-blue text-white border-calendly-blue'
                : 'bg-white text-gray-700 border-gray-200 hover:border-calendly-blue hover:text-calendly-blue'
            }`}
          >
            {slot.display}
          </button>
        )
      })}
    </div>
  )
}
