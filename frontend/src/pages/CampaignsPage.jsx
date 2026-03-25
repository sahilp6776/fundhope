// CampaignsPage – browse, search, filter, and sort campaigns
import React, { useState, useEffect } from 'react'
import api from '../config/api'
import CampaignCard from '../components/campaign/CampaignCard'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Education', 'Health', 'Medical', 'Environment', 'Community', 'Disaster Relief', 'Other']

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('latest')

  // Fetch all approved campaigns once from API
  useEffect(() => {
    const fetch = async () => {
      try {
        setError(null)
        const response = await api.get('/campaigns')
        const data = response.data
        setCampaigns(data)
        setFiltered(data)
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Failed to load campaigns. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  // Apply filters whenever search/category/sort changes
  useEffect(() => {
    let result = [...campaigns]

    // Text search – match title
    if (search) {
      result = result.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Category filter
    if (category !== 'All') {
      result = result.filter((c) => c.category === category)
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.currentAmount || 0) - (a.currentAmount || 0)
        case 'goal_high':
          return (b.goalAmount || 0) - (a.goalAmount || 0)
        case 'goal_low':
          return (a.goalAmount || 0) - (b.goalAmount || 0)
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline)
        case 'latest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

    setFiltered(result)
  }, [search, category, sortBy, campaigns])

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Page header */}
        <div className="mb-12">
          <h1 className="section-title mb-2">Explore Campaigns</h1>
          <p className="section-subtitle">
            Browse and support {filtered.length} active campaign{filtered.length !== 1 ? 's' : ''} making a difference
          </p>
        </div>

        {/* Filters section */}
        <div className="space-y-6 mb-10">
          {/* Search bar */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">Search</label>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search campaigns by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Category filter pills */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">Category</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    category === cat
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sort dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                <option value="latest">Latest First</option>
                <option value="popular">Most Popular</option>
                <option value="goal_high">Goal: High to Low</option>
                <option value="goal_low">Goal: Low to High</option>
                <option value="deadline">Deadline Soon</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns grid */}
        {error && (
          <div className="card p-6 mb-8 bg-warning-50 dark:bg-warning-950/30 border border-warning-200 dark:border-warning-800">
            <p className="text-warning-700 dark:text-warning-300"><strong>Error:</strong> {error}</p>
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-96 animate-pulse">
                <div className="h-56 bg-slate-200 dark:bg-slate-700" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-slate-900 dark:text-white text-xl font-semibold mb-2">No campaigns found</p>
            <p className="text-slate-600 dark:text-slate-400">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((c) => <CampaignCard key={c._id} campaign={c} />)}
          </div>
        )}
      </div>
    </div>
  )
}
