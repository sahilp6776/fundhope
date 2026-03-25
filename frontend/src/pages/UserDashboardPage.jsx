// UserDashboardPage – role-based dashboard for creators and donors
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import api from '../config/api'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { formatINR } from '../components/campaign/CampaignCard'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

// Status badge styling
const statusStyles = {
  approved: 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300',
  pending: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  rejected: 'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
}

export default function UserDashboardPage() {
  const { user } = useUser()
  const [campaigns, setCampaigns] = useState([])
  const [donations, setDonations] = useState([])
  const [userRole, setUserRole] = useState('donor') // 'creator' or 'donor'
  const [activeTab, setActiveTab] = useState('campaigns')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's campaigns from API
        const campaignsResponse = await api.get('/campaigns/user/me')
        setCampaigns(campaignsResponse.data || [])

        // Fetch user's donations from payments endpoint
        try {
          const donationsResponse = await api.get('/payments/user/me')
          setDonations(donationsResponse.data || [])
        } catch {
          setDonations([])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchData()
  }, [user])

  // Compute summary stats
  const totalRaised = campaigns.reduce((s, c) => s + (c.currentAmount || 0), 0)
  const totalDonated = donations.reduce((s, d) => s + (d.amount || 0), 0)
  const approvedCount = campaigns.filter((c) => c.status === 'approved').length

  // Bar chart data – top 5 campaigns by raised amount
  const barData = {
    labels: campaigns.slice(0, 5).map((c) => c.title.slice(0, 15) + '...'),
    datasets: [{
      label: 'Raised (₹)',
      data: campaigns.slice(0, 5).map((c) => c.currentAmount || 0),
      backgroundColor: '#FFA500',
      borderRadius: 8,
    }]
  }

  // Donut chart – donation amounts by campaign
  const donutData = {
    labels: donations.slice(0, 5).map((d) => (d.campaignId?.title || d.campaignTitle || 'Campaign').slice(0, 15) + '...'),
    datasets: [{
      data: donations.slice(0, 5).map((d) => d.amount),
      backgroundColor: ['#FFA500', '#00B74D', '#E63946', '#14b8a6', '#6366f1'],
    }]
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-10 w-10 border-4 border-brand-500 rounded-full border-t-transparent" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

      {/* Header with Role Toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <img src={user.imageUrl} className="h-14 w-14 rounded-2xl object-cover" alt="avatar" />
          <div>
            <h1 className="section-title text-2xl">Welcome, {user.firstName}! 👋</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        
        {/* Role switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setUserRole('donor')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
              userRole === 'donor'
                ? 'bg-brand-600 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            👤 Donor
          </button>
          <button
            onClick={() => setUserRole('creator')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
              userRole === 'creator'
                ? 'bg-brand-600 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🎯 Creator
          </button>
        </div>
      </div>

      {/* DONOR DASHBOARD */}
      {userRole === 'donor' && (
        <>
          {/* Donor Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Donated', value: formatINR(totalDonated), icon: '💸', color: 'brand' },
              { label: 'Campaigns Supported', value: donations.length, icon: '❤️', color: 'success' },
              { label: 'Impact Badge', value: donations.length > 5 ? '⭐ VIP' : '✨ Active', icon: '🏆', color: 'warning' },
            ].map((stat) => (
              <div key={stat.label} className={`card p-6 border-l-4 border-${stat.color}-500`}>
                <p className="text-3xl mb-2">{stat.icon}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Donations Table */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Your Donations</h2>
            {donations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Campaign</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation) => (
                      <tr key={donation._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                          {donation.campaignId?.title || donation.campaignTitle || 'Campaign'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-brand-600 dark:text-brand-400">{formatINR(donation.amount)}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{new Date(donation.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`badge ${statusStyles[donation.status] || 'bg-slate-100 text-slate-700'}`}>
                            {donation.status || 'completed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400 text-center py-8">No donations yet. <Link to="/campaigns" className="text-brand-600 dark:text-brand-400 hover:underline">Start supporting campaigns!</Link></p>
            )}
          </div>
        </>
      )}

      {/* CREATOR DASHBOARD */}
      {userRole === 'creator' && (
        <>
          {/* Creator Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Campaigns', value: campaigns.length, icon: '📋', color: 'brand' },
              { label: 'Approved', value: approvedCount, icon: '✅', color: 'success' },
              { label: 'Total Raised', value: formatINR(totalRaised), icon: '💰', color: 'warning' },
              { label: 'Avg per Campaign', value: campaigns.length > 0 ? formatINR(totalRaised / campaigns.length) : '₹0', icon: '📊', color: 'brand' },
            ].map((stat) => (
              <div key={stat.label} className={`card p-5 border-t-4 border-${stat.color}-500`}>
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Campaign Charts */}
          {campaigns.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Fundraising Progress</h3>
                <Bar data={barData} options={{ responsive: true, plugins: { legend: { labels: { color: 'rgb(100, 116, 139)' } } } }} />
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Category Distribution</h3>
                <Doughnut data={donutData} options={{ responsive: true, plugins: { legend: { labels: { color: 'rgb(100, 116, 139)' } } } }} />
              </div>
            </div>
          )}

          {/* Campaigns Table */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Campaigns</h2>
              <Link to="/campaigns/create" className="btn-primary btn-sm">+ Create Campaign</Link>
            </div>
            
            {campaigns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Campaign</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Goal</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Raised</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Progress</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => {
                      const progress = Math.min(100, Math.round((campaign.currentAmount / campaign.goalAmount) * 100))
                      return (
                        <tr key={campaign._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium">{campaign.title.slice(0, 20)}...</td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{formatINR(campaign.goalAmount)}</td>
                          <td className="py-3 px-4 font-semibold text-brand-600 dark:text-brand-400">{formatINR(campaign.currentAmount)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{progress}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`badge ${statusStyles[campaign.status] || 'bg-slate-100 text-slate-700'}`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Link to={`/campaigns/${campaign._id}/edit`} className="text-brand-600 dark:text-brand-400 hover:underline text-sm font-semibold">
                              Edit
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400 text-center py-8">No campaigns yet. <Link to="/campaigns/create" className="text-brand-600 dark:text-brand-400 hover:underline">Create your first campaign!</Link></p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
