import { supabase } from './supabaseClient'

const handleResponse = async (promise) => {
  try {
    const { data, error } = await promise
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('API Error:', error)
    return { success: false, message: error.message || 'An unexpected error occurred' }
  }
}

export const api = {
  inventory: {
    getItems: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*, suppliers(name)')
        .order('name')
      
      if (error) throw error
      return data.map(item => ({
        ...item,
        supplierName: item.suppliers?.name
      }))
    },
    getLowStock: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .lte('quantity', supabase.raw('threshold')) // This might not work directly in JS client
        // Alternative: Fetch all and filter, or use an RPC
      
      // Since supabase-js doesn't support col vs col comparison easily without RPC:
      const { data: allItems, error: allErr } = await supabase.from('items').select('*')
      if (allErr) throw allErr
      return allItems.filter(i => i.quantity <= i.threshold)
    },
    addItem: async (item) => {
      return handleResponse(
        supabase.from('items').insert([item]).select()
      )
    },
    updateItem: async (id, updates) => {
      return handleResponse(
        supabase.from('items').update(updates).eq('id', id).select()
      )
    },
    deleteItem: async (id) => {
      return handleResponse(
        supabase.from('items').delete().eq('id', id)
      )
    },
    updateStock: async ({ itemId, type, quantity, userId, cost, revenue, customerId, supplierId }) => {
      try {
        // 1. Record transaction
        const { error: transError } = await supabase
          .from('transactions')
          .insert([{
            item_id: itemId,
            type,
            quantity,
            cost: cost || 0,
            revenue: revenue || 0,
            user_id: userId,
            customer_id: customerId,
            supplier_id: supplierId
          }])
        
        if (transError) throw transError

        // 2. Update quantity (using a more atomic approach if possible, but standard fetch-update for now)
        const { data: item, error: fetchError } = await supabase
          .from('items')
          .select('quantity')
          .eq('id', itemId)
          .single()
        
        if (fetchError) throw fetchError

        const adjustment = type === 'IN' ? quantity : -quantity
        const { error: updateError } = await supabase
          .from('items')
          .update({ quantity: item.quantity + adjustment })
          .eq('id', itemId)

        if (updateError) throw updateError
        
        return { success: true }
      } catch (error) {
        console.error('Stock Update Error:', error)
        return { success: false, message: error.message }
      }
    }
  },
  finance: {
    getSummary: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('revenue, cost')
      
      if (error) throw error
      
      const summary = data.reduce((acc, curr) => {
        acc.totalRevenue += (curr.revenue || 0)
        acc.totalCost += (curr.cost || 0)
        return acc
      }, { totalRevenue: 0, totalCost: 0 })
      
      summary.totalProfit = summary.totalRevenue - summary.totalCost
      return summary
    },
    getTransactions: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, items(name), customers(name), suppliers(name)')
        .order('timestamp', { ascending: false })
      
      if (error) throw error
      
      return data.map(t => ({
        ...t,
        itemName: t.items?.name,
        customerName: t.customers?.name,
        supplierName: t.suppliers?.name
      }))
    }
  },
  suppliers: {
    get: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name')
      if (error) throw error
      return data
    },
    add: async (supplier) => {
      return handleResponse(
        supabase.from('suppliers').insert([supplier]).select()
      )
    },
    update: async (id, updates) => {
      return handleResponse(
        supabase.from('suppliers').update(updates).eq('id', id).select()
      )
    }
  },
  customers: {
    get: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name')
      if (error) throw error
      return data
    },
    add: async (customer) => {
      return handleResponse(
        supabase.from('customers').insert([customer]).select()
      )
    },
    update: async (id, updates) => {
      return handleResponse(
        supabase.from('customers').update(updates).eq('id', id).select()
      )
    }
  },
  users: {
    get: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, role, is_approved')
        .order('username')
      if (error) throw error
      return data
    },
    create: async ({ username, password, role }) => {
      // For web version, we use signUp. 
      // Note: This will not work if the admin is already logged in (it will log them out)
      // unless we use a separate supabase client or a dedicated edge function.
      // For simplicity in this "Sync" version, we'll try to use a service-like approach if possible
      // or just inform the user.
      const email = `${username}@gmail.com`
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, username }
        }
      })
      if (error) return { success: false, message: error.message }
      
      // The trigger handles profile creation, but we might want to force update the role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role, is_approved: true })
        .eq('id', data.user.id)
      
      return { success: !profileError, message: profileError?.message }
    },
    updateRole: async (userId, role) => {
      return handleResponse(
        supabase.from('profiles').update({ role }).eq('id', userId)
      )
    },
    approve: async (userId) => {
      return handleResponse(
        supabase.from('profiles').update({ is_approved: true }).eq('id', userId)
      )
    },
    delete: async (userId) => {
      return handleResponse(
        supabase.from('profiles').delete().eq('id', userId)
      )
    }
  },
  settings: {
    get: async (key) => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single()
      if (error && error.code !== 'PGRST116') throw error 
      return data
    },
    save: async ({ key, value }) => {
      return handleResponse(
        supabase.from('settings').upsert({ key, value })
      )
    }
  },
  logs: {
    getEmails: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50)
      if (error) throw error
      return data
    }
  },
  system: {
    getDbPath: async () => 'Cloud (Supabase)',
    selectDbPath: async () => null,
    saveDbPath: async () => true,
    getDbStatus: async () => {
      const { error } = await supabase.from('settings').select('key').limit(1)
      return { connected: !error, error: error?.message }
    }
  }
}
