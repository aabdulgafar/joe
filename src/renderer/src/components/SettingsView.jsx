import React, { useState, useEffect } from 'react'
import { FolderOpen, Mail, UserPlus, Trash2, Users, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function SettingsView() {
  const { user: currentUser } = useAuth()
  const [dbPath, setDbPath] = useState('Default')
  const [users, setUsers] = useState([])
  const [emailLogs, setEmailLogs] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'storekeeper' })
  
  const [smtpConfig, setSmtpConfig] = useState({ host: '', port: '', user: '', pass: '' })
  const [alertEmail, setAlertEmail] = useState('')

  useEffect(() => {
    loadSettings()
    if (currentUser?.role === 'super_admin') {
      fetchUsers()
      fetchEmailLogs()
    }
  }, [currentUser])

  const loadSettings = async () => {
    const smtp = await window.api.settings.get('smtp_config')
    const email = await window.api.settings.get('alert_email')
    const path = await window.api.system.getDbPath()
    if (smtp) setSmtpConfig(JSON.parse(smtp.value))
    if (email) setAlertEmail(email.value)
    if (path) setDbPath(path)
  }

  const fetchUsers = async () => {
    const data = await window.api.users.get()
    setUsers(data)
  }

  const fetchEmailLogs = async () => {
    const data = await window.api.logs.getEmails()
    setEmailLogs(data)
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    const result = await window.api.users.add(newUser)
    if (result.success) {
      setIsModalOpen(false)
      fetchUsers()
      setNewUser({ username: '', password: '', role: 'storekeeper' })
    } else {
      alert(result.message)
    }
  }

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const result = await window.api.users.delete(id)
      if (result.success) {
        fetchUsers()
      } else {
        alert(result.message)
      }
    }
  }

  const saveSmtp = async () => {
    const config = {
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port),
      secure: smtpConfig.port === '465',
      auth: { user: smtpConfig.user, pass: smtpConfig.pass }
    }
    await window.api.settings.save({ key: 'smtp_config', value: JSON.stringify(config) })
    await window.api.settings.save({ key: 'alert_email', value: alertEmail })
    alert('Email settings saved successfully!')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <CheckCircle2 size={14} className="text-green-500" />
      case 'failed': return <XCircle size={14} className="text-red-500" />
      case 'invalid': return <AlertCircle size={14} className="text-orange-500" />
      default: return <Clock size={14} className="text-blue-500" />
    }
  }

  const handleSelectDbPath = async () => {
    const path = await window.api.system.selectDbPath()
    if (path) {
      const success = await window.api.system.saveDbPath(path)
      if (success) {
        setDbPath(path)
        alert('Database location updated! Please restart the application to apply changes.')
      }
    }
  }

  return (
    <div className="max-w-5xl pb-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">System Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Location Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <FolderOpen className="text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-800">Database Location</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-100 font-mono text-xs text-gray-500 truncate">
              {dbPath}
            </div>
            <button 
              onClick={handleSelectDbPath}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-700 transition-colors"
            >
              Change Location
            </button>
          </div>
          <p className="mt-2 text-[10px] text-gray-400">
            Current path: Choose a folder on Google Drive to enable cloud sync.
          </p>
        </section>

        {/* User Management Section */}
        {currentUser?.role === 'super_admin' && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Users className="text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                <UserPlus size={16} /> Create User
              </button>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 font-bold text-gray-500 uppercase text-[10px]">
                  <tr><th className="px-4 py-3">Username</th><th className="px-4 py-3">Role</th><th className="px-4 py-3 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{u.username}</td>
                      <td className="px-4 py-3 capitalize">{u.role}</td>
                      <td className="px-4 py-3 text-right">
                        {u.username !== 'admin' && <button onClick={() => handleDeleteUser(u.id)} className="text-red-500"><Trash2 size={16} /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Email Settings */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-800">Email Configuration</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Alert Destination Email</label>
              <input type="email" value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="manager@kepris.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">SMTP Host</label>
                <input type="text" value={smtpConfig.host} onChange={(e) => setSmtpConfig({...smtpConfig, host: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="smtp.gmail.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Port</label>
                <input type="text" value={smtpConfig.port} onChange={(e) => setSmtpConfig({...smtpConfig, port: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="587" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">SMTP User</label>
              <input type="text" value={smtpConfig.user} onChange={(e) => setSmtpConfig({...smtpConfig, user: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">SMTP Password</label>
              <input type="password" value={smtpConfig.pass} onChange={(e) => setSmtpConfig({...smtpConfig, pass: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
            </div>
            <button onClick={saveSmtp} className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold shadow-lg shadow-orange-100 mt-2">Update Email Settings</button>
          </div>
        </section>

        {/* Email Logs Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-800">Alert Delivery Log</h2>
          </div>
          <div className="overflow-y-auto max-h-[350px] space-y-3 pr-2">
            {emailLogs.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">No alerts sent yet.</p>
            ) : (
              emailLogs.map(log => (
                <div key={log.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-3">
                  <div className="mt-1">{getStatusIcon(log.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-bold text-gray-800 truncate">{log.subject}</p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mb-1">{log.recipient}</p>
                    {log.error_message && (
                      <p className="text-[10px] text-red-500 bg-red-50 p-1 rounded font-mono truncate">{log.error_message}</p>
                    )}
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{log.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button onClick={fetchEmailLogs} className="w-full mt-4 text-[10px] font-bold uppercase text-orange-500 hover:text-orange-600 tracking-widest">Refresh Logs</button>
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                <input type="text" required className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                <input type="password" required className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                <select className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                  <option value="ceo">CEO</option>
                  <option value="manager">Manager</option>
                  <option value="accountant">Accountant</option>
                  <option value="storekeeper">Storekeeper</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-bold">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsView
