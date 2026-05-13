import React from 'react'
import { LayoutDashboard, Package, Truck, Users, BarChart3, Settings, LogOut, ShoppingBag, ArrowDownToLine } from 'lucide-react'
import logo from '../assets/logo.jpg'

function Sidebar({ activeTab, setActiveTab, user, logout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'manager', 'ceo', 'accountant', 'storekeeper'] },
    { id: 'sales', label: 'Record Sale', icon: ShoppingBag, roles: ['super_admin', 'manager', 'ceo', 'storekeeper'] },
    { id: 'intake', label: 'Stock Intake', icon: ArrowDownToLine, roles: ['super_admin', 'manager', 'storekeeper'] },
    { id: 'inventory', label: 'Inventory Registry', icon: Package, roles: ['super_admin', 'manager', 'storekeeper', 'ceo'] },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, roles: ['super_admin', 'manager'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['super_admin', 'manager'] },
    { id: 'reports', label: 'Financials', icon: BarChart3, roles: ['super_admin', 'manager', 'accountant', 'ceo'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['super_admin'] },
  ]

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role))

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Kepris Foods" className="w-10 h-10 rounded-lg bg-white p-1 object-contain" />
          <div>
            <h1 className="text-lg font-bold text-orange-500 leading-tight">Kepris</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Foods</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 mt-6">
        {filteredMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
              activeTab === item.id ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm">
            {user?.username?.[0].toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-800 rounded transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
