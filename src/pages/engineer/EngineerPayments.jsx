import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { getPaymentsByEngineer } from '../../firebase/firestore'

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

function isThisMonth(ts) {
  if (!ts?.toDate) return false
  const d = ts.toDate()
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export default function EngineerPayments() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true
    getPaymentsByEngineer(user.uid)
      .then((data) => active && setPayments(data))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  const { totalEarnings, pending, thisMonth } = useMemo(() => {
    const totalEarnings = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const pending = payments
      .filter((p) => p.status === 'Pending')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const thisMonth = payments
      .filter((p) => isThisMonth(p.createdAt))
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)
    return { totalEarnings, pending, thisMonth }
  }, [payments])

  return (
    <div>
      <PageHeader title="Payments" subtitle="Track earnings and payment history." />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Earnings" value={formatCurrency(totalEarnings)} icon="Wallet" color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Pending Payments" value={formatCurrency(pending)} icon="Clock" color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="This Month" value={formatCurrency(thisMonth)} icon="TrendingUp" color="text-brand-600" bg="bg-brand-50" />
      </div>

      {loading ? (
        <p className="text-sm text-ink-500">Loading payments...</p>
      ) : payments.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-ink-500">No payments recorded yet.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-4 font-medium text-ink-900">{p.clientName || 'Client'}</td>
                  <td className="px-5 py-4 text-ink-500 capitalize">{p.type || '—'}</td>
                  <td className="px-5 py-4 text-ink-900">{formatCurrency(p.amount)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={p.status || 'Pending'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
