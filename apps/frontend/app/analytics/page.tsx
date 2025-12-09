'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/context/AuthContext'
import { analyticsAPI } from '@/lib/api'
import { ArrowPathIcon, ChartBarIcon, HeartIcon, EyeIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline'

type Platform = 'facebook' | 'instagram' | 'twitter'

interface AnalyticsData {
  posts: number
  impressions: number
  engagements: number
  likes: number
  retweets?: number
  replies?: number
  comments?: number
  shares?: number
  growthRate: string
  topPost: {
    text?: string
    caption?: string
    impressions: number
    likes: number
    retweets?: number
    comments?: number
    shares?: number
  } | null
}

export default function Analytics() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('twitter')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    // Fetch analytics when platform changes
    const fetchAnalytics = async () => {
      const currentPlatform = platforms.find(p => p.id === selectedPlatform)
      if (!currentPlatform?.connected) {
        setAnalyticsData(null)
        return
      }

      setLoadingAnalytics(true)
      try {
        const response = await analyticsAPI.getPlatformAnalytics(selectedPlatform)
        if (response && response.success) {
          setAnalyticsData(response.analytics)
        } else {
          setAnalyticsData(null)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
        setAnalyticsData(null)
      } finally {
        setLoadingAnalytics(false)
      }
    }

    if (user) {
      fetchAnalytics()
    }
  }, [selectedPlatform, user])

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

  const platforms = [
    { 
      id: 'twitter' as Platform, 
      name: 'X (Twitter)', 
      icon: 'X', 
      color: 'bg-gray-900',
      connected: !!user?.twitterAccount
    },
    { 
      id: 'instagram' as Platform, 
      name: 'Instagram', 
      icon: 'ig', 
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      connected: !!user?.facebookAccount?.instagram_accounts?.length
    },
    { 
      id: 'facebook' as Platform, 
      name: 'Facebook', 
      icon: 'f', 
      color: 'bg-blue-600',
      connected: !!user?.facebookAccount
    },
  ]

  const currentPlatform = platforms.find(p => p.id === selectedPlatform)

  // Use real analytics data or show loading/empty state
  const analytics = analyticsData

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="px-8 py-5">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Analytics</h1>
              <p className="text-sm text-gray-500">Track your social media performance across platforms</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Platform Tabs */}
          <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 mb-8 flex space-x-2">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                disabled={!platform.connected}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  selectedPlatform === platform.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : platform.connected
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-400 cursor-not-allowed opacity-50'
                }`}
              >
                <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center ${selectedPlatform === platform.id ? 'bg-white/20' : ''}`}>
                  <span className={`text-xs font-bold ${selectedPlatform === platform.id ? 'text-white' : 'text-white'}`}>
                    {platform.icon}
                  </span>
                </div>
                <span>{platform.name}</span>
              </button>
            ))}
          </div>

          {/* Analytics Content */}
          {loadingAnalytics ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center space-x-3">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-purple-600" />
                <span className="text-lg text-gray-600">Loading analytics...</span>
              </div>
            </div>
          ) : currentPlatform?.connected && analytics ? (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                      <ChartBarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex items-center space-x-1 text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                      <span>↑</span>
                      <span>{analytics.growthRate}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Posts</p>
                  <p className="text-3xl font-semibold text-gray-900">{analytics.posts}</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <EyeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Impressions</p>
                  <p className="text-3xl font-semibold text-gray-900">{analytics.impressions.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center">
                      <HeartIcon className="w-6 h-6 text-pink-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Engagements</p>
                  <p className="text-3xl font-semibold text-gray-900">{analytics.engagements.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                      <ChatBubbleLeftIcon className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Likes</p>
                  <p className="text-3xl font-semibold text-gray-900">{analytics.likes.toLocaleString()}</p>
                </div>
              </div>

              {/* Engagement Breakdown */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Engagement Breakdown</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Likes</span>
                        <span className="text-sm font-semibold text-gray-900">{analytics.likes}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-pink-500 h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${analytics.engagements > 0 ? Math.min((analytics.likes / analytics.engagements) * 100, 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">
                          {selectedPlatform === 'twitter' ? 'Retweets' : 'Shares'}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {selectedPlatform === 'twitter' ? (analytics.retweets || 0) : (analytics.shares || 0)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${analytics.engagements > 0 ? Math.min(((selectedPlatform === 'twitter' ? (analytics.retweets || 0) : (analytics.shares || 0)) / analytics.engagements) * 100, 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">
                          {selectedPlatform === 'twitter' ? 'Replies' : 'Comments'}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {selectedPlatform === 'twitter' ? (analytics.replies || 0) : (analytics.comments || 0)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${analytics.engagements > 0 ? Math.min(((selectedPlatform === 'twitter' ? (analytics.replies || 0) : (analytics.comments || 0)) / analytics.engagements) * 100, 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Performing Post */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Post</h3>
                  {analytics.topPost ? (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-gray-700 mb-4">
                        {selectedPlatform === 'instagram' 
                          ? (analytics.topPost.caption || 'No caption') 
                          : (analytics.topPost.text || 'No text')}
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Impressions</p>
                          <p className="text-lg font-semibold text-gray-900">{analytics.topPost.impressions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Likes</p>
                          <p className="text-lg font-semibold text-gray-900">{analytics.topPost.likes}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            {selectedPlatform === 'twitter' ? 'Retweets' : selectedPlatform === 'instagram' ? 'Comments' : 'Shares'}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedPlatform === 'twitter' 
                              ? (analytics.topPost.retweets || 0) 
                              : selectedPlatform === 'instagram' 
                              ? (analytics.topPost.comments || 0) 
                              : (analytics.topPost.shares || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <p className="text-gray-500">No posts yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Over Time</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Chart visualization coming soon</p>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600 mb-6">
                Connect your {currentPlatform?.name} account to see analytics
              </p>
              <button 
                onClick={() => router.push('/connect')}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Connect Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
