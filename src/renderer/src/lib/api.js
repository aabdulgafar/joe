import { supabase } from './supabaseClient'

export const api = {
  inventory: {
    getItems: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*, suppliers(name)')
      if (error) throw error
      // Flatten the supplier name to match existing structure
      return data.map(item => ({
        ...item,
        supplierName: item.suppliers?.name
      }))
    },
    addItem: async (item) => {
      const { data, error } = await supabase
        .from('items')
        .insert([item])
        .select()
      if (error) return { success: false, message: error.message }
      return { success: true, id: data[0].id }
    },
    updateStock: async ({ itemId, type, quantity, userId, cost, revenue, customerId, supplierId }) => {
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
      
      if (transError) return { success: false, message: transError.message }

      // 2. Update quantity
      const adjustment = type === 'IN' ? quantity : -quantity
      // In Supabase, we can use RPC or fetch then update. 
      // For simplicity and since RLS is on, we'll fetch then update or use a custom RPC if available.
      // Better way: Increment using postgres logic if possible, or just standard update.
      const { data: item, error: fetchError } = await supabase
        .from('items')
        .select('quantity')
        .eq('id', itemId)
        .single()
      
      if (fetchError) return { success: false, message: fetchError.message }

      const { error: updateError } = await supabase
        .from('items')
        .update({ quantity: item.quantity + adjustment })
        .eq('id', itemId)

      if (updateError) return { success: false, message: updateError.message }
      
      return { success: true }
    }
  },
  finance: {
    getSummary: async () => {
      // We can use RPC or multiple queries. Supabase doesn't support complex aggregations directly in JS well.
      // Best to use a Postgres View or RPC. For now, we'll use a simple approach.
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
      return data // Note: 'last_delivery_date' would need another query or a view
    },
    add: async (supplier) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplier])
        .select()
      if (error) return { success: false, message: error.message }
      return { success: true, id: data[0].id }
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
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
      if (error) return { success: false, message: error.message }
      return { success: true, id: data[0].id }
    }
  },
  users: {
    get: async () => {
      // Supabase users are in auth.users, usually you create a 'profiles' table.
      // For now, let's assume we use profiles if it exists, otherwise return empty.
      return [] 
    },
    add: async (user) => {
      // Supabase Auth handles user creation
      return { success: false, message: 'Use Supabase Auth to add users' }
    }
  },
  settings: {
    get: async (key) => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single()
      return data
    },
    save: async ({ key, value }) => {
      const { error } = await supabase
        .from('settings')
        .upsert({ key, value })
      return { success: true }
    }
  },
  logs: {
    getEmails: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50)
      return data
    }
  },
  system: {
    getDbPath: async () => 'Cloud (Supabase)',
    selectDbPath: async () => null,
    saveDbPath: async () => true
  }
}
