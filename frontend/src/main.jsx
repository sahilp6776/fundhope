import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import './styles/index.css'

// Get Clerk publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Render app - Clerk is optional for development testing
const rootElement = document.getElementById('root')

if (PUBLISHABLE_KEY && PUBLISHABLE_KEY !== 'pk_test_YOUR_PUBLISHABLE_KEY_HERE') {
  // Clerk is configured, wrap with ClerkProvider
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </React.StrictMode>
  )
} else {
  // Clerk not configured yet, show app without Clerk
  console.warn('⚠️ Clerk not configured - running in demo mode without authentication')
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
