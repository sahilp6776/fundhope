// DonationWidget – handles Razorpay payment flow
import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import api from '../../config/api'
import toast from 'react-hot-toast'
import { formatINR } from '../campaign/CampaignCard'

const PRESET_AMOUNTS = [50, 100, 500, 1000]

// 🥉 STEP 3 — Safe Razorpay Script Loading
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => {
      console.log('✅ Razorpay script loaded')
      resolve(true)
    }
    script.onerror = () => {
      console.error('❌ Razorpay script failed to load')
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

export default function DonationWidget({ campaign, onDonationSuccess }) {
  const [razorpayReady, setRazorpayReady] = useState(!!window.Razorpay)

  // Load Razorpay script on component mount
  useEffect(() => {
    const initRazorpay = async () => {
      if (!window.Razorpay) {
        const loaded = await loadRazorpay()
        setRazorpayReady(loaded)
      }
    }
    initRazorpay()
  }, [])

  if (!campaign) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
        <p className="text-neutral-600 dark:text-neutral-400">Campaign data not loaded</p>
      </div>
    )
  }

  const { isSignedIn, user } = useUser()
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [donationComplete, setDonationComplete] = useState(false)

  // Get user info – from Clerk if available, otherwise use demo user
  const getUserInfo = () => {
    if (isSignedIn && user) {
      return {
        id: user.id,
        fullName: user.fullName || 'Demo User',
        email: user.primaryEmailAddress?.emailAddress || 'demo@example.com'
      }
    }
    // Demo mode – use placeholder user
    return {
      id: 'demo_user',
      fullName: 'Demo User',
      email: 'demo@example.com'
    }
  }

  // Handle donation initiation – calls backend to create order, then opens Razorpay
  const handleDonate = async () => {
    const donationAmount = Number(amount)
    if (isNaN(donationAmount) || donationAmount < 50) {
      toast.error('Minimum donation amount is ₹50')
      return
    }

    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      toast.error('Razorpay payment gateway not available. Please refresh the page.')
      return
    }

    setLoading(true)
    const userInfo = getUserInfo()

    try {
      // 🥇 STEP 4 — STEP 1: Call backend to create order
      const { data } = await api.post('/payments/create-order', {
        amount: donationAmount,
        campaignId: campaign._id,
        campaignTitle: campaign.title
      })

      const { orderId, amount: orderAmount, currency, keyId, isDemoMode } = data

      // If no keyId, we're in demo mode
      if (!keyId || isDemoMode) {
        // Demo mode – simulate success
        toast.success(`🎉 Demo: Your donation of ₹${donationAmount.toLocaleString('en-IN')} was successful!`)
        setAmount('')
        setDonationComplete(true)
        setTimeout(() => setDonationComplete(false), 3000)
        if (onDonationSuccess) {
          onDonationSuccess(donationAmount)
        }
        setLoading(false)
        return
      }

      // 🥇 STEP 4 — STEP 2: Create Razorpay options with order details
      const options = {
        key: keyId,
        amount: orderAmount,
        currency: currency,
        name: 'FundHope',
        description: `Donation to: ${campaign.title}`,
        order_id: orderId,
        prefill: {
          name: userInfo.fullName,
          email: userInfo.email
        },
        theme: {
          color: '#FFA500'
        },
        handler: async (response) => {
          try {
            // Handle successful payment
            toast.success(`🎉 Payment Successful!\nOrder ID: ${response.razorpay_order_id}`)
            console.log('Payment Response:', response)
            
            setDonationComplete(true)
            setAmount('')
            
            if (onDonationSuccess) {
              onDonationSuccess(donationAmount)
            }

            setTimeout(() => {
              setDonationComplete(false)
            }, 3000)
          } catch (error) {
            console.error('Error processing payment:', error)
            toast.error('Error processing payment details')
          } finally {
            setLoading(false)
          }
        }
      }

      // 🥇 STEP 4 — STEP 3: Open Razorpay checkout
      console.log('Opening Razorpay checkout...')
      const rzp = new window.Razorpay(options)
      
      // Handle payment errors
      rzp.on('payment.failed', (response) => {
        toast.error('❌ Payment failed. Please try again.')
        console.error('Payment Error:', response.error)
        setLoading(false)
      })

      // Open the payment modal
      rzp.open()

    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.response?.data?.error || 'Failed to process donation')
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
        💳 Make a Donation
      </h3>

      {donationComplete && (
        <div className="badge-success py-3 px-4 rounded-lg flex items-center gap-2">
          <span>✅</span>
          <span className="text-sm font-medium">Donation successful! Thank you</span>
        </div>
      )}

      {/* Display campaign fundraising progress */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Goal: {formatINR(campaign.goalAmount)}</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{Math.min(100, Math.round((campaign.currentAmount / campaign.goalAmount) * 100))}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(100, (campaign.currentAmount / campaign.goalAmount) * 100)}%` }} />
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{formatINR(campaign.currentAmount)} raised</p>
      </div>

      {/* Quick amount presets */}
      <div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Quick amounts</p>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(String(preset))}
              className={`py-2.5 px-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                amount === String(preset)
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-brand-300 dark:hover:border-brand-600'
              }`}
            >
              ₹{preset.toLocaleString('en-IN')}
            </button>
          ))}
        </div>
      </div>

      {/* Custom amount input */}
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Custom amount</p>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 dark:text-neutral-400 font-semibold text-lg">₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="50"
            className="input-field pl-10 text-lg font-semibold"
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Minimum: ₹50</p>
      </div>

      {/* Donate button */}
      <button
        onClick={handleDonate}
        disabled={loading || !amount || !razorpayReady}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold"
      >
        {loading ? (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
        ) : !razorpayReady ? (
          <>⏳ Loading Payment Gateway...</>
        ) : (
          <>💳 Donate {amount ? formatINR(Number(amount)) : 'Now'}</>
        )}
      </button>

      {/* Status message */}
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
        <span>🔒</span>
        <span>Secured by Razorpay · 100% safe & encrypted</span>
        {razorpayReady && <span>✅</span>}
      </div>

      {!isSignedIn && (
        <p className="text-center text-xs font-medium text-warning-700 dark:text-warning-400 bg-warning-50 dark:bg-warning-950/30 rounded-lg p-3">
          🔓 Demo mode: Donate without signing in
        </p>
      )}
    </div>
  )
}
