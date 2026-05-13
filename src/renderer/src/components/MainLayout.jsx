import React, { useState } from 'react'
import Sidebar from './Sidebar'
import DashboardView from './DashboardView'
import InventoryView from './InventoryView'
import SuppliersView from './SuppliersView'
import CustomersView from './CustomersView'
import ReportsView from './ReportsView'
import SettingsView from './SettingsView'
import SalesView from './SalesView'
import IntakeView from './IntakeView'
import { useAuth } from '../context/AuthContext'

function MainLayout() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { user, logout } = useAuth()

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />
      case 'sales':
        return <SalesView />
      case 'intake':
        return <IntakeView />
      case 'inventory':
        return <InventoryView />
      case 'suppliers':
        return <SuppliersView />
      case 'customers':
        return <CustomersView />
      case 'reports':
        return <ReportsView />
      case 'settings':
        return <SettingsView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        logout={logout} 
      />
      <main className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  )
}

export default MainLayout
