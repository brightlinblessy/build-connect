import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { getPaymentsByClient } from '../../firebase/firestore'

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

function formatDate(ts) {
  if (!ts?.toDate) return '—'
  return ts.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function invoiceNumber(id) {
  return `#INV-${id.slice(0, 6).toUpperCase()}`
}

function downloadInvoice(payment) {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`
    <html>
      <head><title>Invoice ${invoiceNumber(payment.id)}</title></head>
      <body style="font-family: sans-serif; padding: 40px; color: #0f172a;">
        <h1 style="margin-bottom: 4px;">BuildConnect</h1>
        <p style="color: #64748b; margin-top: 0;">Invoice ${invoiceNumber(payment.id)}</p>
        <hr />
        <p><strong>Engineer:</strong> ${payment.engineerName || 'Engineer'}</p>
        <p><strong>Payment Type:</strong> ${payment.type || '—'}</p>
        <p><strong>Method:</strong> ${payment.method || '—'}</p>
        <p><strong>Date:</strong> ${formatDate(payment.createdAt)}</p>
        <p style="font-size: 22px; margin-top: 24px;"><strong>Amount: ${formatCurrency(payment.amount)}</strong></p>
      </body>
    </html>
  `)
  win.document.close()
  win.print()
}

export default function Invoices() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true
    getPaymentsByClient(user.uid)
      .then((data) => active && setPayments(data))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Download invoices for your payments." />

      {loading ? (
        <p className="text-sm text-ink-500">Loading invoices...</p>
      ) : payments.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-ink-500">No payments recorded yet.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
                <th className="px-5 py-3 font-medium">Invoice ID</th>
                <th className="px-5 py-3 font-medium">Engineer</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-4 font-medium text-ink-900">{invoiceNumber(p.id)}</td>
                  <td className="px-5 py-4 text-ink-700">{p.engineerName || 'Engineer'}</td>
                  <td className="px-5 py-4 text-ink-900">{formatCurrency(p.amount)}</td>
                  <td className="px-5 py-4 text-ink-500">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => downloadInvoice(p)}
                      className="flex items-center gap-1.5 text-brand-600 text-xs font-medium hover:underline ml-auto"
                    >
                      <Download size={13} /> Download
                    </button>
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
