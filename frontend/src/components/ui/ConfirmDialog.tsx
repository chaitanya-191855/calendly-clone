import Modal from './Modal'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  loading?: boolean
}

export default function ConfirmDialog({
  open, onClose, onConfirm,
  title, description,
  confirmLabel = 'Confirm',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="sm">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.193 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-500 mb-6">{description}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger flex-1">
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
