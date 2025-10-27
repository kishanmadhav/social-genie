'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/Sidebar'
import { scheduledPostsAPI } from '@/lib/api'
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  TrashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

interface ScheduledPost {
  id: string
  platforms: string[]
  caption: string
  image_url: string
  s3_url: string
  scheduled_time: string
  status: string
  created_at: string
}

export default function CalendarPage() {
  const { user, loading } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    if (user) {
      fetchMonthlyPosts()
    }
  }, [user, currentDate])

  const fetchMonthlyPosts = async () => {
    try {
      setLoadingPosts(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const data = await scheduledPostsAPI.getMonthlyScheduledPosts(year, month)
      setScheduledPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch scheduled posts:', error)
    } finally {
      setLoadingPosts(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled post?')) return
    
    try {
      await scheduledPostsAPI.deleteScheduledPost(postId)
      setScheduledPosts(prev => prev.filter(p => p.id !== postId))
      setSelectedPost(null)
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post. Please try again.')
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    
    return days
  }

  const getPostsForDay = (day: number) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduled_time)
      return postDate.getDate() === day &&
             postDate.getMonth() === currentDate.getMonth() &&
             postDate.getFullYear() === currentDate.getFullYear()
    })
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear()
  }

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return 'bg-blue-500'
      case 'instagram':
        return 'bg-pink-500'
      case 'facebook':
        return 'bg-blue-600'
      default:
        return 'bg-gray-500'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return '𝕏'
      case 'instagram':
        return '📷'
      case 'facebook':
        return 'f'
      default:
        return '•'
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Calendar</h1>
            <p className="text-gray-600">View and manage your scheduled social media posts</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Previous month"
                    >
                      <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Next month"
                    >
                      <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-700 py-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {getDaysInMonth().map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="aspect-square" />
                    }
                    
                    const dayPosts = getPostsForDay(day)
                    const today = isToday(day)
                    
                    return (
                      <div
                        key={day}
                        className={`aspect-square border rounded-lg p-2 transition-all ${
                          today
                            ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-200'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${today ? 'text-purple-600' : 'text-gray-700'}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayPosts.slice(0, 3).map((post, idx) => (
                            <button
                              key={post.id}
                              onClick={() => setSelectedPost(post)}
                              className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate hover:scale-105 transition-transform ${
                                post.platforms.includes('twitter') ? 'bg-blue-100 text-blue-700' :
                                post.platforms.includes('instagram') ? 'bg-pink-100 text-pink-700' :
                                'bg-blue-100 text-blue-700'
                              }`}
                              title={post.caption}
                            >
                              {new Date(post.scheduled_time).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </button>
                          ))}
                          {dayPosts.length > 3 && (
                            <div className="text-xs text-gray-500 px-1.5">
                              +{dayPosts.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {loadingPosts && (
                  <div className="text-center py-8 text-gray-600">
                    Loading scheduled posts...
                  </div>
                )}
              </div>
            </div>

            {/* Post Details Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                {selectedPost ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Post Details</h3>
                      <button
                        onClick={() => handleDeletePost(selectedPost.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete post"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Preview Image */}
                    {selectedPost.image_url && (
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={selectedPost.image_url}
                          alt="Post preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Scheduled Time */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                      <ClockIcon className="w-4 h-4" />
                      <span>{new Date(selectedPost.scheduled_time).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}</span>
                    </div>

                    {/* Platforms */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Platforms</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPost.platforms.map(platform => (
                          <span
                            key={platform}
                            className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getPlatformColor(platform)}`}
                          >
                            {getPlatformIcon(platform)} {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Caption */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Caption</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                        {selectedPost.caption}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        selectedPost.status === 'posted' ? 'bg-green-100 text-green-800' :
                        selectedPost.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedPost.status.charAt(0).toUpperCase() + selectedPost.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Select a scheduled post to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">{scheduledPosts.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {scheduledPosts.filter(p => p.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Posted</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {scheduledPosts.filter(p => p.status === 'posted').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
