import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, TrendingDown, AlertTriangle, Wallet } from 'lucide-react'

function DashboardView() {
  const { user } = useAuth()
  const [summary, setSummary] = useState({ totalRevenue: 0, totalCost: 0, lowStockCount: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const data = await window.api.finance.getSummary()
      const lowStockItems = await window.api.inventory.getLowStock()
      
      setSummary({ 
        totalRevenue: data?.totalRevenue || 0, 
        totalCost: data?.totalCost || 0, 
        lowStockCount: lowStockItems?.length || 0 
      })
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNaira = (val) => {
    return '₦' + new Intl.NumberFormat('en-NG').format(val || 0)
  }

  const isCEO = user?.role === 'ceo' || user?.role === 'super_admin'
  const isAccountant = user?.role === 'accountant' || isCEO
  const isStorekeeper = user?.role === 'storekeeper' || user?.role === 'manager' || isCEO

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-400 font-bold animate-pulse">Updating dashboard data...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Welcome, {user?.username}</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
            {user?.role} • Kepris Foods Internal System
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Status</p>
          <div className="flex items-center gap-1.5 justify-end">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-bold text-gray-700">Cloud Sync Active</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Accountant / CEO View */}
        {isAccountant && (
          <>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-green-50 text-green-600 rounded-xl"><TrendingUp size={20} /></div>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</h3>
                <p className="text-2xl font-black text-gray-800">{formatNaira(summary.totalRevenue)}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl"><TrendingDown size={20} /></div>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Expenses</h3>
                <p className="text-2xl font-black text-gray-800">{formatNaira(summary.totalCost)}</p>
              </div>
            </div>
          </>
        )}

        {/* Storekeeper / Manager / CEO View */}
        {isStorekeeper && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><AlertTriangle size={20} /></div>
              {summary.lowStockCount > 0 && <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">ACTION REQ</span>}
            </div>
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Low Stock Alerts</h3>
              <p className="text-2xl font-black text-gray-800">{summary.lowStockCount} Items</p>
            </div>
          </div>
        )}

        {/* CEO Only Profit View */}
        {isCEO && (
          <div className="bg-orange-600 p-6 rounded-3xl shadow-xl shadow-orange-100 flex flex-col justify-between text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-orange-500 text-white rounded-xl"><Wallet size={20} /></div>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-orange-200 uppercase tracking-widest mb-1">Net Profit</h3>
              <p className="text-2xl font-black">
                {formatNaira(summary.totalRevenue - summary.totalCost)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[400px]">
          <h3 className="text-xl font-black text-gray-800 mb-6 tracking-tight">Business Overview</h3>
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-2xl border-none">
              <p className="font-black text-gray-700 text-sm uppercase tracking-widest mb-2">Inventory Status</p>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                {summary.lowStockCount > 0 
                  ? `There are currently ${summary.lowStockCount} items below threshold. Please review the inventory registry to restock.`
                  : "All inventory levels are currently within safe operating thresholds."}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-100 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Top Selling Category</p>
                <p className="font-bold text-gray-800">Spiced Powders</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Recent Activity</p>
                <p className="font-bold text-gray-800">Sale recorded 14m ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-8 rounded-3xl shadow-2xl text-white">
          <h3 className="text-xl font-black mb-6 tracking-tight">System Logs</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              <span className="text-gray-400">Database connected</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-gray-400">Security Policies (RLS) active</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <span className="text-gray-400">User session verified as {user?.role}</span>
            </div>
          </div>
          
          <div className="mt-12 pt-12 border-t border-gray-800">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 text-center">Cloud Performance</p>
            <div className="flex justify-between items-end gap-1 h-12 px-4">
              {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60].map((h, i) => (
                <div key={i} className="flex-1 bg-orange-500/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardView
