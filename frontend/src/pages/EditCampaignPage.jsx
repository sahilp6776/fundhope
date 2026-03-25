// EditCampaignPage – loads existing campaign then renders form
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import api from '../config/api'
import CampaignForm from '../components/campaign/CampaignForm'
import toast from 'react-hot-toast'

export default function EditCampaignPage() {
  const { id } = useParams()
  const { user } = useUser()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await api.get(`/campaigns/${id}`)
        if (!response.data) { toast.error('Campaign not found'); navigate('/dashboard'); return }
        const data = response.data
        
        // Only owner or admin can edit
        const isOwner = data.createdBy === user?.id
        const isAdmin = user?.publicMetadata?.role === 'admin'
        
        if (!isOwner && !isAdmin) {
          toast.error('You do not have permission to edit this campaign')
          navigate('/')
          return
        }
        setCampaign(data)
      } catch (err) {
        console.error('Error loading campaign:', err)
        toast.error('Campaign not found')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetch()
  }, [id, user?.id])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-10 w-10 border-4 border-brand-500 rounded-full border-t-transparent" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="section-title mb-8">Edit Campaign</h1>
      <div className="bg-brand-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-8">
        <CampaignForm existingCampaign={campaign} />
      </div>
    </div>
  )
}
