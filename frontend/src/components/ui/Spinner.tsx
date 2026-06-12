interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`inline-block rounded-full border-2 border-gray-200 border-t-calendly-blue animate-spin ${sizeMap[size]} ${className}`}
    />
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )
}
