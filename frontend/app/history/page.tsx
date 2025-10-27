'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/context/AuthContext'
import { postsAPI } from '@/lib/api'
import { 
  ArrowPathIcon,
  ClockIcon,
  PhotoIcon,
  FilmIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

interface Post {
  id: number
  platform: 'twitter' | 'instagram' | 'facebook'
  platform_post_id: string
  content: string
  caption: string
  media_url: string | null
  media_type?: string
  permalink: string | null
  posted_at: string
  is_story: boolean
  created_at: string
}

export default function PostHistory() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all') // all, posts, stories

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [user])

  useEffect(() => {
    filterPosts()
  }, [posts, selectedPlatform, selectedType])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const response = await postsAPI.getAllPosts(100)
      if (response.success) {
        setPosts(response.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = [...posts]

    // Filter by platform
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(post => post.platform === selectedPlatform)
    }

    // Filter by type (post vs story)
    if (selectedType === 'posts') {
      filtered = filtered.filter(post => !post.is_story)
    } else if (selectedType === 'stories') {
      filtered = filtered.filter(post => post.is_story)
    }

    setFilteredPosts(filtered)
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'bg-gray-900'
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'facebook': return 'bg-blue-600'
      default: return 'bg-gray-500'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'X'
      case 'instagram': return 'ig'
      case 'facebook': return 'f'
      default: return '?'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="px-8 py-5">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Post History</h1>
              <p className="text-sm text-gray-500">View all your published posts and stories across platforms</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-wrap gap-4">
              {/* Platform Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPlatform('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedPlatform === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('twitter')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedPlatform === 'twitter'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    X
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('instagram')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedPlatform === 'instagram'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Instagram
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('facebook')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedPlatform === 'facebook'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Facebook
                  </button>
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedType === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedType('posts')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedType === 'posts'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Posts
                  </button>
                  <button
                    onClick={() => setSelectedType('stories')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedType === 'stories'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Stories
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-gray-600">Total Posts:</span>
                  <span className="ml-2 font-semibold text-gray-900">{filteredPosts.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Regular Posts:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {filteredPosts.filter(p => !p.is_story).length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Stories:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {filteredPosts.filter(p => p.is_story).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center space-x-3">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-purple-600" />
                <span className="text-lg text-gray-600">Loading posts...</span>
              </div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <PhotoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600">
                {selectedPlatform !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start creating content to see it here'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  {/* Post Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${getPlatformColor(post.platform)} rounded-lg flex items-center justify-center shadow-sm`}>
                          <span className="text-white text-xs font-bold">
                            {getPlatformIcon(post.platform)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 capitalize">{post.platform}</div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <ClockIcon className="w-3 h-3" />
                            <span>{formatDate(post.posted_at)}</span>
                          </div>
                        </div>
                      </div>
                      {post.is_story && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          <FilmIcon className="w-3 h-3" />
                          <span>Story</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Post Media */}
                  {post.media_url && (
                    <div className="relative aspect-square bg-gray-100">
                      <img
                        src={post.media_url}
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-4">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {post.caption || post.content || 'No caption'}
                    </p>
                    
                    {post.permalink && post.platform !== 'instagram' && (
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>View on {post.platform}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
