// CreateCampaignPage
import React from 'react'
import CampaignForm from '../components/campaign/CampaignForm'

export function CreateCampaignPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="section-title">Start a Campaign</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Fill in the details below. Your campaign will be reviewed before going live.
        </p>
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-8">
        <CampaignForm />
      </div>
    </div>
  )
}
export default CreateCampaignPage
