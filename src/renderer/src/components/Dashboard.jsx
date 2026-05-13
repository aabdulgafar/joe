import React from 'react'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Logged in as: <strong className="capitalize">{user?.username} ({user?.role})</strong></span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Inventory Status</h3>
            <p className="text-3xl font-bold text-orange-600">-- items</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Monthly Revenue</h3>
            <p className="text-3xl font-bold text-green-600">$0.00</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Low Stock Alerts</h3>
            <p className="text-3xl font-bold text-red-600">0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
