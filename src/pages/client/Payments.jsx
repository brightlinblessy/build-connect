import { useState } from 'react'
import { CreditCard, ShieldCheck, Lock, BadgeCheck } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { recentQuotations } from '../../data/mockData'

const paymentTypes = [
  { id: 'milestone', label: 'Milestone Based Payment', desc: 'Pay in multiple milestones' },
  { id: 'full', label: 'Full Payment', desc: 'Pay full amount upfront' },
  { id: 'escrow', label: 'Escrow Payment', desc: 'Amount held safely until milestone approval' },
  { id: 'advance', label: 'Advance Payment', desc: 'Pay a partial amount to begin' },
]

const methods = ['Credit / Debit Card', 'UPI / Net Banking', 'PayPal', 'Bank Transfer']

export default function Payments() {
  const [type, setType] = useState('milestone')
  const [method, setMethod] = useState(methods[0])

  return (
    <div>
      <PageHeader title="Payments" subtitle="Manage payments securely for your active projects." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-semibold text-ink-900 mb-4">Make a Payment</h3>
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

          <button className="btn-primary w-full py-2.5">Proceed to Pay</button>

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
          <ul className="divide-y divide-ink-100 text-sm">
            {recentQuotations.map((q) => (
              <li key={q.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-900">{q.project}</p>
                  <p className="text-xs text-ink-500">{q.engineer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-ink-900">{q.amount}</p>
                  <StatusBadge status={q.status === 'Accepted' ? 'Paid' : 'Pending'} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
