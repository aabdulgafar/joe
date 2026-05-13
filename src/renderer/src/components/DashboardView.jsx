import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function DashboardView() {
  const { user } = useAuth()
  const [summary, setSummary] = useState({ totalRevenue: 0, totalCost: 0, lowStockCount: 0 })

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    const data = await window.api.finance.getSummary()
    const items = await window.api.inventory.getItems()
    const lowStock = items.filter(i => i.quantity <= i.threshold).length
    
    if (data) setSummary({ ...data, lowStockCount: lowStock })
  }

  const formatNaira = (val) => {
    return '₦' + new Intl.NumberFormat('en-NG').format(val || 0)
  }

  const isCEO = user?.role === 'ceo' || user?.role === 'super_admin'
  const isAccountant = user?.role === 'accountant' || isCEO
  const isStorekeeper = user?.role === 'storekeeper' || user?.role === 'manager' || isCEO

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user?.username}</h1>
      <p className="text-gray-500 mb-8 capitalize">{user?.role} Dashboard</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Accountant / CEO View */}
        {isAccountant && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">{formatNaira(summary.totalRevenue)}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Expenses (Cost)</h3>
              <p className="text-3xl font-bold text-red-500">{formatNaira(summary.totalCost)}</p>
            </div>
          </>
        )}

        {/* Storekeeper / Manager / CEO View */}
        {isStorekeeper && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Low Stock Alerts</h3>
            <p className="text-3xl font-bold text-orange-600">{summary.lowStockCount} Items</p>
          </div>
        )}

        {/* CEO Only Profit View */}
        {isCEO && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 bg-orange-50">
            <h3 className="text-sm font-medium text-orange-800 mb-1">Net Profit</h3>
            <p className="text-3xl font-bold text-orange-600">
              {formatNaira(summary.totalRevenue - summary.totalCost)}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Status</h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 italic">Dashboard customized for {user?.role} access levels.</p>
            {isStorekeeper && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-bold text-gray-700">Stock Check</p>
                <p className="text-sm text-gray-500">Inventory levels are currently being monitored for auto-backup to Cloud Sync folder.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardView
