// Navbar – professional sticky navigation with clean design
import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useUser, useClerk, SignedIn, SignedOut } from '@clerk/clerk-react'
import { useTheme } from '../../context/ThemeContext'
import NotificationsPanel from './NotificationsPanel'

// Icon SVGs
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
)

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
)

export default function Navbar() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const demoMode = typeof window !== 'undefined' && localStorage.getItem('demo_admin_mode') === 'true'
  const isAdmin = user?.publicMetadata?.role === 'admin' || demoMode

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setDropdownOpen(false)
  }

  const navLinks = [
    { to: '/campaigns', label: 'Campaigns' },
    { to: '/campaigns/create', label: 'Create Campaign' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-brand-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-xs animate-fade-in-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-auto md:h-16 flex flex-col md:flex-row md:items-center md:justify-between py-4 md:py-0">
          
          {/* Logo Section */}
          <div className="flex items-center justify-between md:justify-start">
            <Link to="/" className="flex items-center gap-3 font-bold text-xl text-slate-900 dark:text-white hover:opacity-80 transition hover:scale-105 duration-300">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                F
              </div>
              <span>FundHope</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition hover:scale-110 duration-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className={`flex-col md:flex-row md:flex md:items-center md:gap-1 ${mobileMenuOpen ? 'flex mt-4 gap-2 animate-slide-down' : 'hidden'}`}>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg font-medium text-sm transition-all hover:scale-105 duration-300 ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                Admin Panel
              </NavLink>
            )}
          </div>

          {/* Right Section */}
          <div className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-3 ${mobileMenuOpen ? 'mt-4 pt-4 border-t border-slate-200 dark:border-slate-700' : 'hidden md:flex'}`}>
            {/* Notifications */}
            <SignedIn>
              <NotificationsPanel />
            </SignedIn>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
              aria-label="Toggle dark mode"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Auth section */}
            <SignedOut>
              <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                <Link
                  to="/sign-in"
                  className="px-4 py-2.5 text-center rounded-lg font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="btn-primary btn-sm"
                >
                  Get Started
                </Link>
              </div>
            </SignedOut>

            <SignedIn>
              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <img
                    src={user?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName}`}
                    alt="User avatar"
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                  <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">
                    {user?.firstName}
                  </span>
                  <ChevronDownIcon />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-brand-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg py-2 z-50 animate-slide-down">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  )
}
