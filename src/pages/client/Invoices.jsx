import { Download } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { recentQuotations } from '../../data/mockData'

export default function Invoices() {
  return (
    <div>
      <PageHeader title="Invoices" subtitle="Download invoices for your payments." />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
              <th className="px-5 py-3 font-medium">Invoice ID</th>
              <th className="px-5 py-3 font-medium">Project</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {recentQuotations.map((q, i) => (
              <tr key={q.id}>
                <td className="px-5 py-4 font-medium text-ink-900">#INV-00{i + 1}</td>
                <td className="px-5 py-4 text-ink-700">{q.project}</td>
                <td className="px-5 py-4 text-ink-900">{q.amount}</td>
                <td className="px-5 py-4 text-ink-500">01 Jun 2026</td>
                <td className="px-5 py-4 text-right">
                  <button className="flex items-center gap-1.5 text-brand-600 text-xs font-medium hover:underline ml-auto">
                    <Download size={13} /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
