const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for server-side operations

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Database operations
class DatabaseService {
  
  // User management
  async createOrUpdateUser(googleProfile) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .upsert({
          google_id: googleProfile.id,
          email: googleProfile.emails[0].value,
          name: googleProfile.displayName,
          avatar_url: googleProfile.photos[0].value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'google_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }

  async getUserByGoogleId(googleId) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('google_id', googleId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Twitter account linking
  async linkTwitterAccount(userId, twitterProfile, tokens) {
    try {
      const { data, error } = await this.supabase
        .from('twitter_accounts')
        .upsert({
          user_id: userId,
          twitter_id: twitterProfile.id,
          username: twitterProfile.username,
          display_name: twitterProfile.displayName,
          access_token: tokens.token,
          access_token_secret: tokens.tokenSecret,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error linking Twitter account:', error);
      throw error;
    }
  }

  async getTwitterAccount(userId) {
    try {
      const { data, error } = await this.supabase
        .from('twitter_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching Twitter account:', error);
      throw error;
    }
  }

  // Instagram account linking
  async linkInstagramAccount(userId, instagramProfile, tokens) {
    try {
      const { data, error } = await this.supabase
        .from('instagram_accounts')
        .upsert({
          user_id: userId,
          instagram_id: instagramProfile.id,
          username: instagramProfile.username,
          account_type: instagramProfile.account_type || null,
          access_token: tokens.access_token || tokens.token || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error linking Instagram account:', error);
      throw error;
    }
  }

  async getInstagramAccount(userId) {
    try {
      const { data, error } = await this.supabase
        .from('instagram_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      // If table doesn't exist in Supabase schema cache, return null and let caller handle it
      if (error) {
        // PGRST116 = no rows returned, PGRST205 = table not found in schema cache
        if (error.code === 'PGRST116' || error.code === 'PGRST205') {
          console.warn('getInstagramAccount: table missing or no rows:', error);
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching Instagram account:', error);
      throw error;
    }
  }

  async unlinkInstagramAccount(userId) {
    try {
      const { error } = await this.supabase
        .from('instagram_accounts')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unlinking Instagram account:', error);
      throw error;
    }
  }

  // Facebook account linking (for Instagram Graph API)
  async linkFacebookAccount(userId, facebookData) {
    try {
      const { data, error } = await this.supabase
        .from('facebook_accounts')
        .upsert({
          user_id: userId,
          facebook_id: facebookData.facebook_id,
          facebook_name: facebookData.facebook_name,
          access_token: facebookData.access_token,
          instagram_accounts: facebookData.instagram_accounts || [],
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error linking Facebook account:', error);
      throw error;
    }
  }

  async getFacebookAccount(userId) {
    try {
      const { data, error } = await this.supabase
        .from('facebook_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116' && error.code !== 'PGRST205') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching Facebook account:', error);
      throw error;
    }
  }

  async unlinkFacebookAccount(userId) {
    try {
      const { error } = await this.supabase
        .from('facebook_accounts')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unlinking Facebook account:', error);
      throw error;
    }
  }

  // Instagram post management
  async saveInstagramPost(userId, postData) {
    try {
      const { data, error } = await this.supabase
        .from('instagram_posts')
        .insert({
          user_id: userId,
          instagram_post_id: postData.id,
          caption: postData.caption || null,
          media_type: postData.media_type || null,
          media_url: postData.media_url || null,
          permalink: postData.permalink || null,
          is_story: postData.is_story || false,
          posted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving Instagram post:', error);
      throw error;
    }
  }

  async getUserInstagramPosts(userId, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('instagram_posts')
        .select('*')
        .eq('user_id', userId)
        .order('posted_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user Instagram posts:', error);
      throw error;
    }
  }

  // Facebook post management
  async saveFacebookPost(userId, postData) {
    try {
      const { data, error } = await this.supabase
        .from('facebook_posts')
        .insert({
          user_id: userId,
          facebook_post_id: postData.id,
          message: postData.message || null,
          permalink: postData.permalink_url || null,
          is_story: postData.is_story || false,
          posted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving Facebook post:', error);
      throw error;
    }
  }

  async getUserFacebookPosts(userId, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('facebook_posts')
        .select('*')
        .eq('user_id', userId)
        .order('posted_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user Facebook posts:', error);
      throw error;
    }
  }

  async unlinkTwitterAccount(userId) {
    try {
      const { error } = await this.supabase
        .from('twitter_accounts')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unlinking Twitter account:', error);
      throw error;
    }
  }

  // Tweet management
  async saveTweet(userId, tweetData) {
    try {
      const { data, error } = await this.supabase
        .from('tweets')
        .insert({
          user_id: userId,
          twitter_tweet_id: tweetData.id,
          text: tweetData.text,
          created_at: tweetData.created_at,
          posted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving tweet:', error);
      throw error;
    }
  }

  async getUserTweets(userId, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('tweets')
        .select('*')
        .eq('user_id', userId)
        .order('posted_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user tweets:', error);
      throw error;
    }
  }

  // Analytics
  async getUserStats(userId) {
    try {
      const { data, error } = await this.supabase
        .from('tweets')
        .select('twitter_tweet_id, posted_at')
        .eq('user_id', userId);

      if (error) throw error;
      
      const totalTweets = data.length;
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthTweets = data.filter(tweet => 
        new Date(tweet.posted_at) >= thisMonth
      ).length;

      return {
        totalTweets,
        thisMonthTweets,
        lastTweetDate: data.length > 0 ? data[0].posted_at : null
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Brand Profile management
  async saveBrandProfile(userId, profileData) {
    try {
      const { data, error } = await this.supabase
        .from('brand_profiles')
        .upsert({
          user_id: userId,
          organization_name: profileData.organizationName,
          short_description: profileData.shortDescription,
          target_demographics: profileData.targetDemographics,
          target_psychographics: profileData.targetPsychographics,
          marketing_goals: profileData.marketingGoals,
          plan: profileData.plan || 'premium', // default to premium
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving brand profile:', error);
      throw error;
    }
  }

  async getBrandProfile(userId) {
    try {
      const { data, error } = await this.supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error fetching brand profile:', error);
      return null;
    }
  }

  // Scheduled Posts management
  async createScheduledPost(userId, postData) {
    try {
      const { data, error } = await this.supabase
        .from('scheduled_posts')
        .insert({
          user_id: userId,
          platforms: postData.platforms,
          caption: postData.caption,
          image_url: postData.imageUrl,
          s3_url: postData.s3Url,
          scheduled_time: postData.scheduledTime,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating scheduled post:', error);
      throw error;
    }
  }

  async getScheduledPosts(userId, startDate, endDate) {
    try {
      let query = supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_time', { ascending: true });

      if (startDate) {
        query = query.gte('scheduled_time', startDate);
      }
      if (endDate) {
        query = query.lte('scheduled_time', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      throw error;
    }
  }

  async updateScheduledPostStatus(postId, status) {
    try {
      const { data, error } = await this.supabase
        .from('scheduled_posts')
        .update({ status: status, posted_at: status === 'posted' ? new Date().toISOString() : null })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating scheduled post status:', error);
      throw error;
    }
  }

  async deleteScheduledPost(postId) {
    try {
      const { error } = await this.supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting scheduled post:', error);
      throw error;
    }
  }

  // Post Generations tracking
  async trackPostGeneration(userId, generationType = 'ai') {
    try {
      const { data, error } = await this.supabase
        .from('post_generations')
        .insert({
          user_id: userId,
          generation_type: generationType
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error tracking post generation:', error);
      throw error;
    }
  }

  async getMonthlyGenerationCount(userId) {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      const { data, error } = await this.supabase
        .from('post_generations')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .gte('created_at', firstDayOfMonth);

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error fetching monthly generation count:', error);
      throw error;
    }
  }

  async getUserPlan(userId) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('plan')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.plan || 'premium';
    } catch (error) {
      console.error('Error fetching user plan:', error);
      return 'premium';
    }
  }

  // Get all posts across all platforms
  async getAllUserPosts(userId, limit = 50) {
    try {
      const allPosts = [];

      // Fetch tweets
      const { data: tweets, error: tweetsError } = await supabase
        .from('tweets')
        .select('*')
        .eq('user_id', userId)
        .order('posted_at', { ascending: false })
        .limit(limit);

      if (tweetsError) {
        console.error('Error fetching tweets:', tweetsError);
      } else if (tweets) {
        tweets.forEach(tweet => {
          allPosts.push({
            id: tweet.id,
            platform: 'twitter',
            platform_post_id: tweet.twitter_tweet_id,
            content: tweet.text,
            caption: tweet.text,
            media_url: null,
            permalink: `https://twitter.com/i/web/status/${tweet.twitter_tweet_id}`,
            posted_at: tweet.posted_at,
            is_story: false,
            created_at: tweet.created_at
          });
        });
      }

      // Fetch Instagram posts
      const { data: instaPosts, error: instaError } = await supabase
        .from('instagram_posts')
        .select('*')
        .eq('user_id', userId)
        .order('posted_at', { ascending: false })
        .limit(limit);

      if (instaError) {
        console.error('Error fetching Instagram posts:', instaError);
      } else if (instaPosts) {
        instaPosts.forEach(post => {
          allPosts.push({
            id: post.id,
            platform: 'instagram',
            platform_post_id: post.instagram_post_id,
            content: post.caption,
            caption: post.caption,
            media_url: post.media_url,
            media_type: post.media_type,
            permalink: post.permalink,
            posted_at: post.posted_at,
            is_story: post.media_type === 'STORY',
            created_at: post.posted_at
          });
        });
      }

      // Fetch Facebook posts
      const { data: fbPosts, error: fbError } = await supabase
        .from('facebook_posts')
        .select('*')
        .eq('user_id', userId)
        .order('posted_at', { ascending: false })
        .limit(limit);

      if (fbError) {
        console.error('Error fetching Facebook posts:', fbError);
      } else if (fbPosts) {
        fbPosts.forEach(post => {
          allPosts.push({
            id: post.id,
            platform: 'facebook',
            platform_post_id: post.facebook_post_id,
            content: post.message,
            caption: post.message,
            media_url: null,
            permalink: post.permalink,
            posted_at: post.posted_at,
            is_story: post.is_story || false,
            created_at: post.posted_at
          });
        });
      }

      // Sort all posts by date (most recent first)
      allPosts.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));

      // Return limited number
      return allPosts.slice(0, limit);
    } catch (error) {
      console.error('Error fetching all user posts:', error);
      throw error;
    }
  }
}

// Debug: log before creating instance
console.log('\n[DATABASE] DatabaseService class defined, creating instance...');
const dbInstance = new DatabaseService();
console.log('[DATABASE] DatabaseService instance created');
console.log('[DATABASE] Instance has isInitialized method:', typeof dbInstance.isInitialized === 'function');
console.log('[DATABASE] Instance has testConnection method:', typeof dbInstance.testConnection === 'function');
module.exports = dbInstance;
