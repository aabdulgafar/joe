import React, { useState, useEffect } from 'react'
import { Plus, Search, Calendar, Tag, ShieldCheck, ShieldAlert, MoreVertical } from 'lucide-react'

function InventoryView() {
  const [items, setItems] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '', category: 'finished', quantity: 0, unit: 'kg', threshold: 10, cost_per_unit: 0, 
    supplier_id: '', batch_number: '', expiry_date: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [itemsData, suppliersData] = await Promise.all([
      window.api.inventory.getItems(),
      window.api.suppliers.get()
    ])
    setItems(itemsData)
    setSuppliers(suppliersData)
    setLoading(false)
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    
    // Sanitize data for Supabase
    const sanitizedItem = {
      ...newItem,
      supplier_id: newItem.supplier_id ? parseInt(newItem.supplier_id) : null,
      quantity: parseFloat(newItem.quantity) || 0,
      cost_per_unit: parseFloat(newItem.cost_per_unit) || 0,
      threshold: parseFloat(newItem.threshold) || 10,
      expiry_date: newItem.expiry_date || null,
      batch_number: newItem.batch_number || null
    }

    const result = await window.api.inventory.addItem(sanitizedItem)
    if (result.success) {
      setIsModalOpen(false)
      fetchData()
      setNewItem({
        name: '', category: 'finished', quantity: 0, unit: 'kg', threshold: 10, cost_per_unit: 0, 
        supplier_id: '', batch_number: '', expiry_date: ''
      })
    } else {
      alert('Error adding item: ' + result.message)
    }
  }

  const isExpired = (date) => {
    if (!date) return false
    return new Date(date) < new Date()
  }

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory Registry</h1>
          <p className="text-gray-500 text-sm mt-1">Manage Kepris Foods stock, batches, and shelf life.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-orange-100 transition-all active:scale-95">
          <Plus size={20} /> Add New Stock
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text" placeholder="Search by product name..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-[10px] uppercase tracking-widest font-black border-b border-gray-100">
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Batch/Supplier</th>
                <th className="px-6 py-4 text-center">Stock Level</th>
                <th className="px-6 py-4">Expiry Status</th>
                <th className="px-6 py-4 text-right">Value (₦)</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-orange-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-500 transition-colors">
                        <Tag size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{item.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{item.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-gray-600">Batch: {item.batch_number || 'N/A'}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{item.supplierName || 'Manual Entry'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                      <span className={`text-sm font-black ${item.quantity <= item.threshold ? 'text-red-500' : 'text-gray-700'}`}>
                        {item.quantity} {item.unit}
                      </span>
                      <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.quantity <= item.threshold ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min((item.quantity / (item.threshold * 3)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.expiry_date ? (
                      <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md w-fit ${isExpired(item.expiry_date) ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        <Calendar size={12} />
                        {isExpired(item.expiry_date) ? 'EXPIRED' : item.expiry_date}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-300 font-bold italic">No Date Set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-bold text-gray-800">₦{new Intl.NumberFormat('en-NG').format(item.cost_per_unit)}</p>
                    <p className="text-[9px] text-gray-400">PER {item.unit.toUpperCase()}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-orange-500 transition-all border border-transparent hover:border-orange-100">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 overflow-hidden relative border border-gray-100">
            <h2 className="text-2xl font-black text-gray-800 mb-2">Inventory Intake</h2>
            <p className="text-gray-400 text-sm mb-8 font-medium tracking-tight">Register new raw materials or finished spice products.</p>
            
            <form onSubmit={handleAddItem} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Product Name</label>
                  <input type="text" required placeholder="e.g. Turmeric Powder" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-bold text-gray-700 placeholder:text-gray-300" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Supplier</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-bold text-gray-700" value={newItem.supplier_id} onChange={(e) => setNewItem({...newItem, supplier_id: e.target.value})}>
                    <option value="">Select Vendor</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Category</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-bold text-gray-700" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})}>
                    <option value="raw">Raw Material</option>
                    <option value="finished">Finished Good</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Batch Number</label>
                  <input type="text" placeholder="B-990-2026" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 font-bold" value={newItem.batch_number} onChange={(e) => setNewItem({...newItem, batch_number: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Expiry Date</label>
                  <input type="date" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 font-bold" value={newItem.expiry_date} onChange={(e) => setNewItem({...newItem, expiry_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Unit Cost (₦)</label>
                  <input type="number" required className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 font-bold" value={newItem.cost_per_unit} onChange={(e) => setNewItem({...newItem, cost_per_unit: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Stock Threshold</label>
                  <input type="number" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 font-bold" value={newItem.threshold} onChange={(e) => setNewItem({...newItem, threshold: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Discard</button>
                <button type="submit" className="flex-[2] px-6 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-200 hover:bg-orange-600 hover:-translate-y-0.5 transition-all">Register Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryView
