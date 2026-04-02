/**
 * 🥈 STEP 2 — Load Razorpay script dynamically
 * This utility function loads the Razorpay payment gateway script only when needed
 * Reduces initial page load by deferring heavy payment script until required
 */

export function loadRazorpay() {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    
    script.onload = () => {
      console.log('✅ Razorpay script loaded successfully')
      resolve(true)
    }
    
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script')
      resolve(false)
    }

    document.body.appendChild(script)
  })
}

/**
 * Initialize Razorpay checkout with payment options
 * @param {Object} options - Razorpay payment gateway options
 * @param {string} options.key - Razorpay public key
 * @param {number} options.amount - Amount in paise (multiply INR by 100)
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.orderId - Razorpay order ID
 * @param {object} options.handler - Success callback handler
 * @param {string} options.name - Business name
 * @param {string} options.description - Payment description
 * @param {object} options.prefill - User prefill data
 * @param {Function} options.onDismiss - Modal dismiss callback
 * @param {Function} options.onError - Payment error callback
 */
export function openRazorpayCheckout(options) {
  try {
    if (!window.Razorpay) {
      throw new Error('Razorpay is not loaded')
    }

    const razorpayInstance = new window.Razorpay(options)
    
    // Handle failed payments
    if (options.onError) {
      razorpayInstance.on('payment.failed', options.onError)
    }

    razorpayInstance.open()
    return true
  } catch (error) {
    console.error('❌ Error opening Razorpay checkout:', error)
    return false
  }
}

export default { loadRazorpay, openRazorpayCheckout }
