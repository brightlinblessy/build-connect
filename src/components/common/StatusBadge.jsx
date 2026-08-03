const styles = {
  'In Progress': 'bg-blue-50 text-blue-600',
  'In Review': 'bg-amber-50 text-amber-600',
  Completed: 'bg-emerald-50 text-emerald-600',
  Cancelled: 'bg-red-50 text-red-600',
  Pending: 'bg-amber-50 text-amber-600',
  Accepted: 'bg-emerald-50 text-emerald-600',
  Rejected: 'bg-red-50 text-red-600',
  Open: 'bg-blue-50 text-blue-600',
  Paid: 'bg-emerald-50 text-emerald-600',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-ink-100 text-ink-700'}`}>
      {status}
    </span>
  )
}
