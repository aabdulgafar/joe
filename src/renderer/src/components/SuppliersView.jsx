import React, { useState, useEffect } from 'react'
import { Plus, Search, Truck, Mail, Phone, User } from 'lucide-react'

function SuppliersView() {
  const [suppliers, setSuppliers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSupplier, setNewSupplier] = useState({ 
    name: '', contact_person: '', phone: '', email: '', address: '' 
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    const data = await window.api.suppliers.get()
    setSuppliers(data)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const result = await window.api.suppliers.add(newSupplier)
      if (result.success) {
        setIsModalOpen(false)
        fetchSuppliers()
        setNewSupplier({ name: '', contact_person: '', phone: '', email: '', address: '' })
      } else {
        alert('Error saving supplier: ' + result.message)
      }
    } catch (error) {
      alert('System error: ' + error.message)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Suppliers</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Contact Person</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Last Delivery</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors text-sm">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-400 truncate max-w-[200px]">{s.address}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">{s.contact_person}</td>
                <td className="px-6 py-4 text-gray-600">{s.phone}</td>
                <td className="px-6 py-4 text-xs font-bold text-orange-600">
                  {s.last_delivery_date ? new Date(s.last_delivery_date).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 my-8">
            <h2 className="text-xl font-bold mb-6">Register New Supplier</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
                <input 
                  type="text" required 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Person</label>
                  <input 
                    type="text" required 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={newSupplier.contact_person}
                    onChange={(e) => setNewSupplier({...newSupplier, contact_person: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                  <input 
                    type="text" required 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <input 
                  type="email" required 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Physical Address</label>
                <textarea 
                  required 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none h-20"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                ></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg font-bold text-gray-600">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-bold shadow-lg shadow-orange-200">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuppliersView
