import React, { useState, useEffect } from 'react'
import { Truck, Package, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function IntakeView() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [intake, setIntake] = useState({ itemId: '', supplierId: '', quantity: 1, cost: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [itemsData, suppliersData] = await Promise.all([
      window.api.inventory.getItems(),
      window.api.suppliers.get()
    ])
    setItems(itemsData)
    setSuppliers(suppliersData)
  }

  const handleIntake = async (e) => {
    e.preventDefault()
    
    if (!intake.itemId || !intake.supplierId) {
      alert('Please select both a product and a supplier.')
      return
    }

    const result = await window.api.inventory.updateStock({
      itemId: parseInt(intake.itemId),
      type: 'IN',
      quantity: parseFloat(intake.quantity),
      userId: user.id,
      cost: parseFloat(intake.cost),
      supplierId: parseInt(intake.supplierId)
    })

    if (result.success) {
      alert('Stock intake recorded successfully!')
      fetchData()
      setIntake({ itemId: '', supplierId: '', quantity: 1, cost: 0 })
    } else {
      alert('Error recording intake: ' + result.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800">Stock Intake</h1>
            <p className="text-gray-400 font-medium">Record goods arriving from suppliers.</p>
          </div>
        </div>

        <form onSubmit={handleIntake} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Select Supplier</label>
            <select required className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" value={intake.supplierId} onChange={(e) => setIntake({...intake, supplierId: e.target.value})}>
              <option value="">Who supplied this?</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Select Product</label>
            <select required className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" value={intake.itemId} onChange={(e) => {
              const item = items.find(i => i.id === parseInt(e.target.value))
              setIntake({...intake, itemId: e.target.value, cost: item ? item.cost_per_unit * intake.quantity : 0})
            }}>
              <option value="">What arrived?</option>
              {items.map(i => <option key={i.id} value={i.id}>{i.name} (Current: {i.quantity} {i.unit})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Quantity Received</label>
              <input type="number" required min="1" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" value={intake.quantity} onChange={(e) => setIntake({...intake, quantity: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Total Cost (₦)</label>
              <input type="number" required className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" value={intake.cost} onChange={(e) => setIntake({...intake, cost: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all mt-4">
            Verify & Update Inventory
          </button>
        </form>
      </div>
    </div>
  )
}

export default IntakeView
