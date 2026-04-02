// CampaignDetailPage – full campaign view with donation widget and comments
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import api from '../config/api'
import DonationWidget from '../components/donation/DonationWidget'
import Comments from '../components/campaign/Comments'
import { formatINR } from '../components/campaign/CampaignCard'
import toast from 'react-hot-toast'

// Countdown timer component
function Countdown({ deadline }) {
  const [timeLeft, setTimeLeft] = useState({})

  useEffect(() => {
    const calc = () => {
      const diff = new Date(deadline) - new Date()
      if (diff <= 0) return setTimeLeft({ ended: true })
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
      })
    }
    calc()
    const timer = setInterval(calc, 60000)
    return () => clearInterval(timer)
  }, [deadline])

  if (timeLeft.ended) return <span className="text-red-500 font-semibold">Campaign Ended</span>

  return (
    <div className="flex gap-3">
      {[['Days', timeLeft.days], ['Hours', timeLeft.hours], ['Min', timeLeft.minutes]].map(([label, val]) => (
        <div key={label} className="text-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 min-w-[60px]">
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{val ?? 0}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      ))}
    </div>
  )
}

// Social share buttons
function ShareButtons({ campaignId, title }) {
  const url = `${window.location.origin}/campaigns/${campaignId}`

  const copyLink = () => {
    navigator.clipboard.writeText(url)
    toast.success('Link copied!')
  }

  const whatsapp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - Support this campaign! ${url}`)}`)
  const email = () => window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Support this campaign: ${url}`)}`)

  return (
    <div className="flex gap-2">
      <button onClick={copyLink} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium text-slate-700 dark:text-slate-300">
        🔗 Copy Link
      </button>
      <button onClick={whatsapp} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors font-medium">
        💬 WhatsApp
      </button>
      <button onClick={email} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950/40 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900/50 transition-colors font-medium">
        📧 Email
      </button>
    </div>
  )
}

export default function CampaignDetailPage() {
  const { id } = useParams()
  const { user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgError, setImgError] = useState(false)

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true)
    }
  }

  useEffect(() => {
    // Reset image error when page loads or ID changes
    setImgError(false)
    
    const fetchCampaign = async () => {
      try {
        const response = await api.get(`/campaigns/${id}`)
        if (!response.data) {
          toast.error('Campaign not found')
          navigate('/campaigns')
          return
        }
        setCampaign(response.data)
      } catch (err) {
        toast.error('Failed to load campaign')
      } finally {
        setLoading(false)
      }
    }
    fetchCampaign()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return
    try {
      const token = await getToken()
      if (!token) {
        toast.error('Authentication required')
        return
      }
      const headers = { Authorization: `Bearer ${token}` }
      await api.delete(`/campaigns/${id}`, { headers })
      toast.success('Campaign deleted')
      navigate('/dashboard')
    } catch (err) {
      console.error('Failed to delete campaign:', err.response?.data || err.message)
      toast.error(err.response?.data?.error || 'Failed to delete campaign')
    }
  }

  // Refetch campaign when donation completed
  const handleDonationSuccess = async () => {
    try {
      const response = await api.get(`/campaigns/${id}`)
      if (response.data) {
        setCampaign(response.data)
        toast.success('Campaign updated!')
      }
    } catch (err) {
      console.error('Failed to refresh campaign:', err)
    }
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-brand-500 rounded-full border-t-transparent" />
    </div>
  )

  if (!campaign) return null

  // Fallback image - use a minimal placeholder SVG
  const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%22800%22%3E%3Crect fill=%22%23f3f4f6%22 width=%221200%22 height=%22800%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2236%22 fill=%22%239ca3af%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E'

  // Get image source with validation
  const getDetailImageSrc = () => {
    if (imgError) return FALLBACK_IMAGE
    
    if (!campaign.imageUrl) return FALLBACK_IMAGE
    
    const url = String(campaign.imageUrl).trim()
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//') || url.startsWith('/')) {
      return url
    }
    
    return FALLBACK_IMAGE
  }

  const campaignImageUrl = getDetailImageSrc()
  const progress = Math.min(100, Math.round((campaign.currentAmount / campaign.goalAmount) * 100))
  const isOwner = user?.id === campaign.createdBy
  const isAdmin = user?.publicMetadata?.role === 'admin'

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Pending status notice */}
        {campaign.status === 'pending' && (
          <div className="bg-warning-50 dark:bg-warning-950/30 border border-warning-200 dark:border-warning-800 rounded-lg p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <p className="text-warning-700 dark:text-warning-300 font-medium">This campaign is pending admin approval.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main content – left 2/3 */}
          <div className="lg:col-span-2 space-y-8">

            {/* Campaign image */}
            <div className="rounded-xl overflow-hidden h-80 md:h-96 shadow-lg">
              <img
                src={campaignImageUrl}
                alt={campaign.title}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title + meta */}
            <div>
              <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div className="flex-1">
                  <span className="badge-primary text-sm mb-3">
                    {campaign.category}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2">{campaign.title}</h1>
                </div>
                {/* Owner/Admin actions */}
                {(isOwner || isAdmin) && (
                  <div className="flex gap-2 flex-wrap justify-end">
                    {isOwner && (
                      <Link to={`/campaigns/${id}/edit`} className="btn-secondary btn-sm">
                        ✏️ Edit
                      </Link>
                    )}
                    <button onClick={handleDelete} className="btn-sm text-sm px-4 py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-medium">
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm">
                by <span className="font-semibold text-slate-700 dark:text-slate-300">{campaign.creatorName}</span>
              </p>
            </div>

            {/* Progress stats */}
            <div className="card p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                    {formatINR(campaign.currentAmount || 0)}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">raised of {formatINR(campaign.goalAmount)}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{progress}%</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">funded</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Time remaining</p>
                  <Countdown deadline={campaign.deadline} />
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="pt-2">
                <ShareButtons campaignId={id} title={campaign.title} />
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About this Campaign</h2>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                {campaign.description}
              </p>
            </div>

            {/* Comments section */}
            <div className="card p-6">
              <Comments campaignId={id} />
            </div>
          </div>

          {/* Sidebar – right 1/3 */}
          <div className="space-y-5">
            {/* Donation widget */}
            <DonationWidget campaign={campaign} onDonationSuccess={handleDonationSuccess} />

            {/* Campaign details card */}
            <div className="card p-5 space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white">Campaign Details</h4>
              <div className="space-y-3">
                {[
                  ['Goal', formatINR(campaign.goalAmount)],
                  ['Category', campaign.category],
                  ['Deadline', new Date(campaign.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
                  ['Status', campaign.status],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm py-2 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                    <span className="text-slate-600 dark:text-slate-400">{label}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
