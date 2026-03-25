// HomePage – professional hero section with featured campaigns
import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../config/api'
import CampaignCard, { formatINR } from '../components/campaign/CampaignCard'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function HomePage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    { label: 'Active Campaigns', value: 0, suffix: '+', icon: '📊', formatted: '0' },
    { label: 'Total Raised', value: 0, prefix: '₹', format: true, icon: '💰', formatted: '0' },
    { label: 'Supporters', value: 0, suffix: '+', icon: '👥', formatted: '0' },
    { label: 'Success Rate', value: 0, suffix: '%', icon: '✅', formatted: '0' },
  ])

  useEffect(() => {
    // Fetch all campaigns to calculate stats
    const fetchData = async () => {
      try {
        // Fetch featured campaigns (for display)
        const featuredResponse = await api.get('/campaigns?limit=6')
        let featuredCampaigns = []
        if (featuredResponse.data && Array.isArray(featuredResponse.data)) {
          featuredCampaigns = featuredResponse.data
            .sort((a, b) => (b.currentAmount || 0) - (a.currentAmount || 0))
            .slice(0, 6)
          setCampaigns(featuredCampaigns)
        }

        // Fetch all campaigns for stats
        const allResponse = await api.get('/campaigns?limit=1000')
        let allCampaigns = []
        if (allResponse.data && Array.isArray(allResponse.data)) {
          allCampaigns = allResponse.data
        }

        // Calculate stats from all campaigns
        if (allCampaigns.length > 0) {
          const activeCampaigns = allCampaigns.filter(c => c.status === 'approved').length
          const totalRaised = allCampaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0)
          const totalSupporters = allCampaigns.reduce((sum, c) => sum + (c.supporterCount || Math.max(0, Math.floor((c.currentAmount || 0) / 1000))), 0) // Estimate if not available
          const successRate = allCampaigns.length > 0 
            ? Math.round((allCampaigns.filter(c => c.currentAmount >= c.goalAmount).length / allCampaigns.length) * 100)
            : 0

          setStats([
            { 
              label: 'Active Campaigns', 
              value: activeCampaigns, 
              suffix: '+', 
              icon: '📊', 
              formatted: activeCampaigns.toString() 
            },
            { 
              label: 'Total Raised', 
              value: totalRaised, 
              prefix: '₹', 
              format: true, 
              icon: '💰', 
              formatted: totalRaised >= 10000000 ? (totalRaised / 10000000).toFixed(1) + 'Cr' : totalRaised >= 100000 ? (totalRaised / 100000).toFixed(1) + 'L' : formatINR(totalRaised).replace('₹', '')
            },
            { 
              label: 'Supporters', 
              value: totalSupporters, 
              suffix: '+', 
              icon: '👥', 
              formatted: totalSupporters >= 1000 ? (totalSupporters / 1000).toFixed(1) + 'K' : totalSupporters.toString()
            },
            { 
              label: 'Success Rate', 
              value: successRate, 
              suffix: '%', 
              icon: '✅', 
              formatted: successRate.toString()
            },
          ])
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err)
        setCampaigns([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-success-50 to-brand-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800" />
        
        {/* Decorative elements - optimized */}
        <motion.div
          className="absolute top-20 left-1/2 -translate-x-1/2 h-64 w-64 bg-brand-400/5 rounded-full blur-2xl opacity-60"
          animate={{
            y: [-20, 20, -20],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 h-64 w-64 bg-success-400/5 rounded-full blur-2xl opacity-60"
          animate={{
            y: [20, -20, 20],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Badge */}
            <motion.div
              className="mb-8 inline-flex"
              variants={itemVariants}
            >
              <span className="badge-primary text-sm">
                🚀 Empowering creators and change-makers
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight"
              variants={itemVariants}
            >
              Turn Your <span className="bg-gradient-to-r from-brand-500 to-success-500 bg-clip-text text-transparent">Ideas Into Reality</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-10 leading-relaxed"
              variants={itemVariants}
            >
              Connect with a community of supporters and bring your vision to life. Whether it's a project, cause, or dream—find the funding you need to make it happen.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/campaigns/create"
                  className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2 transition-transform duration-300"
                >
                  <span>🚀</span> Create Campaign
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/campaigns"
                  className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center gap-2 transition-transform duration-300"
                >
                  <span>Explore Campaigns</span>
                  <span>→</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-16 md:py-20 bg-brand-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="text-center"
                variants={itemVariants}
              >
                <motion.div
                  className="text-4xl mb-3"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  {stat.icon}
                </motion.div>
                <p className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-2">
                  {stat.prefix}{stat.formatted}{stat.suffix}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURED CAMPAIGNS ===== */}
      <section className="py-16 md:py-24 bg-brand-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title mb-4">Featured Campaigns</h2>
            <p className="section-subtitle">
              Support the campaigns making a real difference in communities across India
            </p>
          </motion.div>

          {/* Campaigns grid */}
          {loading ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <div className="card h-96 bg-slate-200 dark:bg-slate-700 animate-pulse" />
                </motion.div>
              ))}
            </motion.div>
          ) : campaigns.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {campaigns.map((campaign) => (
                <motion.div key={campaign._id} variants={itemVariants}>
                  <CampaignCard campaign={campaign} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-slate-600 dark:text-slate-400 text-lg">No campaigns available yet.</p>
            </motion.div>
          )}

          {/* View all button */}
          {campaigns.length > 0 && (
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/campaigns" className="btn-primary text-lg px-8 py-4 inline-block transition-transform duration-300">
                  View All Campaigns →
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <motion.section
        className="py-16 md:py-24 bg-gradient-to-r from-brand-500 to-blue-500"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Ready to Make an Impact?
          </motion.h2>
          <motion.p
            className="text-xl text-white/90 mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Start your campaign today and connect with supporters who believe in your vision.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/campaigns/create"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-600 font-bold px-8 py-4 rounded-lg hover:bg-neutral-100 transition-all shadow-lg text-lg"
            >
              <span>🚀</span> Create Your Campaign Now
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
