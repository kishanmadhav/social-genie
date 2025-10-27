'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/context/AuthContext'
import { socialAPI, brandAPI, analyticsAPI, postsAPI } from '@/lib/api'
import { 
  CalendarIcon, 
  EyeIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface AnalyticsData {
  platform: string
  followers?: number
  posts?: number
  engagement?: {
    likes: number
    comments: number
    shares?: number
  }
  impressions?: number
}

export default function Dashboard() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [organizationName, setOrganizationName] = useState<string>('')
  const [analyticsData, setAnalyticsData] = useState<{
    totalPosts: number
    totalImpressions: number
    totalLikes: number
    totalComments: number
  }>({
    totalPosts: 0,
    totalImpressions: 0,
    totalLikes: 0,
    totalComments: 0
  })
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Refresh user data after OAuth callback (if redirected here)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('twitter_linked') || params.get('facebook_linked')) {
      console.log('OAuth callback detected, refreshing user data...')
      refreshUser()
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [refreshUser])

  // Fetch brand profile for organization name
  useEffect(() => {
    const fetchBrandProfile = async () => {
      try {
        const profile = await brandAPI.getBrandProfile()
        if (profile?.organizationName) {
          setOrganizationName(profile.organizationName)
        }
      } catch (error) {
        console.error('Failed to fetch brand profile:', error)
      }
    }

    if (user) {
      fetchBrandProfile()
    }
  }, [user])

  // Fetch real analytics data from database
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      setLoadingAnalytics(true)
      try {
        let totalPosts = 0
        let totalImpressions = 0
        let totalLikes = 0
        let totalComments = 0

        console.log('=== Fetching Dashboard Analytics ===')

        // First, get post counts directly from database using postsAPI
        try {
          const postsData = await postsAPI.getAllPosts(1000)
          console.log('Posts from database:', postsData)
          if (postsData.success && postsData.posts) {
            totalPosts = postsData.count || 0
            console.log('Total posts from DB:', totalPosts)
          }
        } catch (err) {
          console.error('Failed to fetch posts:', err)
        }

        // Fetch analytics for connected platforms using the API wrapper
        const platforms: Array<'twitter' | 'instagram' | 'facebook'> = []
        
        if (user.twitterAccount) platforms.push('twitter')
        if (user.facebookAccount?.instagram_accounts?.length) platforms.push('instagram')
        if (user.facebookAccount) platforms.push('facebook')

        console.log('Fetching analytics for platforms:', platforms)

        // Fetch analytics from each platform
        for (const platform of platforms) {
          try {
            console.log(`Fetching analytics for ${platform}...`)
            const analyticsData = await analyticsAPI.getPlatformAnalytics(platform)
            console.log(`${platform} analytics response:`, analyticsData)
            
            if (analyticsData) {
              // Use the higher of analytics posts or already counted posts
              if (analyticsData.posts > 0) {
                totalPosts = Math.max(totalPosts, analyticsData.posts)
              }
              totalImpressions += analyticsData.impressions || 0
              totalLikes += analyticsData.likes || 0
              totalComments += (analyticsData.comments || analyticsData.replies || 0)
            }
          } catch (err) {
            console.error(`Failed to fetch ${platform} analytics:`, err)
          }
        }

        console.log('Final totals:', { totalPosts, totalImpressions, totalLikes, totalComments })

        setAnalyticsData({
          totalPosts,
          totalImpressions,
          totalLikes,
          totalComments
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoadingAnalytics(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <ArrowPathIcon className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-lg text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }
  
  const stats = [
    { 
      name: 'Posts Created', 
      value: loadingAnalytics ? '...' : formatNumber(analyticsData.totalPosts), 
      change: '', 
      trend: 'up', 
      icon: CalendarIcon, 
      color: 'bg-purple-50', 
      iconColor: 'text-purple-600' 
    },
    { 
      name: 'Total Impressions', 
      value: loadingAnalytics ? '...' : formatNumber(analyticsData.totalImpressions), 
      change: '', 
      trend: 'up', 
      icon: EyeIcon, 
      color: 'bg-blue-50', 
      iconColor: 'text-blue-600' 
    },
    { 
      name: 'Total Likes', 
      value: loadingAnalytics ? '...' : formatNumber(analyticsData.totalLikes), 
      change: '', 
      trend: 'up', 
      icon: HeartIcon, 
      color: 'bg-pink-50', 
      iconColor: 'text-pink-600' 
    },
    { 
      name: 'Total Comments', 
      value: loadingAnalytics ? '...' : formatNumber(analyticsData.totalComments), 
      change: '', 
      trend: 'up', 
      icon: ChatBubbleLeftIcon, 
      color: 'bg-orange-50', 
      iconColor: 'text-orange-600' 
    },
  ]

  // Social platforms with real connection status from backend
  const socialPlatforms = [
    { 
      name: 'Facebook', 
      icon: 'f', 
      color: 'bg-blue-600', 
      connected: !!user?.facebookAccount,
      username: user?.facebookAccount?.facebook_name || '',
      onConnect: () => socialAPI.connectFacebook(),
      onDisconnect: async () => {
        try {
          await socialAPI.unlinkFacebook()
          await refreshUser()
        } catch (error) {
          console.error('Failed to unlink Facebook:', error)
          throw error
        }
      }
    },
    { 
      name: 'Instagram', 
      icon: 'ig', 
      color: 'bg-gradient-to-r from-purple-500 to-pink-500', 
      connected: !!user?.facebookAccount?.instagram_accounts?.length,
      username: user?.facebookAccount?.instagram_accounts?.[0]?.instagram_username || '',
      onConnect: () => socialAPI.connectFacebook(), // Instagram connects via Facebook
      onDisconnect: async () => {
        try {
          await socialAPI.unlinkFacebook()
          await refreshUser()
        } catch (error) {
          console.error('Failed to unlink Facebook/Instagram:', error)
          throw error
        }
      }
    },
    { 
      name: 'X (Twitter)', 
      icon: 'X', 
      color: 'bg-gray-900', 
      connected: !!user?.twitterAccount,
      username: user?.twitterAccount?.username || '',
      onConnect: () => socialAPI.connectTwitter(),
      onDisconnect: async () => {
        try {
          await socialAPI.unlinkTwitter()
          await refreshUser()
        } catch (error) {
          console.error('Failed to unlink Twitter:', error)
          throw error
        }
      }
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="px-8 py-5 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">SG</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">SM Genie</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link 
                href="/generator"
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2.5 rounded-xl font-medium text-white transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Generate Content</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-semibold mb-2">
                Welcome back, {organizationName || user.displayName}!
              </h2>
              <p className="text-gray-300 text-lg font-light">Here's what's happening with your brand today.</p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400 rounded-full opacity-5 blur-3xl"></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div 
                key={stat.name} 
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  {stat.change && (
                    <div className="flex items-center space-x-1 text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                      <span>↑</span>
                      <span>{stat.change}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* AI Content Generator */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-2xl"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <SparklesIcon className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Generator</h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Create engaging social media content instantly with DALL-E 3 and GPT-4 powered generation.
                </p>
                <Link 
                  href="/generator"
                  className="inline-flex w-full bg-purple-600 text-white py-3.5 px-4 rounded-xl hover:bg-purple-700 items-center justify-center space-x-2 font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <SparklesIcon className="w-5 h-5" />
                  <span>Generate Content</span>
                </Link>
                
                <div className="mt-6 pt-6 border-t border-purple-200/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">AI-Powered</span>
                    <span className="font-semibold text-gray-900">DALL-E 3 + GPT-4</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Start Guide */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Start Guide</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Connect Your Accounts</h4>
                    <p className="text-sm text-gray-600">Link your Twitter, Instagram, and Facebook accounts below</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Generate AI Content</h4>
                    <p className="text-sm text-gray-600">Use our AI generator to create images and captions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Post & Schedule</h4>
                    <p className="text-sm text-gray-600">Post immediately or schedule for later</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Connections */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Social Connections</h3>
                <p className="text-sm text-gray-500">Manage your connected social media accounts</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
                {socialPlatforms.filter(p => p.connected).length}/{socialPlatforms.length} connected
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {socialPlatforms.map((platform) => (
                <div 
                  key={platform.name}
                  className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-200 ${
                    platform.connected
                      ? 'border-purple-200 bg-purple-50/50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-sm font-bold">{platform.icon}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 block">{platform.name}</span>
                      <span className="text-xs text-gray-500">
                        {platform.connected ? `@${platform.username}` : 'Not connected'}
                      </span>
                    </div>
                  </div>
                  {platform.connected ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-6 h-6 text-purple-600" />
                      <button 
                        onClick={async (e) => {
                          e.preventDefault()
                          if (confirm(`Are you sure you want to disconnect ${platform.name}?`)) {
                            try {
                              await platform.onDisconnect()
                            } catch (error) {
                              console.error(`Failed to disconnect ${platform.name}:`, error)
                              alert(`Failed to disconnect ${platform.name}. Please try again.`)
                            }
                          }
                        }}
                        className="text-xs text-gray-500 hover:text-red-600 transition-colors font-medium"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={platform.onConnect}
                      className="bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 font-medium transition-colors text-sm"
                    >
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
