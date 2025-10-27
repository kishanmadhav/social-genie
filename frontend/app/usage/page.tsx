'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/Sidebar'
import { usageAPI } from '@/lib/api'
import { 
  ChartPieIcon,
  SparklesIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface UsageData {
  plan: string
  used: number
  limit: number
  remaining: number
}

export default function UsagePage() {
  const { user, loading } = useAuth()
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [loadingUsage, setLoadingUsage] = useState(true)

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoadingUsage(true)
        const data = await usageAPI.getUsage()
        setUsageData(data)
      } catch (error) {
        console.error('Failed to fetch usage data:', error)
      } finally {
        setLoadingUsage(false)
      }
    }

    if (user) {
      fetchUsage()
    }
  }, [user])

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'standard':
        return 'from-gray-500 to-gray-600'
      case 'pro':
        return 'from-blue-500 to-blue-600'
      case 'premium':
        return 'from-purple-500 to-purple-600'
      default:
        return 'from-purple-500 to-purple-600'
    }
  }

  const getPlanName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1)
  }

  const getUsagePercentage = () => {
    if (!usageData || usageData.limit === 0) return 0
    return (usageData.used / usageData.limit) * 100
  }

  const getUsageColor = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const getUsageStatus = () => {
    if (!usageData) return ''
    if (usageData.remaining === 0) return 'Limit Reached'
    if (usageData.remaining <= 5) return 'Almost at limit'
    return 'Good to go!'
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
        <div className="max-w-5xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Usage & Plan</h1>
            <p className="text-gray-600">Monitor your AI generation usage and plan details</p>
          </div>

          {loadingUsage ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg text-gray-600">Loading usage data...</div>
            </div>
          ) : usageData ? (
            <div className="space-y-6">
              {/* Current Plan Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getPlanColor(usageData.plan)} rounded-xl flex items-center justify-center shadow-md`}>
                      <ChartPieIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{getPlanName(usageData.plan)} Plan</h2>
                      <p className="text-sm text-gray-600">Your current subscription</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                    Upgrade Plan
                  </button>
                </div>

                {/* Plan Features */}
                <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Unlimited Scheduling</p>
                      <p className="text-sm text-gray-600">Schedule posts across all platforms</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    {usageData.limit > 0 ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">AI Content Generation</p>
                      <p className="text-sm text-gray-600">
                        {usageData.limit > 0 ? `${usageData.limit} generations per month` : 'Not included in plan'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Generations This Month</h3>
                    <p className="text-sm text-gray-600">{getUsageStatus()}</p>
                  </div>
                </div>

                {/* Usage Progress */}
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-4xl font-bold text-gray-900">{usageData.used}</span>
                      <span className="text-2xl text-gray-400 ml-2">/ {usageData.limit}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{usageData.remaining}</div>
                      <div className="text-sm text-gray-600">remaining</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${getUsageColor()}`}
                      style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{getUsagePercentage().toFixed(0)}% used</span>
                    <span>{usageData.remaining === 0 ? 'Limit reached' : `${usageData.remaining} left`}</span>
                  </div>
                </div>

                {/* Warning Messages */}
                {usageData.remaining === 0 && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900">Generation Limit Reached</p>
                        <p className="text-sm text-red-700 mt-1">
                          You've used all your AI generations for this month. Upgrade your plan or wait until next month to continue generating content.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {usageData.remaining > 0 && usageData.remaining <= 5 && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <SparklesIcon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-orange-900">Running Low on Generations</p>
                        <p className="text-sm text-orange-700 mt-1">
                          You only have {usageData.remaining} generation{usageData.remaining !== 1 ? 's' : ''} left this month. Consider upgrading your plan for more AI content.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Billing Period */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Billing Period</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Period</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Resets On</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plan Comparison */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Plans</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Standard</h4>
                    <p className="text-2xl font-bold text-gray-900 mb-2">Free</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Unlimited scheduling</li>
                      <li>✗ No AI generations</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-purple-300 relative">
                    <div className="absolute -top-3 right-4 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      PRO
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Pro</h4>
                    <p className="text-2xl font-bold text-gray-900 mb-2">$19<span className="text-sm font-normal">/mo</span></p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Unlimited scheduling</li>
                      <li>✓ 30 AI generations</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Premium</h4>
                    <p className="text-2xl font-bold text-gray-900 mb-2">$39<span className="text-sm font-normal">/mo</span></p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Unlimited scheduling</li>
                      <li>✓ 60 AI generations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              Failed to load usage data. Please try again later.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
