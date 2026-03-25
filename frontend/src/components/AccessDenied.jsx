// AccessDenied – reusable access denied page component
import React from 'react'

export default function AccessDenied({ message = 'Access Denied', reason = 'You do not have permission to access this page.', userInfo = null }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 dark:bg-neutral-900 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{message}</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {reason}
        </p>
        
        {userInfo && (
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
            {userInfo.userId && <p><strong>User ID:</strong> {userInfo.userId}</p>}
            {userInfo.email && <p><strong>Email:</strong> {userInfo.email}</p>}
            {userInfo.role && <p><strong>Your Role:</strong> {userInfo.role}</p>}
          </div>
        )}
        
        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          ← Back Home
        </button>
      </div>
    </div>
  )
}
