import { useEffect, useState } from 'react'
import { CreditCard, ShieldCheck, Lock, BadgeCheck, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { getHiredEngineersWithProfiles, getPaymentsByClient, createPayment, pushNotification } from '../../firebase/firestore'

const paymentTypes = [
  { id: 'milestone', label: 'Milestone Based Payment', desc: 'Pay in multiple milestones' },
  { id: 'full', label: 'Full Payment', desc: 'Pay full amount upfront' },
  { id: 'escrow', label: 'Escrow Payment', desc: 'Amount held safely until milestone approval' },
  { id: 'advance', label: 'Advance Payment', desc: 'Pay a partial amount to begin' },
]

const methods = ['Credit / Debit Card', 'UPI / Net Banking', 'PayPal', 'Bank Transfer']

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function Payments() {
  const { user, profile } = useAuth()
  const [hires, setHires] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const [hireId, setHireId] = useState('')
  const [type, setType] = useState('milestone')
  const [method, setMethod] = useState(methods[0])
  const [amount, setAmount] = useState('')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) return
    let active = true
    Promise.all([getHiredEngineersWithProfiles(user.uid), getPaymentsByClient(user.uid)])
      .then(([h, p]) => {
        if (!active) return
        setHires(h)
        setPayments(p)
        if (h.length > 0) setHireId(h[0].id)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  async function handlePay(e) {
    e.preventDefault()
    if (!user || !hireId) return
    const hire = hires.find((h) => h.id === hireId)
    if (!hire || !amount) return

    setPaying(true)
    setError('')
    try {
      await createPayment({
        projectId: hire.projectId || null,
        clientId: user.uid,
        clientName: profile?.name || '',
        engineerId: hire.engineerId,
        engineerName: hire.engineer?.name || hire.engineerName || '',
        amount: Number(amount),
        method,
        type,
      })
      await pushNotification(hire.engineerId, {
        type: 'payment',
        title: 'Payment received',
        message: `${profile?.name || 'A client'} sent you a payment of ${formatCurrency(amount)}.`,
      })
      const refreshed = await getPaymentsByClient(user.uid)
      setPayments(refreshed)
      setAmount('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err?.message || 'Payment failed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div>
      <PageHeader title="Payments" subtitle="Manage payments securely for your active projects." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-semibold text-ink-900 mb-4">Make a Payment</h3>

          {success && (
            <p className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2.5 mb-4">
              <CheckCircle2 size={15} /> Payment recorded successfully.
            </p>
          )}
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5 mb-4">{error}</p>}

          {hires.length === 0 ? (
            <p className="text-sm text-ink-500">
              You don't have any hired engineers yet. Hire someone from{' '}
              <span className="font-medium">Find Engineers</span> to make a payment.
            </p>
          ) : (
            <form onSubmit={handlePay}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Pay</label>
                <select value={hireId} onChange={(e) => setHireId(e.target.value)} className="input-field">
                  {hires.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.engineer?.name || h.engineerName || 'Engineer'}
                      {h.projectTitle ? ` — ${h.projectTitle}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2 mb-6">
                {paymentTypes.map((t) => (
                  <label
                    key={t.id}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition ${
                      type === t.id ? 'border-brand-600 bg-brand-50' : 'border-ink-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      className="mt-1"
                      checked={type === t.id}
                      onChange={() => setType(t.id)}
                    />
                    <div>
                      <p className="text-sm font-medium text-ink-900">{t.label}</p>
                      <p className="text-xs text-ink-500">{t.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <h4 className="text-sm font-semibold text-ink-900 mb-2">Payment Method</h4>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {methods.map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition ${
                      method === m ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-ink-100 text-ink-700'
                    }`}
                  >
                    <CreditCard size={16} />
                    {m}
                  </button>
                ))}
              </div>

              <button type="submit" disabled={paying} className="btn-primary w-full py-2.5 disabled:opacity-60">
                {paying ? 'Processing...' : 'Proceed to Pay'}
              </button>
            </form>
          )}

          <div className="flex flex-wrap gap-4 justify-center mt-5 text-xs text-ink-500">
            <span className="flex items-center gap-1.5">
              <Lock size={13} /> 100% Secure Payment
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} /> Escrow Protected
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck size={13} /> Money Back Guarantee
            </span>
          </div>
        </div>

        <div className="card p-5 h-fit">
          <h3 className="font-semibold text-ink-900 mb-4">Recent Payments</h3>
          {loading ? (
            <p className="text-sm text-ink-500">Loading...</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-ink-500">No payments yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100 text-sm">
              {payments.slice(0, 8).map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink-900">{p.engineerName || 'Engineer'}</p>
                    <p className="text-xs text-ink-500 capitalize">{p.type} payment</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-ink-900">{formatCurrency(p.amount)}</p>
                    <StatusBadge status={p.status || 'Pending'} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
