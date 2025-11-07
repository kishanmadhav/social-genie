// API client for communicating with the Next.js API routes
// Now that backend is integrated into Next.js, we use relative paths

const API_URL = '' // Empty string for relative paths to Next.js API routes

export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  provider: string
  twitterAccount?: {
    id: string
    username: string
    profile_image_url: string
  }
  instagramAccount?: {
    id: string
    username: string
    access_token: string
  }
  facebookAccount?: {
    facebook_id: string
    facebook_name: string
    instagram_accounts: Array<{
      instagram_user_id: string
      instagram_username: string
      page_id: string
      page_name: string
      page_access_token: string
    }>
  }
}

export interface GeneratedContent {
  success: boolean
  preview: boolean
  image_url: string // S3 URL for permanent storage
  image_base64: string // Base64 for immediate preview
  caption: string
  revised_prompt: string
  s3_url: string // Store this for posting
}

// Helper function to handle fetch requests with credentials
async function fetchWithCredentials(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important for sending cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// Auth APIs
export const authAPI = {
  // Get current user info
  async getCurrentUser(): Promise<User | null> {
    try {
      return await fetchWithCredentials(`${API_URL}/api/user`)
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  },

  // Logout - Use NextAuth signOut
  async logout(): Promise<void> {
    // NextAuth will handle this
    window.location.href = '/api/auth/signout'
  },
}

// Social Media Connection APIs
export const socialAPI = {
  // Connect to Twitter - Use NextAuth signIn
  connectTwitter() {
    // For linking additional accounts, we'll need a custom flow
    // For now, redirect to NextAuth Twitter provider
    window.location.href = `/api/auth/signin/twitter`
  },

  // Connect to Facebook (for Instagram)
  connectFacebook() {
    window.location.href = `/api/auth/signin/facebook`
  },

  // Unlink Twitter account
  async unlinkTwitter(): Promise<void> {
    await fetchWithCredentials(`${API_URL}/api/unlink-twitter`, { method: 'POST' })
  },

  // Unlink Facebook account
  async unlinkFacebook(): Promise<void> {
    await fetchWithCredentials(`${API_URL}/api/unlink-facebook`, { method: 'POST' })
  },
}

// Content Generation APIs
export const generationAPI = {
  // Generate both image and caption using backend /api/generate-content
  async generateContent(params: {
    prompt: string
    platform?: string
    tone?: string
  }): Promise<GeneratedContent> {
    return await fetchWithCredentials(`${API_URL}/api/generate-content`, {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },
}

// Posting APIs
export const postingAPI = {
  // Post generated content to selected platform
  async postGenerated(params: {
    platform: 'twitter' | 'instagram' | 'facebook'
    caption: string
    image_base64?: string
    s3_url?: string
    postAsStory?: boolean
  }): Promise<{ success: boolean; postId?: string; permalink?: string; error?: string }> {
    return await fetchWithCredentials(`${API_URL}/api/post-generated`, {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },
}

// Brand Profile APIs
export const brandAPI = {
  // Save brand profile
  async saveBrandProfile(profile: {
    organizationName: string
    shortDescription: string
    targetDemographics: string
    targetPsychographics: string
    marketingGoals: string
    plan?: string
  }): Promise<void> {
    await fetchWithCredentials(`${API_URL}/api/brand-profile`, {
      method: 'POST',
      body: JSON.stringify(profile),
    })
  },

  // Get brand profile
  async getBrandProfile(): Promise<{
    organizationName: string
    shortDescription: string
    targetDemographics: string
    targetPsychographics: string
    marketingGoals: string
    plan?: string
  } | null> {
    try {
      return await fetchWithCredentials(`${API_URL}/api/brand-profile`)
    } catch (error) {
      console.error('Failed to get brand profile:', error)
      return null
    }
  },
}

// Analytics APIs
export const analyticsAPI = {
  // Get analytics for a specific platform
  async getPlatformAnalytics(platform: 'twitter' | 'instagram' | 'facebook'): Promise<any> {
    try {
      return await fetchWithCredentials(`${API_URL}/api/analytics/${platform}`)
    } catch (error) {
      console.error(`Failed to get ${platform} analytics:`, error)
      return null
    }
  },
}

// Scheduled Posts APIs
export const scheduledPostsAPI = {
  // Create a scheduled post
  async createScheduledPost(params: {
    platforms: string[]
    caption: string
    imageUrl: string
    s3Url: string
    scheduledTime: string
  }): Promise<{ success: boolean; post: any }> {
    return await fetchWithCredentials(`${API_URL}/api/scheduled-posts`, {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },

  // Get all scheduled posts
  async getScheduledPosts(startDate?: string, endDate?: string): Promise<{ posts: any[] }> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const url = `${API_URL}/api/scheduled-posts${params.toString() ? '?' + params.toString() : ''}`
    return await fetchWithCredentials(url)
  },

  // Get scheduled posts for a specific month
  async getMonthlyScheduledPosts(year: number, month: number): Promise<{ posts: any[] }> {
    return await fetchWithCredentials(`${API_URL}/api/scheduled-posts/month/${year}/${month}`)
  },

  // Delete a scheduled post
  async deleteScheduledPost(postId: string): Promise<{ success: boolean }> {
    return await fetchWithCredentials(`${API_URL}/api/scheduled-posts/${postId}`, {
      method: 'DELETE',
    })
  },
}

// Usage tracking APIs
export const usageAPI = {
  // Get current usage stats
  async getUsage(): Promise<{
    plan: string
    used: number
    limit: number
    remaining: number
  }> {
    return await fetchWithCredentials(`${API_URL}/api/usage`)
  },

  // Track a generation
  async trackGeneration(generationType: string = 'ai'): Promise<{ success: boolean }> {
    return await fetchWithCredentials(`${API_URL}/api/track-generation`, {
      method: 'POST',
      body: JSON.stringify({ generationType }),
    })
  },
}

// Posts APIs
export const postsAPI = {
  // Get all user posts across all platforms
  async getAllPosts(limit?: number): Promise<{
    success: boolean
    posts: Array<{
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
    }>
    count: number
  }> {
    const url = limit ? `${API_URL}/api/posts?limit=${limit}` : `${API_URL}/api/posts`
    return await fetchWithCredentials(url)
  },
}
