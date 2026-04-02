// CampaignForm – reusable form for creating and editing campaigns
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import api from '../../config/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['Education', 'Health', 'Medical', 'Environment', 'Community', 'Disaster Relief', 'Other']

// Consistent image URLs for each category
const CATEGORY_IMAGES = {
  Education: 'https://images.unsplash.com/photo-1427508494785-cdfc56d50cb8?w=800&q=60',
  Health: 'https://images.unsplash.com/photo-1576091160550-112173e7f7cb?w=800&q=60',
  Medical: 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=800&q=60',
  Environment: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=60',
  Community: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=60',
  'Disaster Relief': 'https://images.unsplash.com/photo-1579621970563-eb1ead6e6f3e?w=800&q=60',
  Other: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=60',
}

export default function CampaignForm({ existingCampaign = null }) {
  const { user } = useUser()
  const navigate = useNavigate()
  const isEditing = !!existingCampaign

  // Form state initialized from existing campaign or defaults
  const [form, setForm] = useState({
    title: existingCampaign?.title || '',
    description: existingCampaign?.description || '',
    category: existingCampaign?.category || 'Education',
    goalAmount: existingCampaign?.goalAmount || '',
    deadline: existingCampaign?.deadline ? existingCampaign.deadline.split('T')[0] : '',
  })
  const [customImage, setCustomImage] = useState(null)
  const [customImagePreview, setCustomImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Handle text/select input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  // Handle image file upload with compression
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      return
    }

    // Compress image before converting to base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (!result) {
        toast.error('Failed to read image data')
        return
      }
      
      const img = new Image()
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Resize if image is too large
        const maxWidth = 1200
        const maxHeight = 1200
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width))
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height))
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Compress to JPEG with 80% quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)
        const base64Size = compressedBase64.length
        
        // Warn if compressed image is still too large
        if (base64Size > 2 * 1024 * 1024) {
          toast.warning('Compressed image is still large (may slow down loading)')
        }

        setCustomImage(compressedBase64)
        setCustomImagePreview(compressedBase64)
        toast.success('Image compressed and uploaded!')
      }
      img.onerror = () => {
        toast.error('Invalid image file. Please ensure it is a valid image.')
      }
      img.src = result
    }
    reader.onerror = () => {
      toast.error('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  // Validate form fields
  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (form.title.length > 100) errs.title = 'Title too long (max 100 chars)'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (form.description.length < 50) errs.description = 'Description too short (min 50 chars)'
    if (!form.goalAmount || Number(form.goalAmount) < 100) errs.goalAmount = 'Goal must be at least ₹100'
    if (!form.deadline) errs.deadline = 'Deadline is required'
    if (new Date(form.deadline) <= new Date()) errs.deadline = 'Deadline must be in the future'
    return errs
  }

  // Submit handler - Use MongoDB API instead of Firebase
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      toast.error('Please fix the errors below')
      return
    }

    setLoading(true)
    try {
      // Use custom image if uploaded, otherwise use category-based image
      const imageUrl = customImage || CATEGORY_IMAGES[form.category] || CATEGORY_IMAGES['Other']

      const campaignData = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        goalAmount: Number(form.goalAmount),
        deadline: new Date(form.deadline).toISOString(),
        imageUrl,
      }

      if (isEditing) {
        // Update existing campaign
        await api.patch(`/campaigns/${existingCampaign._id}`, campaignData)
        toast.success('Campaign updated successfully!')
        navigate(`/campaigns/${existingCampaign._id}`)
      } else {
        // Create new campaign with creator name
        const config = {
          headers: {
            'x-creator-name': user?.fullName || 'Creator',
            'x-user-name': user?.fullName || 'Creator'
          }
        }
        const response = await api.post('/campaigns', campaignData, config)
        toast.success('✅ Campaign created successfully! Awaiting admin approval.')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Campaign submit error:', error)
      const message = error.response?.data?.error || 'Failed to save campaign. Please try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Campaign Title *
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Give your campaign a compelling title"
          className={`input-field ${errors.title ? 'border-red-400 ring-red-200' : ''}`}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Description * (min 50 chars)
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={6}
          placeholder="Tell your story. Why does this campaign matter? How will the funds be used?"
          className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`}
        />
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 text-right">{form.description.length} chars</p>
        {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
      </div>

      {/* Category + Goal Amount row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Category *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="input-field"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Goal Amount (INR) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 font-medium">₹</span>
            <input
              type="number"
              name="goalAmount"
              value={form.goalAmount}
              onChange={handleChange}
              min="100"
              placeholder="50000"
              className={`input-field pl-8 ${errors.goalAmount ? 'border-red-400' : ''}`}
            />
          </div>
          {errors.goalAmount && <p className="text-red-500 text-xs mt-1">{errors.goalAmount}</p>}
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Campaign Deadline *</label>
        <input
          type="date"
          name="deadline"
          value={form.deadline}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          className={`input-field ${errors.deadline ? 'border-red-400' : ''}`}
        />
        {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Campaign Image
        </label>
        <div className="mb-4">
          <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-brand-300 dark:border-brand-700 rounded-lg cursor-pointer hover:border-brand-400 dark:hover:border-brand-600 transition-colors bg-brand-50/50 dark:bg-brand-950/20">
            <span className="text-brand-600 dark:text-brand-400 font-medium">📤 Upload Custom Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            {customImage ? '✅ Custom image uploaded' : 'PNG, JPG, or WebP (Max 5MB)'}
          </p>
        </div>
      </div>

      {/* Submit button */}
      <button 
        type="submit" 
        disabled={loading} 
        className={`btn-primary w-full flex items-center justify-center gap-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            {isEditing ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          isEditing ? '✏️ Update Campaign' : '🚀 Launch Campaign'
        )}
      </button>
    </form>
  )
}
