'use client'

import Link from "next/link"
import { ChartBarIcon, CalendarIcon, CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline"

const features = [
  {
    name: "AI Content Generation",
    description: "Generate relevant images and engaging captions with DALL-E 3 and GPT-4.",
    icon: SparklesIcon,
  },
  {
    name: "Smart Scheduling",
    description: "Plan your content with an intuitive calendar and never miss a beat.",
    icon: CalendarIcon,
  },
  {
    name: "Multi-Platform",
    description: "Post to Twitter, Instagram, and Facebook from a single dashboard.",
    icon: CheckCircleIcon,
  },
  {
    name: "Performance Analytics",
    description: "Get daily and weekly insights on your content performance and engagement.",
    icon: ChartBarIcon,
  },
]

const platformInfo = [
  { value: "3", label: "Platforms Supported" },
  { value: "DALL-E 3", label: "AI Image Engine" },
  { value: "GPT-4", label: "Caption Generator" },
  { value: "AWS S3", label: "Secure Storage" },
]

export default function LandingPage() {
  const handleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    window.location.href = `${apiUrl}/auth/google`
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2 group cursor-pointer">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center group-hover:from-purple-700 group-hover:to-purple-800 transition-all duration-300">
                <span className="text-white font-bold text-sm">SG</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Social Genie</span>
              <span className="text-xs text-gray-500 ml-2">a product by Agentic Genie</span>
            </div>
            <div className="flex items-center space-x-6">
              <button 
                onClick={handleLogin}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
              >
                Log In
              </button>
              <button
                onClick={handleLogin}
                className="bg-purple-600 text-white px-5 py-2.5 rounded-full hover:bg-purple-700 transition-all duration-200 font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 bg-white">
        <div className="max-w-5xl mx-auto text-center px-4 relative z-10">
          <h1 className="text-6xl md:text-7xl font-semibold text-gray-900 mb-6 leading-tight tracking-tight animate-fade-in-up">
            Amplify Your Brand.{" "}
            <span className="text-purple-600">
              With AI.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up animation-delay-200">
            AI-powered social media management that saves time and amplifies your presence across Twitter, Instagram, and Facebook.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20 animate-fade-in-up animation-delay-400">
            <button
              onClick={handleLogin}
              className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Start Free Trial
            </button>
            <a 
              href="#features" 
              className="text-gray-900 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-50 transition-all duration-200 border border-gray-200"
            >
              Learn more
            </a>
          </div>

          {/* Platform capabilities */}
          <div className="pt-12 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto">
              {platformInfo.map((info, index) => (
                <div 
                  key={index} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  <div className="text-4xl font-semibold text-gray-900 mb-1">{info.value}</div>
                  <div className="text-sm text-gray-500 font-light">{info.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gray-50 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
              Everything you need.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              From AI content creation to multi-platform posting.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ name, description, icon: Icon }, index) => (
              <div
                key={name}
                className="group bg-white p-10 rounded-3xl hover:shadow-lg transition-all duration-500 border border-gray-100 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-8 group-hover:bg-purple-600 transition-all duration-300">
                    <Icon className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight">
                    {name}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed font-light">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-5xl font-semibold text-gray-900 mb-6 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 mb-12 font-light">
            Join thousands of brands amplifying their presence with AI.
          </p>
          <button
            onClick={handleLogin}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Get Started Free
          </button>
          <p className="text-gray-500 text-sm mt-6 font-light">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-50 text-center border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">SG</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Social Genie</span>
            <span className="text-xs text-gray-400 ml-2">a product by Agentic Genie</span>
          </div>
          <p className="text-sm text-gray-500 font-light">© {new Date().getFullYear()} Social Genie. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
