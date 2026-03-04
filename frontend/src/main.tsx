import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handlers to surface runtime issues during startup
window.addEventListener('error', (e) => {
  // eslint-disable-next-line no-console
  console.error('Runtime error captured (window.error):', e.error || e.message, e)
})
window.addEventListener('unhandledrejection', (e) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled promise rejection:', e.reason)
})

// Helpful log to confirm this module executed
// eslint-disable-next-line no-console
console.log('main.tsx loaded, attempting to mount React')

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Error during React mounting:', err)
}