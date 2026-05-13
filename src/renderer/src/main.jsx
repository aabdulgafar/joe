import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { api } from './lib/api'

// Bridge Electron API to Supabase for Web
if (!window.api) {
  window.api = api
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
