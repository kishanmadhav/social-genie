'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/context/AuthContext'
import { generationAPI, postingAPI, usageAPI, scheduledPostsAPI } from '@/lib/api'
import Toast from '@/components/Toast'
import { 
  ArrowPathIcon,
  SparklesIcon,
  PhotoIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

type PostMode = 'generate' | 'upload'

interface GeneratedContent {
  prompt: string
  caption: string
  image_url: string // S3 URL
  image_base64: string // Base64 for preview
  s3_url: string // For posting
  revised_prompt: string
}

export default function Schedule() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [postMode, setPostMode] = useState<PostMode>('generate')
  const [prompt, setPrompt] = useState('')
  const [caption, setCaption] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [tone, setTone] = useState('professional')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [postAsStory, setPostAsStory] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

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
    { id: 'twitter', name: 'X (Twitter)', icon: 'X', color: 'bg-gray-900', connected: !!user?.twitterAccount },
    { id: 'instagram', name: 'Instagram', icon: 'ig', color: 'bg-gradient-to-r from-purple-500 to-pink-500', connected: !!user?.facebookAccount?.instagram_accounts?.length },
    { id: 'facebook', name: 'Facebook', icon: 'f', color: 'bg-blue-600', connected: !!user?.facebookAccount }
  ]

  const tones = [
    { id: 'professional', label: 'Professional', emoji: '💼' },
    { id: 'casual', label: 'Casual', emoji: '😊' },
    { id: 'excited', label: 'Excited', emoji: '🎉' },
    { id: 'informative', label: 'Informative', emoji: '📚' }
  ]

  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformId))
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId])
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    
    try {
      // Check usage before generating
      const usage = await usageAPI.getUsage()
      if (usage.remaining <= 0) {
        setToast({ 
          message: `You've reached your monthly limit of ${usage.limit} AI generations. Upgrade your plan or wait until next month.`, 
          type: 'error' 
        })
        setIsGenerating(false)
        return
      }

      const result = await generationAPI.generateContent({
        prompt: prompt,
        platform: platforms.find(p => selectedPlatforms.includes(p.id))?.name,
        tone: tone
      })
      
      setGeneratedContent({
        prompt: prompt,
        caption: result.caption,
        image_url: result.image_url,
        image_base64: result.image_base64,
        s3_url: result.s3_url,
        revised_prompt: result.revised_prompt
      })
      setCaption(result.caption)
      
      setToast({ message: 'Content generated successfully!', type: 'success' })
    } catch (error: any) {
      console.error('Generation failed:', error)
      const errorMessage = error.message || 'Failed to generate content. Please try again.'
      setToast({ message: errorMessage, type: 'error' })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePostNow = async () => {
    if (selectedPlatforms.length === 0) {
      setToast({ message: 'Please select at least one platform', type: 'error' })
      return
    }

    if (!caption.trim()) {
      setToast({ message: 'Please add a caption', type: 'error' })
      return
    }

    if (postMode === 'generate' && !generatedContent?.s3_url && !generatedContent?.image_base64) {
      setToast({ message: 'Please generate content first', type: 'error' })
      return
    }

    if (postMode === 'upload' && !uploadedImage) {
      setToast({ message: 'Please upload an image', type: 'error' })
      return
    }

    setIsPosting(true)

    try {
      const results = []
      const errors = []

      for (const platformId of selectedPlatforms) {
        const platform = platforms.find(p => p.id === platformId)
        if (!platform?.connected) {
          errors.push(`${platform?.name} is not connected`)
          continue
        }

        try {
          const result = await postingAPI.postGenerated({
            platform: platformId as 'twitter' | 'instagram' | 'facebook',
            caption: caption,
            image_base64: postMode === 'generate' ? generatedContent?.image_base64 : uploadedImage || undefined,
            s3_url: postMode === 'generate' ? generatedContent?.s3_url : undefined,
            postAsStory: postAsStory && platformId === 'instagram' // Only for Instagram
          })
          
          if (result.success) {
            results.push(`✓ ${platform?.name}`)
          } else {
            errors.push(`✗ ${platform?.name}: ${result.error || 'Unknown error'}`)
          }
        } catch (error: any) {
          console.error(`Posting to ${platform?.name} failed:`, error)
          errors.push(`✗ ${platform?.name}: ${error.message || 'Failed to post'}`)
        }
      }

      if (results.length > 0) {
        setToast({ 
          message: `Posted successfully to: ${results.join(', ')}${errors.length > 0 ? `. Errors: ${errors.join(', ')}` : ''}`, 
          type: results.length === selectedPlatforms.length ? 'success' : 'error' 
        })
        
        // Reset form only if all succeeded
        if (errors.length === 0) {
          setPrompt('')
          setCaption('')
          setUploadedImage(null)
          setGeneratedContent(null)
          setSelectedPlatforms([])
        }
      } else {
        setToast({ message: `Failed to post: ${errors.join(', ')}`, type: 'error' })
      }
    } catch (error) {
      console.error('Posting failed:', error)
      setToast({ message: 'Failed to post content. Please try again.', type: 'error' })
    } finally {
      setIsPosting(false)
    }
  }

  const handleSchedulePost = async () => {
    if (!scheduleDate || !scheduleTime) {
      setToast({ message: 'Please select date and time', type: 'error' })
      return
    }

    if (selectedPlatforms.length === 0) {
      setToast({ message: 'Please select at least one platform', type: 'error' })
      return
    }

    if (!caption.trim()) {
      setToast({ message: 'Please add a caption', type: 'error' })
      return
    }

    // Combine date and time into ISO string
    const scheduledTime = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()

    try {
      await scheduledPostsAPI.createScheduledPost({
        platforms: selectedPlatforms,
        caption: caption.trim(),
        imageUrl: postMode === 'generate' ? generatedContent?.image_url || '' : uploadedImage || '',
        s3Url: postMode === 'generate' ? generatedContent?.s3_url || '' : uploadedImage || '',
        scheduledTime: scheduledTime
      })

      setToast({ message: 'Post scheduled successfully!', type: 'success' })
      
      // Reset form
      setCaption('')
      setPrompt('')
      setUploadedImage(null)
      setGeneratedContent(null)
      setSelectedPlatforms([])
      setScheduleDate('')
      setScheduleTime('')
    } catch (error) {
      console.error('Scheduling failed:', error)
      setToast({ message: 'Failed to schedule post. Please try again.', type: 'error' })
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="px-8 py-5">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Schedule Post</h1>
              <p className="text-sm text-gray-500">Generate AI content or upload your own, then post to Twitter, Instagram, or Facebook</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Mode Toggle */}
          <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 mb-8 flex space-x-2 max-w-md">
            <button
              onClick={() => setPostMode('generate')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                postMode === 'generate'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Generate with AI</span>
            </button>
            <button
              onClick={() => setPostMode('upload')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                postMode === 'upload'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <PhotoIcon className="w-5 h-5" />
              <span>Upload Own</span>
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Content Creation */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-8 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Create Content</h2>

                {postMode === 'generate' ? (
                  <div className="space-y-6">
                    {/* AI Generation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        What would you like to post about?
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Announce our new product launch with excitement..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Tone Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">Tone</label>
                      <div className="flex flex-wrap gap-2">
                        {tones.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setTone(t.id)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                              tone === t.id
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {t.emoji} {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button */}
                    <button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating}
                      className={`w-full py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                        !prompt.trim() || isGenerating
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <ArrowPathIcon className="w-5 h-5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-5 h-5" />
                          <span>Generate Content</span>
                        </>
                      )}
                    </button>

                    {/* Generated Preview */}
                    {generatedContent && (
                      <div className="mt-6 border-t pt-6">
                        {generatedContent.image_base64 && (
                          <div className="mb-4 rounded-xl overflow-hidden">
                            <img 
                              src={generatedContent.image_base64} 
                              alt="Generated" 
                              className="w-full h-auto"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Upload Image
                      </label>
                      <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50/30 transition-all duration-200 cursor-pointer block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        {uploadedImage ? (
                          <img src={uploadedImage} alt="Uploaded" className="max-h-64 mx-auto rounded-lg" />
                        ) : (
                          <>
                            <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-purple-600 font-medium">Choose File</p>
                            <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {/* Caption (for both modes) */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Caption
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write your caption here..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Platform Selection */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Select Platforms
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {platforms.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => platform.connected && togglePlatform(platform.id)}
                        disabled={!platform.connected}
                        className={`flex flex-col items-center space-y-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                          selectedPlatforms.includes(platform.id)
                            ? 'border-purple-500 bg-purple-50/50'
                            : platform.connected
                            ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center shadow-sm`}>
                          <span className="text-white text-xs font-bold">{platform.icon}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-700">{platform.name}</span>
                        {selectedPlatforms.includes(platform.id) && (
                          <CheckCircleIcon className="w-5 h-5 text-purple-600" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Post as Story checkbox - only show for Instagram */}
                  {selectedPlatforms.includes('instagram') && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={postAsStory}
                          onChange={(e) => setPostAsStory(e.target.checked)}
                          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Post as Instagram Story</span>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Stories disappear after 24 hours
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Posting Options */}
            <div className="space-y-6">
              {/* Post Now */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Now</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Publish immediately to selected platforms
                </p>
                <button
                  onClick={handlePostNow}
                  disabled={isPosting || selectedPlatforms.length === 0}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    isPosting || selectedPlatforms.length === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
                  }`}
                >
                  {isPosting ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      <span>Post Now</span>
                    </>
                  )}
                </button>
              </div>

              {/* Schedule for Later */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule for Later</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    onClick={handleSchedulePost}
                    disabled={!scheduleDate || !scheduleTime}
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      !scheduleDate || !scheduleTime
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md'
                    }`}
                  >
                    <CalendarIcon className="w-5 h-5" />
                    <span>Schedule Post</span>
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips</h4>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li>• Best times: 9-11 AM, 1-3 PM</li>
                  <li>• Use relevant hashtags</li>
                  <li>• Engage with comments</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
