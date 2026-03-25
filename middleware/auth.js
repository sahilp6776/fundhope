// authMiddleware – verifies Clerk JWT tokens sent from frontend
// Uses @clerk/express for proper Express integration
// Every protected API route should use this middleware

let getAuth = null
try {
  getAuth = require('@clerk/express').getAuth
} catch (err) {
  console.warn('Clerk Express not available:', err.message)
}

const { createClerkClient } = require('@clerk/clerk-sdk-node')

let clerkClient = null
const hasClerkKey = process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.includes('YOUR')
if (hasClerkKey) {
  try {
    clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  } catch (err) {
    console.warn('Clerk SDK not available:', err.message)
    clerkClient = null
  }
}

// Protected route middleware – ensures user is authenticated
const authMiddleware = async (req, res, next) => {
  try {
    // Try to get auth from Clerk middleware first
    let userId = null
    let sessionClaims = null

    if (getAuth) {
      try {
        const auth = getAuth(req)
        userId = auth?.userId
        sessionClaims = auth?.sessionClaims
      } catch (err) {
        console.warn('getAuth error:', err.message)
      }
    }

    // If no userId from getAuth, return 401
    if (!userId) {
      console.warn('Auth attempt without valid userId')
      return res.status(401).json({ 
        error: 'Authentication Required', 
        message: 'Please sign in to access this feature. Your session may have expired.' 
      })
    }

    // Store auth info in request
    req.userId = userId
    req.sessionClaims = sessionClaims

    // default role (might be overwritten by Clerk data)
    req.userRole = 'user'

    // Fetch full user data for email, name and role if Clerk client available
    if (clerkClient) {
      try {
        const user = await clerkClient.users.getUser(userId)
        req.userEmail = user.emailAddresses?.[0]?.emailAddress || ''
        req.userName = user.firstName || req.userEmail || 'User'
        req.userMetadata = user.publicMetadata || {}
        req.userRole = user.publicMetadata?.role || 'user'
      } catch (userError) {
        console.warn('Could not fetch user details:', userError.message)
        // Continue with partial info from session claims
        req.userName = 'User'
        req.userEmail = ''
        req.userMetadata = sessionClaims?.publicMetadata || {}
        req.userRole = sessionClaims?.publicMetadata?.role || 'user'
      }
    } else {
      // Fallback: use session claims if Clerk client unavailable
      req.userMetadata = sessionClaims?.publicMetadata || {}
      req.userName = 'User'
      req.userEmail = ''
      req.userRole = sessionClaims?.publicMetadata?.role || 'user'
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error.message)
    return res.status(401).json({ 
      error: 'Authentication Error', 
      message: 'Failed to verify your identity. Please try signing in again.' 
    })
  }
}

// Admin-only middleware – checks user's role in Clerk public metadata
const adminMiddleware = async (req, res, next) => {
  try {
    // Get userId from @clerk/express (req.auth) or from getAuth
    let userId = req.auth?.userId
    if (!userId && getAuth) {
      try {
        const auth = getAuth(req)
        userId = auth?.userId
      } catch (err) {
        console.warn('Could not extract userId:', err.message)
      }
    }

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication Required',
        message: 'Please sign in to access admin features.'
      })
    }

    // Set userId on request for later use
    req.userId = userId

    // Get user from Clerk to check admin role
    if (clerkClient) {
      try {
        const user = await clerkClient.users.getUser(userId)
        const role = user.publicMetadata?.role

        if (role === 'admin') {
          req.userRole = 'admin'
          req.userName = user.firstName || user.emailAddresses?.[0]?.emailAddress || 'Admin'
          req.userEmail = user.emailAddresses?.[0]?.emailAddress || ''
          return next()
        }

        console.warn(`Admin access denied for user ${userId}. Role: ${role || 'none'}`)
        return res.status(403).json({
          error: 'Admin access required',
          userRole: role || 'user',
          message: 'Your account does not have admin privileges. Please set your role in Clerk Dashboard.'
        })
      } catch (error) {
        console.error('Error fetching user for admin check:', error.message)
        return res.status(403).json({ error: 'Admin access required' })
      }
    }

    // Fallback if Clerk client unavailable
    console.error('Clerk client not available for admin check')
    return res.status(403).json({ 
      error: 'Admin Access Required',
      message: 'Unable to verify admin status. Please try again or contact support.' 
    })
  } catch (error) {
    console.error('Admin middleware error:', error.message)
    return res.status(403).json({ 
      error: 'Admin Access Required',
      message: 'You do not have permission to access this resource. Contact support if you believe this is a mistake.' 
    })
  }
}

module.exports = { authMiddleware, adminMiddleware }
