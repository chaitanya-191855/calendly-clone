type Tone = 'blue' | 'green' | 'gray' | 'red' | 'purple' | 'yellow'

const toneMap: Record<Tone, string> = {
  blue:   'bg-blue-50 text-blue-700',
  green:  'bg-green-50 text-green-700',
  gray:   'bg-gray-100 text-gray-600',
  red:    'bg-red-50 text-red-700',
  purple: 'bg-purple-50 text-purple-700',
  yellow: 'bg-yellow-50 text-yellow-700',
}

interface BadgeProps {
  children: React.ReactNode
  tone?: Tone
  className?: string
}

export default function Badge({ children, tone = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${toneMap[tone]} ${className}`}>
      {children}
    </span>
  )
}
