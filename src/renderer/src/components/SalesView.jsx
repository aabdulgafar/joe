import React, { useState, useEffect } from 'react'
import { ShoppingCart, Trash2, Plus, Receipt, User, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function SalesView() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [cart, setCart] = useState([])
  
  // Current item being selected
  const [currentItem, setCurrentItem] = useState({ id: '', quantity: 1 })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [itemsData, customersData] = await Promise.all([
      window.api.inventory.getItems(),
      window.api.customers.get()
    ])
    setItems(itemsData)
    setCustomers(customersData)
  }

  const addToCart = () => {
    if (!currentItem.id) return
    const product = items.find(i => i.id === parseInt(currentItem.id))
    
    if (product.quantity < currentItem.quantity) {
      alert(`Insufficient stock! Only ${product.quantity} left.`)
      return
    }

    const existing = cart.find(c => c.id === product.id)
    if (existing) {
      setCart(cart.map(c => c.id === product.id ? {...c, quantity: c.quantity + currentItem.quantity} : c))
    } else {
      setCart([...cart, { ...product, quantity: currentItem.quantity }])
    }
    setCurrentItem({ id: '', quantity: 1 })
  }

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id))
  }

  const totalRevenue = cart.reduce((sum, item) => sum + (item.cost_per_unit * item.quantity), 0)

  const handleCheckout = async () => {
    if (!selectedCustomerId) {
      alert('Please select a customer first.')
      return
    }
    if (cart.length === 0) return

    let successCount = 0
    for (const item of cart) {
      const result = await window.api.inventory.updateStock({
        itemId: item.id,
        type: 'OUT',
        quantity: item.quantity,
        userId: user.id,
        revenue: item.cost_per_unit * item.quantity,
        customerId: parseInt(selectedCustomerId)
      })
      if (result.success) successCount++
    }

    if (successCount === cart.length) {
      alert('Receipt generated and sale recorded!')
      setCart([])
      setSelectedCustomerId('')
      fetchData()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Product Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <Package className="text-orange-500" /> Select Products
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Product</label>
              <select className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl font-bold" value={currentItem.id} onChange={(e) => setCurrentItem({...currentItem, id: e.target.value})}>
                <option value="">Search spices...</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.name} (₦{i.cost_per_unit})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Qty</label>
              <div className="flex gap-2">
                <input type="number" min="1" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl font-bold text-center" value={currentItem.quantity} onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})} />
                <button onClick={addToCart} className="bg-orange-500 text-white p-2.5 rounded-xl hover:bg-orange-600 transition-all"><Plus /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4 text-center">Price</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4 text-right">Subtotal</th>
                <th className="px-6 py-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cart.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-300 font-bold italic">Cart is empty</td></tr>
              ) : (
                cart.map(item => (
                  <tr key={item.id} className="text-sm font-bold text-gray-700">
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4 text-center text-gray-400 font-medium">₦{item.cost_per_unit}</td>
                    <td className="px-6 py-4 text-center">{item.quantity}</td>
                    <td className="px-6 py-4 text-right">₦{item.cost_per_unit * item.quantity}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Checkout Sidebar */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <User className="text-green-500" /> Customer Info
          </h2>
          
          <div className="mb-8">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Select Client</label>
            <select className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-black text-gray-700 outline-none focus:ring-2 focus:ring-green-500/20" value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
              <option value="">Anonymous Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="border-t border-dashed border-gray-200 pt-6 space-y-3">
            <div className="flex justify-between text-gray-400 font-bold text-xs uppercase tracking-widest">
              <span>Subtotal</span>
              <span>₦{totalRevenue}</span>
            </div>
            <div className="flex justify-between text-gray-400 font-bold text-xs uppercase tracking-widest">
              <span>Tax (VAT 0%)</span>
              <span>₦0</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-800 font-black text-lg">TOTAL</span>
              <span className="text-green-600 font-black text-2xl">₦{totalRevenue}</span>
            </div>
          </div>

          <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-green-100 hover:bg-green-700 transition-all mt-8 disabled:opacity-50 disabled:grayscale">
            Complete Checkout
          </button>
        </div>

        <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Quick Note</p>
          <p className="text-xs text-orange-700 font-medium leading-relaxed">Ensure payment is received before completing checkout. Stock levels will be updated instantly.</p>
        </div>
      </div>
    </div>
  )
}

export default SalesView
