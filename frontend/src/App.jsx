// Main application component with routing setup
import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { SocketProvider } from './context/SocketContext'
import { attachToken } from './config/api'

// Layout
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AccessDenied from './components/AccessDenied'

// Pages
import HomePage from './pages/HomePage'
import CampaignsPage from './pages/CampaignsPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import CreateCampaignPage from './pages/CreateCampaignPage'
import EditCampaignPage from './pages/EditCampaignPage'
import UserDashboardPage from './pages/UserDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import NotFoundPage from './pages/NotFoundPage'
import DebugPage from './pages/DebugPage'
import SimpleImageTest from './pages/SimpleImageTest'
import ImageTestSimple from './pages/ImageTestSimple'

// Protected route component – redirects unauthenticated users
function ProtectedRoute({ children }) {
  try {
    const { isSignedIn, isLoaded } = useUser()
    if (!isLoaded) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-brand-500 rounded-full border-t-transparent" /></div>
    if (!isSignedIn) return <Navigate to="/sign-in" replace />
    return children
  } catch (err) {
    // Clerk not available, allow access for demo mode
    return children
  }
}

// Admin-only route – checks user role from Clerk metadata
function AdminRoute({ children }) {
  const { user, isLoaded } = useUser()

  // Still loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-brand-500 rounded-full border-t-transparent mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // User not logged in
  if (!user) {
    return <Navigate to="/sign-in" replace />
  }

  // Check admin role or demo mode
  const demoMode = typeof window !== 'undefined' && localStorage.getItem('demo_admin_mode') === 'true'
  const isAdmin = user?.publicMetadata?.role === 'admin' || demoMode

  if (!isAdmin) {
    return (
      <AccessDenied
        message="Admin Access Required"
        reason="You don't have admin privileges to access this page."
        userInfo={{
          email: user.emails?.[0]?.emailAddress,
          role: user?.publicMetadata?.role || 'user'
        }}
      />
    )
  }

  // User is admin, show the page
  return children
}

export default function App() {
  const { getToken } = useAuth()

  useEffect(() => {
    // Initialize token attachment when Clerk is ready
    if (getToken) {
      attachToken(getToken)
    }
  }, [getToken])

  return (
    <ThemeProvider>
      <SocketProvider>
        <BrowserRouter>
          {/* Toast notification container */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontFamily: 'DM Sans, sans-serif', borderRadius: '12px' },
              success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
            }}
          />

          <div className="min-h-screen flex flex-col bg-brand-50 dark:bg-neutral-900 transition-colors">
            <Navbar />

            <main className="flex-1">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/campaigns" element={<CampaignsPage />} />
                <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
                <Route path="/sign-in/*" element={<SignInPage />} />
                <Route path="/sign-up/*" element={<SignUpPage />} />
                <Route path="/debug" element={<DebugPage />} />
                <Route path="/test-images" element={<SimpleImageTest />} />
                <Route path="/image-test" element={<ImageTestSimple />} />

                {/* Protected routes – requires login */}
                <Route path="/campaigns/create" element={<ProtectedRoute><CreateCampaignPage /></ProtectedRoute>} />
                <Route path="/campaigns/:id/edit" element={<ProtectedRoute><EditCampaignPage /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />

                {/* Admin-only routes */}
                <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminDashboardPage /></AdminRoute></ProtectedRoute>} />

                {/* 404 fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </BrowserRouter>
      </SocketProvider>
    </ThemeProvider>
  )
}
