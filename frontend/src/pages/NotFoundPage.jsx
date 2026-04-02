import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-black text-neutral-200 dark:text-neutral-800">404</p>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mt-4 mb-2">Page Not Found</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary">← Back to Home</Link>
    </div>
  )
}
