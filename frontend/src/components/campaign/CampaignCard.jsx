// CampaignCard – modern professional campaign summary card with animations
import React, { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

// Helper to format currency in INR
export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

// Helper to calculate days remaining from deadline
const daysRemaining = (deadline) => {
  const diff = new Date(deadline) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// Category badge color mapping - professional palette
const categoryColors = {
  Technology: 'bg-neutral-100 dark:bg-neutral-950/30 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800',
  Education: 'bg-success-50 dark:bg-success-950/30 text-success-700 dark:text-success-300 border border-success-200 dark:border-success-800',
  Health: 'bg-warning-50 dark:bg-warning-950/30 text-warning-700 dark:text-warning-300 border border-warning-200 dark:border-warning-800',
  Environment: 'bg-success-50 dark:bg-success-950/30 text-success-700 dark:text-success-300 border border-success-200 dark:border-success-800',
  Community: 'bg-brand-100 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800',
  Arts: 'bg-brand-100 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800',
  'Disaster Relief': 'bg-warning-50 dark:bg-warning-950/30 text-warning-700 dark:text-warning-300 border border-warning-200 dark:border-warning-800',
  default: 'bg-neutral-50 dark:bg-neutral-700/30 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700',
}

export default memo(function CampaignCard({ campaign }) {
  const { _id: id, title, description, category, goalAmount, currentAmount = 0, deadline, imageUrl } = campaign
  const [imgError, setImgError] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [hovering, setHovering] = useState(false)

  // Calculate progress percentage (capped at 100%). Handle missing/zero goal gracefully.
  const progress = goalAmount && goalAmount > 0 ? Math.min(100, Math.round((currentAmount / goalAmount) * 100)) : 0
  const days = daysRemaining(deadline)
  const colorClass = categoryColors[category] || categoryColors.default
  
  // Use imageUrl directly - no fallback, to see if image loads
  const imageSrc = imageUrl || '/campaigns/relief.jpg'

  // Calculate funding status
  const isFunded = progress >= 100
  const isEnded = days === 0

  const handleShare = (e) => {
    e.preventDefault()
    const text = `Check out "${title}" on FundHope - Help make a difference!`
    const url = `${window.location.origin}/campaigns/${id}`
    
    if (navigator.share) {
      navigator.share({ title, text, url })
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    }
  }

  const handleBookmark = (e) => {
    e.preventDefault()
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? 'Removed from saved' : 'Saved to your collection')
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  }

  const hoverVariants = {
    initial: { y: 0 },
    hover: {
      y: -8,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-full"
    >
      <Link to={`/campaigns/${id}`} className="group">
        <motion.div
          variants={hoverVariants}
          initial="initial"
          whileHover="hover"
          onHoverStart={() => setHovering(true)}
          onHoverEnd={() => setHovering(false)}
          className="card-interactive h-full overflow-hidden flex flex-col hover:shadow-xl transition-shadow"
        >
          
          {/* Image Container - SIMPLIFIED */}
          <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-800" style={{ height: '224px', width: '100%' }}>
            <img
              src={imageSrc}
              alt={title}
              onError={(e) => {
                console.error('Image load error:', imageSrc)
                setImgError(true)
                e.target.src = '/campaigns/relief.jpg'
              }}
              onLoad={() => console.log('Image loaded:', imageSrc)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            
            {/* Overlay gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
              animate={hovering ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Status badges */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
              <motion.span
                className={`badge ${colorClass} text-xs font-semibold`}
                animate={hovering ? { scale: 1.05 } : { scale: 1 }}
              >
                {category}
              </motion.span>
              <div className="flex flex-col gap-2 items-end">
                {isFunded ? (
                  <span className="badge-success text-xs font-semibold whitespace-nowrap">✓ Funded</span>
                ) : isEnded ? (
                  <span className="badge-warning text-xs font-semibold whitespace-nowrap">Ended</span>
                ) : (
                  <span className="badge-secondary text-xs font-semibold whitespace-nowrap">{days}d left</span>
                )}
              </div>
            </div>

            {/* Action Buttons on Hover */}
            <motion.div
              className="absolute bottom-3 right-3 flex gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={hovering ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-brand-50/90 dark:bg-neutral-800/90 rounded-lg hover:bg-brand-100 dark:hover:bg-neutral-700 transition-colors shadow-lg"
                title="Share"
              >
                <span className="text-lg">🔗</span>
              </motion.button>
              <motion.button
                onClick={handleBookmark}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg transition-colors shadow-lg ${
                  isBookmarked
                    ? 'bg-brand-500 text-white'
                    : 'bg-brand-50/90 dark:bg-neutral-800/90 hover:bg-brand-100 dark:hover:bg-neutral-700'
                }`}
                title="Bookmark"
              >
                <span className="text-lg">{isBookmarked ? '❤️' : '🤍'}</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Content Container */}
          <div className="flex flex-col flex-1 p-5">
            {/* Title */}
            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-snug line-clamp-2 mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {title}
            </h3>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4 flex-1">
              {description}
            </p>

            {/* Progress Section */}
            <div className="space-y-3">
              {/* Animated Progress bar */}
              <div className="space-y-2">
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                  />
                </div>
                
                {/* Progress text */}
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-0.5">Raised</p>
                    <p className="font-bold text-brand-600 dark:text-brand-400 text-sm">
                      {formatINR(currentAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-0.5">Goal</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      {formatINR(goalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Percentage with animation */}
              <motion.div
                className="pt-2 border-t border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.p
                  className="text-sm font-bold text-slate-900 dark:text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.span
                    className="text-brand-600"
                    animate={{ color: progress > 75 ? '#00B74D' : '#1a1a1a' }}
                  >
                    {progress}%
                  </motion.span>
                  {' '}
                  <span className="text-slate-500 dark:text-slate-500 font-normal">funded</span>
                </motion.p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
})
