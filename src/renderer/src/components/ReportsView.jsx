import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, ReceiptText } from 'lucide-react'

function ReportsView() {
  const [summary, setSummary] = useState({ totalRevenue: 0, totalCost: 0, totalProfit: 0 })
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const summaryData = await window.api.finance.getSummary()
    const transData = await window.api.finance.getTransactions()
    
    if (summaryData) setSummary(summaryData)
    if (transData) setTransactions(transData)
    setLoading(false)
  }

  const formatNaira = (val) => {
    return '₦' + new Intl.NumberFormat('en-NG').format(val || 0)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Financial Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{formatNaira(summary.totalRevenue)}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><TrendingDown size={20} /></div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Cost</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{formatNaira(summary.totalCost)}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><DollarSign size={20} /></div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Net Profit</h3>
          </div>
          <p className={`text-3xl font-bold ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatNaira(summary.totalProfit)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <ReceiptText className="text-orange-500" />
          <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Quantity</th>
                <th className="px-6 py-4 text-right">Cost</th>
                <th className="px-6 py-4 text-right">Revenue</th>
                <th className="px-6 py-4 text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">Loading transactions...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No transactions recorded yet.</td></tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(t.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{t.itemName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full uppercase ${
                        t.type === 'IN' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium">{t.quantity}</td>
                    <td className="px-6 py-4 text-sm text-right text-red-500">-{formatNaira(t.cost)}</td>
                    <td className="px-6 py-4 text-sm text-right text-green-600">+{formatNaira(t.revenue)}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold">
                      {formatNaira(t.revenue - t.cost)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ReportsView
