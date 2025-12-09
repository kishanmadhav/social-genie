'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { brandAPI, getApiUrl } from '@/lib/api'
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading, refreshUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [exchangingToken, setExchangingToken] = useState(false)
  const [formData, setFormData] = useState({
    organizationName: '',
    shortDescription: '',
    targetDemographics: '',
    targetPsychographics: '',
    marketingGoals: '',
    plan: 'premium' // default to premium
  })

  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())

  // Exchange token from URL for session
  useEffect(() => {
    const token = searchParams.get('token')
    if (token && !exchangingToken && !user) {
      setExchangingToken(true)
      
      console.log('[Frontend] Exchanging token for session...')
      const apiUrl = getApiUrl()
      
      // Exchange token for session
      fetch(`${apiUrl}/api/auth/exchange-token`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
        .then(res => {
          console.log('[Frontend] Exchange response status:', res.status)
          return res.json()
        })
        .then(data => {
          if (data.success) {
            console.log('[Frontend] Token exchanged successfully')
            // Remove token from URL
            window.history.replaceState({}, '', '/onboarding')
            // Refresh user data
            refreshUser()
          } else {
            console.error('[Frontend] Token exchange failed:', data.error)
            router.push('/?error=auth_failed')
          }
        })
        .catch(err => {
          console.error('[Frontend] Token exchange error:', err)
          router.push('/?error=auth_failed')
        })
        .finally(() => setExchangingToken(false))
    }
  }, [searchParams, exchangingToken, user, refreshUser, router])

  useEffect(() => {
    if (!loading && !user && !exchangingToken && !searchParams.get('token')) {
      router.push('/')
    }
  }, [user, loading, router, exchangingToken, searchParams])

  // Load existing brand profile if available
  useEffect(() => {
    const loadProfile = async () => {
      const profile = await brandAPI.getBrandProfile()
      if (profile) {
        setFormData({
          ...profile,
          plan: profile.plan || 'premium' // ensure plan is set
        })
        // Mark all filled fields as completed
        const completed = new Set<string>()
        Object.entries(profile).forEach(([key, value]) => {
          if (value && String(value).length >= 3) {
            completed.add(key)
          }
        })
        setCompletedFields(completed)
      }
    }
    
    if (user) {
      loadProfile()
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Mark field as completed if it has meaningful content
    const minLengths: Record<string, number> = {
      organizationName: 3,
      shortDescription: 20,
      targetDemographics: 15,
      targetPsychographics: 15,
      marketingGoals: 15
    }
    
    const isCompleted = value.length >= (minLengths[field] || 10)
    if (isCompleted) {
      setCompletedFields(prev => new Set([...prev, field]))
    } else {
      setCompletedFields(prev => {
        const updated = new Set(prev)
        updated.delete(field)
        return updated
      })
    }
  }

  const calculateProgress = () => {
    return (completedFields.size / 5) * 100
  }

  const getCharCount = (field: keyof typeof formData, max: number) => {
    const current = formData[field].length
    const remaining = max - current
    const isNearLimit = remaining <= 20
    return { current, remaining, isNearLimit }
  }

  const handleSaveAndContinue = async () => {
    if (completedFields.size < 3) {
      return
    }

    setSaving(true)
    try {
      await brandAPI.saveBrandProfile(formData)
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to save brand profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg mb-3">
              <span className="text-white font-bold text-xl">SG</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Social Genie</span>
            <span className="text-xs text-gray-500 ml-2">a product by Agentic Genie</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
            Welcome Aboard! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Let's set up your brand profile to start generating amazing content.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm font-semibold text-purple-600">
              {completedFields.size}/5 fields
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        <div className="space-y-8">
          {/* Organization Details */}
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-50 rounded-lg">
                <BuildingOfficeIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Organization Details</h2>
            </div>
            <p className="text-gray-600 mb-6">Tell us about your organization.</p>

            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                  {completedFields.has('organizationName') && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500 inline ml-2 animate-scale-in" />
                  )}
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  onFocus={() => setFocusedField('organizationName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g., Acme Corporation"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all duration-200 ${
                    focusedField === 'organizationName' ? 'shadow-md' : 'border-gray-200'
                  }`}
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description
                  {completedFields.has('shortDescription') && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500 inline ml-2 animate-scale-in" />
                  )}
                </label>
                <textarea
                  rows={4}
                  maxLength={200}
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  onFocus={() => setFocusedField('shortDescription')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Describe your company's mission, products, or services..."
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all duration-200 resize-none ${
                    focusedField === 'shortDescription' ? 'shadow-md' : 'border-gray-200'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">Brief overview of your brand</p>
                  <span className={`text-xs ${getCharCount('shortDescription', 200).isNearLimit ? 'text-orange-500' : 'text-gray-500'}`}>
                    {getCharCount('shortDescription', 200).remaining} characters left
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Audience & Goals */}
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-50 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Audience & Goals</h2>
            </div>
            <p className="text-gray-600 mb-6">Define who you're talking to and what you want to achieve.</p>

            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience Demographics
                  {completedFields.has('targetDemographics') && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500 inline ml-2 animate-scale-in" />
                  )}
                </label>
                <textarea
                  rows={3}
                  maxLength={150}
                  value={formData.targetDemographics}
                  onChange={(e) => handleInputChange('targetDemographics', e.target.value)}
                  onFocus={() => setFocusedField('targetDemographics')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g., Millennials aged 25-40, urban professionals, middle to high income, tech-savvy"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all duration-200 resize-none ${
                    focusedField === 'targetDemographics' ? 'shadow-md' : 'border-gray-200'
                  }`}
                />
                <span className={`text-xs ${getCharCount('targetDemographics', 150).isNearLimit ? 'text-orange-500' : 'text-gray-500'} float-right mt-1`}>
                  {getCharCount('targetDemographics', 150).remaining} left
                </span>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience Psychographics
                  {completedFields.has('targetPsychographics') && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500 inline ml-2 animate-scale-in" />
                  )}
                </label>
                <textarea
                  rows={3}
                  maxLength={150}
                  value={formData.targetPsychographics}
                  onChange={(e) => handleInputChange('targetPsychographics', e.target.value)}
                  onFocus={() => setFocusedField('targetPsychographics')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g., Value sustainability, seek work-life balance, early adopters of new technology"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all duration-200 resize-none ${
                    focusedField === 'targetPsychographics' ? 'shadow-md' : 'border-gray-200'
                  }`}
                />
                <span className={`text-xs ${getCharCount('targetPsychographics', 150).isNearLimit ? 'text-orange-500' : 'text-gray-500'} float-right mt-1`}>
                  {getCharCount('targetPsychographics', 150).remaining} left
                </span>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marketing Goals & Motto
                  {completedFields.has('marketingGoals') && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500 inline ml-2 animate-scale-in" />
                  )}
                </label>
                <textarea
                  rows={3}
                  maxLength={150}
                  value={formData.marketingGoals}
                  onChange={(e) => handleInputChange('marketingGoals', e.target.value)}
                  onFocus={() => setFocusedField('marketingGoals')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g., Increase brand awareness by 30%, drive website traffic. 'Innovation for Everyone'"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all duration-200 resize-none ${
                    focusedField === 'marketingGoals' ? 'shadow-md' : 'border-gray-200'
                  }`}
                />
                <span className={`text-xs ${getCharCount('marketingGoals', 150).isNearLimit ? 'text-orange-500' : 'text-gray-500'} float-right mt-1`}>
                  {getCharCount('marketingGoals', 150).remaining} left
                </span>
              </div>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Choose Your Plan</h2>
            </div>
            <p className="text-gray-600 mb-6">Select the plan that best fits your content needs.</p>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Standard Plan */}
              <button
                onClick={() => handleInputChange('plan', 'standard')}
                className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                  formData.plan === 'standard'
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                }`}
              >
                {formData.plan === 'standard' && (
                  <div className="absolute top-4 right-4">
                    <CheckCircleIcon className="w-6 h-6 text-purple-600" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Standard</h3>
                <div className="text-3xl font-bold text-gray-900 mb-2">Free</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Unlimited scheduling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-gray-300">✗</span>
                    <span className="text-gray-400">No AI generations</span>
                  </li>
                </ul>
              </button>

              {/* Pro Plan */}
              <button
                onClick={() => handleInputChange('plan', 'pro')}
                className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                  formData.plan === 'pro'
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                }`}
              >
                {formData.plan === 'pro' && (
                  <div className="absolute top-4 right-4">
                    <CheckCircleIcon className="w-6 h-6 text-purple-600" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro</h3>
                <div className="text-3xl font-bold text-gray-900 mb-2">$19<span className="text-base font-normal text-gray-600">/mo</span></div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Unlimited scheduling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span><strong>30 AI generations</strong>/month</span>
                  </li>
                </ul>
              </button>

              {/* Premium Plan */}
              <button
                onClick={() => handleInputChange('plan', 'premium')}
                className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                  formData.plan === 'premium'
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                }`}
              >
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  POPULAR
                </div>
                {formData.plan === 'premium' && (
                  <div className="absolute top-4 right-4">
                    <CheckCircleIcon className="w-6 h-6 text-purple-600" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium</h3>
                <div className="text-3xl font-bold text-gray-900 mb-2">$39<span className="text-base font-normal text-gray-600">/mo</span></div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Unlimited scheduling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span><strong>60 AI generations</strong>/month</span>
                  </li>
                </ul>
              </button>
            </div>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleSaveAndContinue}
              disabled={completedFields.size < 3 || saving}
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg text-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                completedFields.size >= 3 && !saving
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : 'Continue Setup'}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
            <p className="text-sm text-gray-500 mt-4">
              {completedFields.size >= 3 ? 'Ready to continue!' : 'Fill at least 3 fields to continue'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Onboarding() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  )
}
