// Footer component with professional layout and links
import React from 'react'
import { Link } from 'react-router-dom'

// Social icons
const TwitterIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8.29 20c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
)

const LinkedInIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
  </svg>
)

const FacebookIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main footer content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            
            {/* Brand column */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 font-bold text-xl text-slate-900 dark:text-white mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                  F
                </div>
                <span>FundHope</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
                Empowering dreams through community support. We connect people with ideas that matter and make a real difference in their lives.
              </p>
              
              {/* Social links */}
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  aria-label="Twitter"
                  className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  <TwitterIcon />
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  <LinkedInIcon />
                </a>
                <a
                  href="#"
                  aria-label="Facebook"
                  className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  <FacebookIcon />
                </a>
              </div>
            </div>

            {/* Platform links */}
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm uppercase tracking-wider mb-4">Platform</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/campaigns" className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    Browse Campaigns
                  </Link>
                </li>
                <li>
                  <Link to="/campaigns/create" className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    Create Campaign
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support links */}
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm uppercase tracking-wider mb-4">Support</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200 dark:bg-slate-800" />

        {/* Bottom section */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <p>© {currentYear} FundHope. All rights reserved.</p>
            <p className="text-center md:text-right">
              Powered by <span className="font-semibold text-slate-700 dark:text-slate-300">Razorpay</span> & Secured by <span className="font-semibold text-slate-700 dark:text-slate-300">Clerk</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
