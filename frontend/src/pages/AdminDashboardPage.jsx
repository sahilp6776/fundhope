// AdminDashboardPage – manage campaigns, users, view analytics
import React, { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import api from '../config/api' // use shared axios instance with token interceptor

import AccessDenied from '../components/AccessDenied'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, LineElement, PointElement, ArcElement
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { formatINR } from '../components/campaign/CampaignCard'
import toast from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

const statusStyles = {
  approved: 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300',
  pending: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  rejected: 'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
}

// Safe slice helper to prevent crashes
const safeSlice = (text, length = 30) => {
  if (!text || typeof text !== 'string') return 'Unknown'
  return text.slice(0, length)
}

export default function AdminDashboardPage() {
  const { user, isLoaded } = useUser()
  const { isLoaded: clerkLoaded, isSignedIn, getToken } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [donations, setDonations] = useState([])
  const [users, setUsers] = useState([])
  const [userDonations, setUserDonations] = useState({})
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalDonations: 0,
    totalUsers: 0,
    totalRaised: 0,
    avgDonation: 0,
    campaignsByStatus: { approved: 0, pending: 0, rejected: 0 }
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [modalAction, setModalAction] = useState(null) // 'approve' or 'reject'
  const [comments, setComments] = useState('')
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [apiError, setApiError] = useState(null)

  // Admin verification (check role OR demo mode) - Enable demo mode for testing
  const demoMode = typeof window !== 'undefined' && (localStorage.getItem('demo_admin_mode') === 'true' || localStorage.getItem('admin_demo') === 'true')
  const isAdmin = user?.publicMetadata?.role === 'admin' || demoMode || true // Allow all for testing/demo

  // Show loading state while checking auth
  if (!isLoaded || !clerkLoaded) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-brand-500 rounded-full border-t-transparent" />
      </div>
    )
  }

  // Block non-admin users (disabled for demo - remove " || true" to re-enable)
  // if (!isAdmin) {
  //   return (
  //     <AccessDenied
  //       message="Admin Dashboard"
  //       reason="This dashboard is only accessible to administrators. If you believe this is an error, please contact support."
  //       userInfo={{
  //         email: user?.emails?.[0]?.emailAddress,
  //         role: user?.publicMetadata?.role || 'user'
  //       }}
  //     />
  //   )
  // }

  useEffect(() => {
    const fetchAll = async () => {
      try {
        console.log('🔄 Fetching admin data...')
        // Fetch admin-only data and analytics (no auth required for GET endpoints)
        const [campRes, donRes, userRes, analyticsRes] = await Promise.all([
          api.get('/admin/campaigns'),
          api.get('/admin/donations'),
          api.get('/admin/users'),
          api.get('/admin/analytics')
        ])
        
        console.log('✅ Data fetched successfully:')
        console.log('  Campaigns:', campRes.data?.length || 0)
        console.log('  Donations:', donRes.data?.length || 0)
        console.log('  Users:', userRes.data?.length || 0)
        console.log('  Stats:', analyticsRes.data)
        
        setCampaigns(campRes.data || [])
        setDonations(donRes.data || [])
        setUsers(userRes.data || [])
        setStats(analyticsRes.data || {})
      } catch (err) {
        console.error('❌ Failed to fetch admin data:')
        console.error('  Status:', err.response?.status)
        console.error('  Message:', err.message)
        console.error('  Data:', err.response?.data)
        setApiError(`Unable to load admin data: ${err.response?.status || err.message}. Please refresh the page.`)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Update campaign status with comments
  const openApprovalModal = (campaign, action) => {
    setSelectedCampaign(campaign)
    setModalAction(action)
    setComments('')
    setShowApprovalModal(true)
  }

  const updateStatus = async () => {
    if (!selectedCampaign) return
    try {
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }

      await api.patch(`/admin/campaigns/${selectedCampaign._id}/status`, { 
        status: modalAction,
        comments: comments || null
      }, { headers })
      
      setCampaigns((prev) => prev.map((c) => c._id === selectedCampaign._id ? { ...c, status: modalAction } : c))
      toast.success(`Campaign ${modalAction}!`)
      setShowApprovalModal(false)
      setComments('')
    } catch (err) {
      console.error('Error updating status:', err.response?.data || err.message)
      toast.error('Failed to update status')
    }
  }

  // Delete campaign
  const deleteCampaign = async (id) => {
    if (!window.confirm('Delete this campaign permanently?')) return
    try {
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }

      await api.delete(`/admin/campaigns/${id}`, { headers })
      setCampaigns((prev) => prev.filter((c) => c._id !== id))
      toast.success('Campaign deleted')
    } catch (err) {
      console.error('Error deleting campaign:', err.response?.data || err.message)
      toast.error('Failed to delete campaign')
    }
  }

  // Suspend/Unsuspend user
  const handleSuspendUser = async () => {
    if (!selectedUser) return
    try {
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }

      await api.patch(`/admin/users/${selectedUser._id}/suspend`, {
        isSuspended: !selectedUser.isSuspended,
        reason: suspendReason || null
      }, { headers })

      setUsers((prev) => prev.map((u) =>
        u._id === selectedUser._id
          ? {
              ...u,
              isSuspended: !u.isSuspended,
              suspensionReason: !u.isSuspended ? suspendReason : null,
              suspendedAt: !u.isSuspended ? new Date() : null
            }
          : u
      ))

      toast.success(selectedUser.isSuspended ? 'User unsuspended' : 'User suspended')
      setShowSuspendModal(false)
      setSelectedUser(null)
      setSuspendReason('')
    } catch (err) {
      console.error('Error suspending user:', err)
      toast.error('Failed to update user')
    }
  }

  // Fetch user's donations
  const viewUserDonations = async (userId) => {
    try {
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }
      const response = await api.get(`/admin/users/${userId}/donations`, { headers })
      setUserDonations((prev) => ({ ...prev, [userId]: response.data }))
    } catch (err) {
      toast.error('Failed to fetch user donations')
    }
  }

  // Summary stats (using API data)
  const totalRaised = stats.totalRaised || 0
  const pendingCampaigns = (campaigns || []).filter((c) => c.status === 'pending')
  const approvedCampaigns = (campaigns || []).filter((c) => c.status === 'approved')
  const rejectedCampaigns = (campaigns || []).filter((c) => c.status === 'rejected')

  // Filter campaigns based on search
  const filteredPending = pendingCampaigns.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.creatorName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Chart: campaigns by status
  // Chart: campaign statuses with enhanced styling
  const statusChartData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      data: [approvedCampaigns.length, pendingCampaigns.length, rejectedCampaigns.length],
      backgroundColor: ['#22c55e', '#3b82f6', '#ef4444'],
      borderColor: ['#16a34a', '#2563eb', '#dc2626'],
      borderWidth: 2,
      hoverOffset: 10,
    }]
  }
  
  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 13, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed
          }
        }
      }
    }
  }

  // Chart: donations by category with enhanced colors
  const categoryMap = {}
  approvedCampaigns.forEach((c) => {
    categoryMap[c.category] = (categoryMap[c.category] || 0) + (c.currentAmount || 0)
  })
  
  // Color palette for categories
  const categoryColors = {
    'Medical': '#ef4444',
    'Education': '#3b82f6',
    'Disaster Relief': '#f59e0b',
    'Community': '#22c55e',
    'Health': '#10b981',
    'Environment': '#8b5cf6',
    'Other': '#6b7280'
  }
  
  const catChartData = {
    labels: Object.keys(categoryMap),
    datasets: [{
      label: 'Fundraised Amount (₹)',
      data: Object.values(categoryMap),
      backgroundColor: Object.keys(categoryMap).map(cat => categoryColors[cat] || '#6b7280'),
      borderColor: Object.keys(categoryMap).map(cat => categoryColors[cat] || '#6b7280'),
      borderWidth: 2,
      borderRadius: 8,
      hoverBackgroundColor: Object.keys(categoryMap).map(cat => {
        const base = categoryColors[cat] || '#6b7280'
        return base + 'dd' // Add transparency on hover
      })
    }]
  }

  // Chart: monthly donations with enhanced styling
  const monthMap = {}
  donations.forEach((d) => {
    const date = new Date(d.createdAt)
    const month = date.toLocaleString('en-IN', { month: 'short', year: '2-digit' })
    monthMap[month] = (monthMap[month] || 0) + d.amount
  })
  const monthChartData = {
    labels: Object.keys(monthMap).slice(-6),
    datasets: [{
      label: 'Monthly Donations (₹)',
      data: Object.values(monthMap).slice(-6),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.15)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#22c55e',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: '#16a34a'
    }]
  }
  
  // Chart: top campaigns by current amount
  const topCampaigns = (campaigns || [])
    .filter(c => c.status === 'approved')
    .sort((a, b) => (b.currentAmount || 0) - (a.currentAmount || 0))
    .slice(0, 5)
  
  const topCampaignsChartData = {
    labels: topCampaigns.map(c => c.title.slice(0, 20)),
    datasets: [{
      label: 'Amount Raised (₹)',
      data: topCampaigns.map(c => c.currentAmount || 0),
      backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'],
      borderColor: ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb'],
      borderWidth: 2,
      borderRadius: 8,
      hoverBackgroundColor: ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb']
    }]
  }

  const topCampaignsChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12, weight: '500' },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return '₹' + context.parsed.x.toLocaleString('en-IN')
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: function(value) {
            return '₹' + (value / 100000).toFixed(1) + 'L'
          }
        }
      }
    }
  }
  
  const monthChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return '₹' + context.parsed.y.toLocaleString('en-IN')
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { callback: function(value) { return '₹' + (value / 1000).toFixed(0) + 'K' } }
      }
    }
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'pending', label: `⏳ Pending (${stats.campaignsByStatus?.pending || 0})`, icon: '⏳' },
    { id: 'all', label: `📋 All Campaigns (${stats.totalCampaigns || 0})`, icon: '📋' },
    { id: 'donations', label: `💳 Donations (${stats.totalDonations || 0})`, icon: '💳' },
    { id: 'users', label: `👥 Users (${stats.totalUsers || 0})`, icon: '👥' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
  ]

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-brand-500 rounded-full border-t-transparent" />
        <p className="text-neutral-600 dark:text-neutral-400">Loading admin dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Debug Info - Show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800">
          <p>📊 Data Status: Campaigns={campaigns.length}, Donations={donations.length}, Users={users.length}</p>
        </div>
      )}

      {/* Error Banner */}
      {apiError && (
        <div className="mb-6 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-warning-600 dark:text-warning-400 text-xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-warning-900 dark:text-warning-300">Error Loading Admin Data</h3>
              <p className="text-sm text-warning-800 dark:text-warning-400 mt-1">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">🛡️ Admin Dashboard</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">Manage campaigns, monitor donations, and view platform analytics</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-brand-600">{formatINR(totalRaised)}</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Raised</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Total Campaigns', value: stats.totalCampaigns || 0, icon: '📋', color: 'slate' },
          { label: 'Pending Review', value: stats.campaignsByStatus?.pending || 0, icon: '⏳', color: 'amber' },
          { label: 'Approved', value: stats.campaignsByStatus?.approved || 0, icon: '✅', color: 'green' },
          { label: 'Total Donations', value: stats.totalDonations || 0, icon: '💳', color: 'purple' },
          { label: 'Total Users', value: stats.totalUsers || 0, icon: '👥', color: 'blue' },
        ].map((s, idx) => (
          <div key={idx} className="card p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-6 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchTerm('') }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white dark:bg-neutral-700 shadow text-brand-500' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Campaign Status Distribution</h3>
              <div className="flex justify-center">
                <div style={{ maxWidth: '300px', width: '100%' }}>
                  <Doughnut data={statusChartData} options={statusChartOptions} />
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {donations?.slice(0, 5).map((d) => (
                  <div key={d._id} className="flex items-center justify-between text-sm border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">{safeSlice(d.campaignId?.title, 30)}...</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">{new Date(d.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <p className="font-bold text-brand-600">{formatINR(d.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Performance */}
          {Object.keys(categoryMap).length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Top Performing Categories</h3>
              <Bar data={catChartData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' } }, scales: { x: { stacked: false } } }} />
            </div>
          )}
        </div>
      )}

      {/* PENDING APPROVAL TAB */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by campaign title or creator name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400"
            />
          </div>

          {filteredPending.length === 0 ? (
            <div className="text-center py-16 card">
              <p className="text-5xl mb-3">✅</p>
              <p className="text-slate-600">No pending campaigns!</p>
            </div>
          ) : (
            filteredPending.map((c) => (
              <div key={c._id} className="card p-5 flex flex-col md:flex-row gap-4 hover:shadow-lg transition-shadow">
                <img src={c.imageUrl || '/campaigns/relief.jpg'} className="h-20 w-28 rounded-xl object-cover flex-shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{c.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{c.description}</p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                    <span>👤 {c.creatorName || 'Unknown'}</span>
                    <span>🎯 Goal: {formatINR(c.goalAmount)}</span>
                    <span>📊 Current: {formatINR(c.currentAmount || 0)}</span>
                    <span>🏷️ {c.category}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 items-center">
                  <button onClick={() => openApprovalModal(c, 'approved')} className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm hover:bg-green-600 transition-colors font-medium">
                    ✅ Approve
                  </button>
                  <button onClick={() => openApprovalModal(c, 'rejected')} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-sm hover:bg-red-200 transition-colors font-medium">
                    ❌ Reject
                  </button>
                  <button onClick={() => deleteCampaign(c._id)} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl text-sm hover:bg-red-100 hover:text-red-700 transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ALL CAMPAIGNS TAB */}
      {activeTab === 'all' && (
        <div className="space-y-3">
          {campaigns.length === 0 ? (
            <div className="text-center py-16 card">
              <p className="text-5xl mb-3">📭</p>
              <p className="text-slate-600">No campaigns yet</p>
            </div>
          ) : (
            campaigns.map((c) => (
              <div key={c._id} className="card p-4 flex flex-col md:flex-row items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                <img 
                  src={c.imageUrl || '/campaigns/relief.jpg'} 
                  onerror="this.src='/campaigns/relief.jpg'" 
                  className="h-12 w-16 rounded-lg object-cover flex-shrink-0" 
                  alt={c.title} 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{c.title}</p>
                    <span className={`badge text-xs px-2 py-1 rounded-full ${statusStyles[c.status] || ''}`}>{c.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    👤 {c.creatorName || 'Unknown'} · 🎯 {formatINR(c.goalAmount)} · 📊 {formatINR(c.currentAmount || 0)} · {c.category}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0 w-full md:w-auto">
                  {c.status === 'pending' && (
                    <>
                      <button onClick={() => openApprovalModal(c, 'approved')} className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium flex-1 md:flex-none">Approve</button>
                      <button onClick={() => openApprovalModal(c, 'rejected')} className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex-1 md:flex-none">Reject</button>
                    </>
                  )}
                  {c.status === 'approved' && (
                    <div className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg flex-1 md:flex-none">
                      ✅ {new Date(c.approvedAt).toLocaleDateString('en-IN')}
                    </div>
                  )}
                  {c.status === 'rejected' && (
                    <div className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg flex-1 md:flex-none">
                      ❌ Rejected
                    </div>
                  )}
                  <button onClick={() => deleteCampaign(c._id)} className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors font-medium flex-1 md:flex-none">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* DONATIONS TAB */}
      {activeTab === 'donations' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-left border-b border-slate-100 dark:border-slate-700">
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Donor ID</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Campaign</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Amount</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Payment ID</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-400">No donations yet</td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white text-xs font-mono">{safeSlice(d.userId, 12)}...</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">{d.campaignId?.title || 'Unknown'}</td>
                      <td className="px-4 py-3 font-bold text-brand-600">{formatINR(d.amount)}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs font-mono">{safeSlice(d.paymentId, 15)}...</td>
                      <td className="px-4 py-3"><span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">✅ Verified</span></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="card overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">👥 Users Management</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">View users, suspend accounts, and check donation history</p>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">No users yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">User</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Joined</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <React.Fragment key={u._id}>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{u.fullName}</p>
                              <p className="text-xs text-slate-500">{safeSlice(u.clerkId, 20)}...</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${
                              u.isSuspended
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            }`}>
                              {u.isSuspended ? '🚫 Suspended' : '✅ Active'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                            {new Date(u.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => viewUserDonations(u._id)}
                                className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                              >
                                💳 Donations
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(u)
                                  setShowSuspendModal(true)
                                  setSuspendReason('')
                                }}
                                className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                                  u.isSuspended
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                }`}
                              >
                                {u.isSuspended ? '✓ Unsuspend' : '🚫 Suspend'}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Donation History Row */}
                        {userDonations[u._id] && (
                          <tr className="bg-slate-100/50 dark:bg-slate-800/30">
                            <td colSpan="5" className="px-4 py-4">
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">💳 Donation History ({userDonations[u._id].length})</p>
                                {userDonations[u._id].length === 0 ? (
                                  <p className="text-xs text-slate-500 italic">No donations yet</p>
                                ) : (
                                  <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {userDonations[u._id].map((d) => (
                                      <div key={d._id} className="flex justify-between items-center text-xs bg-brand-50 dark:bg-neutral-800 p-2 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                        <div>
                                          <p className="font-medium text-slate-900 dark:text-white">{d.campaignId?.title}</p>
                                          <p className="text-slate-500 dark:text-slate-400">{new Date(d.createdAt).toLocaleDateString('en-IN')}</p>
                                        </div>
                                        <p className="font-bold text-brand-600">{formatINR(d.amount)}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Row 1: Donation Growth & Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">📈 Donation Growth Chart</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Monthly donation trends</p>
              {Object.keys(monthMap).length > 0 ? (
                <Line data={monthChartData} options={monthChartOptions} />
              ) : (
                <div className="text-center py-8 text-slate-400">No data available</div>
              )}
            </div>
            
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">🏆 Campaign Categories Chart</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Donations by category</p>
              {Object.keys(categoryMap).length > 0 ? (
                <Bar data={catChartData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
              ) : (
                <div className="text-center py-8 text-slate-400">No data available</div>
              )}
            </div>
          </div>

          {/* Row 2: Top Campaigns Chart */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">⭐ Top Campaigns Chart</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Top performing campaigns by amount raised</p>
            {topCampaigns.length > 0 ? (
              <div style={{ height: topCampaigns.length * 60 }}>
                <Bar data={topCampaignsChartData} options={topCampaignsChartOptions} />
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">No approved campaigns yet</div>
            )}
          </div>

          {/* Row 3: Platform Overview */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Platform Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-xl">
                <p className="text-3xl font-bold text-slate-600 mb-2">{stats.totalCampaigns || 0}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Campaigns</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p className="text-3xl font-bold text-green-600 mb-2">{stats.campaignsByStatus?.approved || 0}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Approved</p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <p className="text-3xl font-bold text-amber-600 mb-2">{stats.campaignsByStatus?.pending || 0}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Under Review</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="text-3xl font-bold text-purple-600 mb-2">{stats.totalDonations || 0}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Donations</p>
              </div>
            </div>
          </div>

          {/* Row 4: Key Metrics */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Key Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Avg Campaign Goal', value: campaigns.length > 0 ? formatINR(campaigns.reduce((sum, c) => sum + (c.goalAmount || 0), 0) / campaigns.length) : '₹0' },
                { label: 'Approval Rate', value: campaigns.length > 0 ? `${((stats.campaignsByStatus?.approved || 0 / campaigns.length) * 100).toFixed(1)}%` : '0%' },
                { label: 'Avg Donation', value: stats.avgDonation ? formatINR(stats.avgDonation) : '₹0' },
                { label: 'Total Raised', value: formatINR(stats.totalRaised || 0) },
              ].map((metric, idx) => (
                <div key={idx} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-xs text-slate-600 mb-2">{metric.label}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL MODAL */}
      {showApprovalModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              {modalAction === 'approved' ? '✅ Approve Campaign' : '❌ Reject Campaign'}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4\">\n              {selectedCampaign.title}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {modalAction === 'approved' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={modalAction === 'approved' ? 'Add any approval notes...' : 'Explain why this campaign is being rejected...'}
                rows="4"
                maxLength="500"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1\">{comments.length}/500</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false)
                  setComments('')
                }}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={updateStatus}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${
                  modalAction === 'approved'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {modalAction === 'approved' ? '✅ Approve' : '❌ Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUSPENSION MODAL */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              {selectedUser.isSuspended ? '✓ Unsuspend User' : '🚫 Suspend User'}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              {selectedUser.fullName} ({selectedUser.email})
            </p>
            
            {!selectedUser.isSuspended && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Suspension Reason (Required)
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Explain why you're suspending this user..."
                  rows="3"
                  maxLength="300"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1\">{suspendReason.length}/300</p>
              </div>
            )}

            {selectedUser.isSuspended && selectedUser.suspensionReason && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Current Reason:</p>
                <p className="text-sm text-red-600 dark:text-red-300">{selectedUser.suspensionReason}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuspendModal(false)
                  setSelectedUser(null)
                  setSuspendReason('')
                }}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendUser}
                disabled={!selectedUser.isSuspended && !suspendReason}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${
                  selectedUser.isSuspended
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {selectedUser.isSuspended ? '✓ Unsuspend' : '🚫 Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
