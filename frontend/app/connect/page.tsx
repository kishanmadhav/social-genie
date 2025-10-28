'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/context/AuthContext'
import { socialAPI } from '@/lib/api'
import { 
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function Connect() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect if we're in the middle of an OAuth callback
    const params = new URLSearchParams(window.location.search)
    const isOAuthCallback = params.get('twitter_linked') || params.get('facebook_linked')
    
    if (!loading && !user && !isOAuthCallback) {
      router.push('/')
    }
  }, [user, loading, router])

  // Refresh user data after OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('twitter_linked') || params.get('facebook_linked')) {
      console.log('OAuth callback detected, refreshing user data...')
      refreshUser()
      // Clean up URL
      window.history.replaceState({}, '', '/connect')
    }
  }, [refreshUser])

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

  const socialPlatforms = [
    { 
      name: 'Facebook', 
      icon: 'f', 
      color: 'bg-blue-600', 
      connected: !!user?.facebookAccount,
      username: user?.facebookAccount?.facebook_name || '',
      description: 'Connect your Facebook account to post directly to your pages',
      onConnect: () => socialAPI.connectFacebook(),
      onDisconnect: async () => {
        await socialAPI.unlinkFacebook()
        await refreshUser()
      }
    },
    { 
      name: 'Instagram', 
      icon: 'ig', 
      color: 'bg-gradient-to-r from-purple-500 to-pink-500', 
      connected: !!user?.facebookAccount?.instagram_accounts?.length,
      username: user?.facebookAccount?.instagram_accounts?.[0]?.instagram_username || '',
      description: 'Connect via Facebook to post to your Instagram Business account',
      onConnect: () => socialAPI.connectFacebook(),
      onDisconnect: async () => {
        await socialAPI.unlinkFacebook()
        await refreshUser()
      }
    },
    { 
      name: 'X (Twitter)', 
      icon: 'X', 
      color: 'bg-gray-900', 
      connected: !!user?.twitterAccount,
      username: user?.twitterAccount?.username || '',
      description: 'Connect your X (Twitter) account to share posts with your followers',
      onConnect: () => socialAPI.connectTwitter(),
      onDisconnect: async () => {
        await socialAPI.unlinkTwitter()
        await refreshUser()
      }
    },
  ]

  const connectedCount = socialPlatforms.filter(p => p.connected).length

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="px-8 py-5">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Connect Accounts</h1>
              <p className="text-sm text-gray-500">Link your social media accounts to start posting</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          {/* Progress Banner */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-semibold mb-2">Connect Your Social Media</h2>
              <p className="text-purple-100 text-lg font-light mb-4">
                Connect at least one platform to start generating and posting AI content
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <span className="text-2xl font-bold">{connectedCount}/3</span>
                  <span className="text-purple-100 ml-2">Connected</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
          </div>

          {/* Connection Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {socialPlatforms.map((platform) => (
              <div 
                key={platform.name}
                className={`bg-white rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-xl ${
                  platform.connected
                    ? 'border-purple-200 bg-purple-50/30'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                {/* Platform Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 ${platform.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-lg font-bold">{platform.icon}</span>
                  </div>
                  {platform.connected && (
                    <CheckCircleIcon className="w-8 h-8 text-green-500" />
                  )}
                </div>

                {/* Platform Name */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{platform.name}</h3>
                
                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 min-h-[40px]">{platform.description}</p>

                {/* Connection Status */}
                {platform.connected ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Connected as:</span>
                        <br />
                        <span className="text-green-600">@{platform.username}</span>
                      </p>
                    </div>
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
                      className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors text-sm border border-red-200"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={platform.onConnect}
                    className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Connect {platform.name}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help Connecting?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Facebook & Instagram:</strong> Make sure you have a Facebook Page linked to an Instagram Business account</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>X (Twitter):</strong> You'll need to authorize SM Genie to post on your behalf</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Permissions:</strong> We only request the minimum permissions needed to post content</span>
              </li>
            </ul>
          </div>

          {/* Next Steps */}
          {connectedCount > 0 && (
            <div className="mt-8 text-center">
              <button 
                onClick={() => router.push('/schedule')}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Continue to Schedule Post
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
