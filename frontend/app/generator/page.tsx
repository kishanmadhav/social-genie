'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/context/AuthContext'
import { generationAPI, postingAPI } from '@/lib/api'
import Toast from '@/components/Toast'
import { 
  SparklesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

interface GeneratedContent {
  prompt: string
  caption: string
  image_url?: string
  s3_url?: string
}

export default function Generator() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<'twitter' | 'instagram' | 'facebook'>('twitter')
  const [tone, setTone] = useState('professional')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

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
    { id: 'twitter' as const, name: 'X (Twitter)', color: 'bg-gray-900', icon: 'X', connected: !!user?.twitterAccount },
    { id: 'instagram' as const, name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: 'ig', connected: !!user?.facebookAccount?.instagram_accounts?.length },
    { id: 'facebook' as const, name: 'Facebook', color: 'bg-blue-600', icon: 'f', connected: !!user?.facebookAccount }
  ]

  const tones = [
    { id: 'professional', label: 'Professional', emoji: '💼' },
    { id: 'casual', label: 'Casual', emoji: '😊' },
    { id: 'excited', label: 'Excited', emoji: '🎉' },
    { id: 'informative', label: 'Informative', emoji: '📚' }
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    
    try {
      // Generate both image and caption using backend AI
      const result = await generationAPI.generateContent({
        prompt: prompt,
        platform: platforms.find(p => p.id === selectedPlatform)?.name,
        tone: tone
      })
      
      setGeneratedContent({
        prompt: prompt,
        caption: result.caption,
        image_url: result.image_url,
        s3_url: result.s3_url
      })
      
      setToast({ message: 'Content generated successfully!', type: 'success' })
    } catch (error) {
      console.error('Generation failed:', error)
      setToast({ message: 'Failed to generate content. Please try again.', type: 'error' })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePostContent = async () => {
    if (!generatedContent) return
    
    const selectedPlatformData = platforms.find(p => p.id === selectedPlatform)
    if (!selectedPlatformData?.connected) {
      setToast({ message: `Please connect your ${selectedPlatformData?.name} account first`, type: 'error' })
      return
    }
    
    setIsPosting(true)
    
    try {
      await postingAPI.postGenerated({
        platform: selectedPlatform,
        caption: generatedContent.caption,
        imageUrl: generatedContent.image_url,
        s3Url: generatedContent.s3_url
      })
      
      setToast({ message: `Posted successfully to ${selectedPlatformData.name}!`, type: 'success' })
      setGeneratedContent(null)
      setPrompt('')
    } catch (error) {
      console.error('Posting failed:', error)
      setToast({ message: 'Failed to post content. Please try again.', type: 'error' })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="px-8 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">AI Generator</h1>
                <p className="text-sm text-gray-500">Create engaging content with AI-powered generation</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Generator */}
            <div className="lg:col-span-2 space-y-6">
              {/* Prompt Input */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Generate Content</h2>
                </div>

                <div className="space-y-6">
                  {/* Prompt Textarea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      What would you like to post about?
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., Announce our new product launch with excitement and highlight key features..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400 transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-2 flex items-start">
                      <span className="mr-1">💡</span>
                      Be specific about your message, audience, and any key points to include
                    </p>
                  </div>

                  {/* Platform Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Select Platform
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {platforms.map((platform) => (
                        <button
                          key={platform.id}
                          onClick={() => setSelectedPlatform(platform.id)}
                          disabled={!platform.connected}
                          className={`flex flex-col items-center space-y-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                            selectedPlatform === platform.id
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
                          {!platform.connected && (
                            <span className="text-xs text-red-500">Not connected</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Tone
                    </label>
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
                </div>
              </div>

              {/* Generated Result */}
              {generatedContent && (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      <h3 className="text-lg font-semibold text-gray-900">Generated Content</h3>
                    </div>
                    <button 
                      onClick={() => setGeneratedContent(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Image Preview */}
                  {generatedContent.image_url && (
                    <div className="mb-6 rounded-xl overflow-hidden">
                      <img 
                        src={generatedContent.image_url} 
                        alt="Generated content" 
                        className="w-full h-auto"
                      />
                    </div>
                  )}

                  {/* Preview */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">SG</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Your Brand</p>
                        <p className="text-xs text-gray-500">Just now</p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{generatedContent.caption}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700 disabled:opacity-50"
                      >
                        <ArrowPathIcon className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        <span>Regenerate</span>
                      </button>
                    </div>
                    <button 
                      onClick={handlePostContent}
                      disabled={isPosting}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isPosting ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <span>Post Now</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Tips */}
            <div className="space-y-6">
              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Tips for Better Results</h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Be specific about your target audience</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Mention key features or benefits to highlight</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Include any hashtags or keywords to use</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Specify the desired content length</span>
                  </li>
                </ul>
              </div>

              {/* AI Features */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Powered By</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold text-xs">AI</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">DALL-E 3</p>
                      <p className="text-xs text-gray-600">Advanced image generation</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-xs">GPT</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">GPT-4o-mini</p>
                      <p className="text-xs text-gray-600">Natural caption generation</p>
                    </div>
                  </div>
                </div>
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
