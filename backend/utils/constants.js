// Common constants used across the application

// Campaign statuses
const CAMPAIGN_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// Campaign categories
const CAMPAIGN_CATEGORIES = [
  'Education',
  'Health',
  'Medical',
  'Environment',
  'Community',
  'Disaster Relief',
  'Other'
]

// Donation statuses
const DONATION_STATUSES = {
  COMPLETED: 'completed',
  FAILED: 'failed',
  PENDING: 'pending'
}

// Input validation rules
const VALIDATION_RULES = {
  CAMPAIGN_TITLE_MIN: 5,
  CAMPAIGN_TITLE_MAX: 100,
  CAMPAIGN_DESC_MIN: 50,
  CAMPAIGN_DESC_MAX: 2000,
  CAMPAIGN_GOAL_MIN: 100,
  CAMPAIGN_GOAL_MAX: 10000000,
  DONATION_MIN: 10,
  DONATION_MAX: 100000
}

// Sanitize inputs to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/[<>]/g, '')  // Remove < and > to prevent HTML injection
    .slice(0, 2000)  // Limit length
}

const sanitizeCampaignData = (data) => {
  return {
    title: sanitizeInput(data.title),
    description: sanitizeInput(data.description),
    category: data.category,
    goalAmount: Math.max(VALIDATION_RULES.CAMPAIGN_GOAL_MIN, Math.min(VALIDATION_RULES.CAMPAIGN_GOAL_MAX, Number(data.goalAmount || 0))),
    deadline: data.deadline,
    imageUrl: data.imageUrl
  }
}

module.exports = {
  CAMPAIGN_STATUSES,
  CAMPAIGN_CATEGORIES,
  DONATION_STATUSES,
  VALIDATION_RULES,
  sanitizeInput,
  sanitizeCampaignData
}
