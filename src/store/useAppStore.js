import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// ── Translation Layers (Data Isolation & Normalization) ──
const mapPostToFrontend = (dbPost) => ({
  id: dbPost.id,
  title: dbPost.title,
  platform: dbPost.platform,
  status: dbPost.status,
  scheduled_at: dbPost.scheduled_at,
  caption: dbPost.content || '',
  media: dbPost.media_url || null,
  campaignId: dbPost.campaign_id || '',
  user_id: dbPost.user_id
})

const mapPostToBackend = (fePost, userId) => {
  const backendPost = {
    title: fePost.title,
    platform: fePost.platform,
    status: fePost.status || 'draft',
    content: fePost.caption || '',
    media_url: fePost.media || null,
    campaign_id: fePost.campaignId || null,
    user_id: userId
  }
  
  if (fePost.scheduled_at) {
    backendPost.scheduled_at = fePost.scheduled_at
  }
  
  return backendPost
}

const mapCampaignToFrontend = (dbCampaign) => ({
  id: dbCampaign.id,
  title: dbCampaign.title,
  objective: dbCampaign.objective || '',
  color: dbCampaign.color || '#BE8755',
  postsCount: dbCampaign.posts_count || 0,
  startDate: dbCampaign.start_date || '',
  endDate: dbCampaign.end_date || '',
  status: dbCampaign.status || 'active',
  user_id: dbCampaign.user_id
})

const mapCampaignToBackend = (feCampaign, userId) => ({
  title: feCampaign.title,
  objective: feCampaign.objective || null,
  color: feCampaign.color || '#BE8755',
  posts_count: feCampaign.postsCount || 0,
  start_date: feCampaign.startDate || null,
  end_date: feCampaign.endDate || null,
  status: feCampaign.status || 'active',
  user_id: userId
})

export const useAppStore = create((set, get) => ({
  // User State
  session: null,
  user: {
    name: 'Creator',
    role: 'creator',
    avatar: '',
    email: '',
    location: '',
    website: 'creator',
    followers: '0',
    engagementScore: '0.0',
    streak: 0,
    socialAccounts: []
  },

  // Content State
  posts: [
    { 
      id: 1, 
      title: 'The Future of AI in Social Media', 
      platform: 'instagram', 
      status: 'scheduled', 
      scheduled_at: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
      caption: 'AI is not just a tool, it is your new creative partner. #AI #SocialMedia',
      media: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2532&auto=format&fit=crop'
    },
    { 
      id: 2, 
      title: '5 Tips for Better Engagement', 
      platform: 'linkedin', 
      status: 'draft', 
      scheduled_at: new Date(new Date().setHours(14, 30, 0, 0)).toISOString(),
      caption: 'Consistency is key, but value is king.',
      media: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop'
    }
  ],

  campaigns: [
    { id: 'c1', title: 'Summer Launch 2024', objective: 'Sales & Conversion', color: '#BE8755', postsCount: 12, startDate: '2024-06-01', endDate: '2024-08-31', status: 'active' },
    { id: 'c2', title: 'Product Updates', objective: 'Education', color: '#10B981', postsCount: 5, startDate: '2024-05-15', endDate: '2024-06-15', status: 'active' },
    { id: 'c3', title: 'Community Spotlight', objective: 'Brand Awareness', color: '#8B5CF6', postsCount: 8, startDate: '2024-01-01', endDate: '2024-03-31', status: 'completed' },
  ],

  notifications: [
    { id: 1, title: 'Post Published', message: 'Your Instagram post is now live!', time: '2m ago', unread: true, type: 'success' },
    { id: 2, title: 'New Engagement', message: 'Your latest reel got 500+ likes!', time: '1h ago', unread: true, type: 'info' },
  ],

  // Filters
  activePlatformFilter: 'all',
  activeCampaignFilter: 'all',

  // ── Supabase Fetch Operations ──
  fetchPostsFromSupabase: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_at', { ascending: true })

      if (error) throw error
      set({ posts: (data || []).map(mapPostToFrontend) })
    } catch (err) {
      console.warn('Error fetching posts from Supabase:', err.message)
    }
  },

  fetchCampaignsFromSupabase: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error
      set({ campaigns: (data || []).map(mapCampaignToFrontend) })
    } catch (err) {
      console.warn('Error fetching campaigns from Supabase:', err.message)
    }
  },

  // ── Content CRUD Actions with Supabase Syncing ──
  addPost: async (post) => {
    const { session, posts } = get()
    const userId = session?.user?.id
    
    if (userId) {
      try {
        const payload = mapPostToBackend(post, userId)
        const { data, error } = await supabase
          .from('posts')
          .insert([payload])
          .select()

        if (error) throw error
        if (data && data[0]) {
          const newPost = mapPostToFrontend(data[0])
          set({ posts: [...posts, newPost] })
          return newPost
        }
      } catch (err) {
        console.error('Error adding post to Supabase:', err.message)
      }
    }
    
    // Guest Fallback Mode
    const newPost = { ...post, id: Date.now() }
    set({ posts: [...posts, newPost] })
    return newPost
  },
  
  updatePost: async (id, data) => {
    const { session, posts } = get()
    const userId = session?.user?.id
    
    if (userId) {
      try {
        const payload = {}
        if (data.title !== undefined) payload.title = data.title
        if (data.platform !== undefined) payload.platform = data.platform
        if (data.status !== undefined) payload.status = data.status
        if (data.scheduled_at !== undefined) payload.scheduled_at = data.scheduled_at
        if (data.caption !== undefined) payload.content = data.caption
        if (data.media !== undefined) payload.media_url = data.media
        if (data.campaignId !== undefined) payload.campaign_id = data.campaignId || null
        
        const { error } = await supabase
          .from('posts')
          .update(payload)
          .eq('id', id)
          .eq('user_id', userId)

        if (error) throw error
      } catch (err) {
        console.error('Error updating post in Supabase:', err.message)
      }
    }
    
    // Update local state regardless
    set({
      posts: posts.map(p => p.id === id ? { ...p, ...data } : p)
    })
  },

  deletePost: async (id) => {
    const { session, posts } = get()
    const userId = session?.user?.id
    
    if (userId) {
      try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) throw error
      } catch (err) {
        console.error('Error deleting post in Supabase:', err.message)
      }
    }
    
    set({
      posts: posts.filter(p => p.id !== id)
    })
  },

  reschedulePost: async (id, newDate) => {
    const { session, posts } = get()
    const userId = session?.user?.id
    const newDateStr = newDate instanceof Date ? newDate.toISOString() : newDate
    
    if (userId) {
      try {
        const { error } = await supabase
          .from('posts')
          .update({ scheduled_at: newDateStr })
          .eq('id', id)
          .eq('user_id', userId)

        if (error) throw error
      } catch (err) {
        console.error('Error rescheduling post in Supabase:', err.message)
      }
    }
    
    set({
      posts: posts.map(p => p.id === id ? { ...p, scheduled_at: newDateStr } : p)
    })
  },

  // ── Campaigns CRUD Actions with Supabase Syncing ──
  addCampaign: async (campaign) => {
    const { session, campaigns } = get()
    const userId = session?.user?.id
    
    if (userId) {
      try {
        const payload = mapCampaignToBackend(campaign, userId)
        const { data, error } = await supabase
          .from('campaigns')
          .insert([payload])
          .select()

        if (error) throw error
        if (data && data[0]) {
          const newCampaign = mapCampaignToFrontend(data[0])
          set({ campaigns: [...campaigns, newCampaign] })
          return newCampaign
        }
      } catch (err) {
        console.error('Error adding campaign to Supabase:', err.message)
      }
    }
    
    // Guest Fallback Mode
    const newCampaign = { ...campaign, id: Date.now().toString(), postsCount: 0 }
    set({ campaigns: [...campaigns, newCampaign] })
    return newCampaign
  },
  
  updateCampaign: async (id, data) => {
    const { session, campaigns } = get()
    const userId = session?.user?.id
    
    if (userId) {
      try {
        const payload = {}
        if (data.title !== undefined) payload.title = data.title
        if (data.objective !== undefined) payload.objective = data.objective
        if (data.color !== undefined) payload.color = data.color
        if (data.postsCount !== undefined) payload.posts_count = data.postsCount
        if (data.startDate !== undefined) payload.start_date = data.startDate || null
        if (data.endDate !== undefined) payload.end_date = data.endDate || null
        if (data.status !== undefined) payload.status = data.status

        const { error } = await supabase
          .from('campaigns')
          .update(payload)
          .eq('id', id)
          .eq('user_id', userId)

        if (error) throw error
      } catch (err) {
        console.error('Error updating campaign in Supabase:', err.message)
      }
    }
    
    set({
      campaigns: campaigns.map(c => c.id === id ? { ...c, ...data } : c)
    })
  },

  deleteCampaign: async (id) => {
    const { session, campaigns } = get()
    const userId = session?.user?.id
    
    if (userId) {
      try {
        const { error } = await supabase
          .from('campaigns')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) throw error
      } catch (err) {
        console.error('Error deleting campaign in Supabase:', err.message)
      }
    }
    
    set({
      campaigns: campaigns.filter(c => c.id !== id)
    })
  },

  setActivePlatformFilter: (filter) => set({ activePlatformFilter: filter }),
  setActiveCampaignFilter: (filter) => set({ activeCampaignFilter: filter }),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, unread: false } : n)
  })),

  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, unread: false }))
  })),

  setSession: (session) => set({ session }),
  updateUser: (data) => set((state) => ({ 
    user: { ...state.user, ...data } 
  })),
  syncUserProfile: (userData) => set((state) => ({
    user: {
      ...state.user,
      name: userData.name || state.user.name,
      email: userData.email || state.user.email,
      avatar: userData.avatar || state.user.avatar,
      role: userData.role || state.user.role,
      location: userData.location || state.user.location,
      website: userData.website || state.user.website,
      bio: userData.bio || state.user.bio,
      themeColor: userData.themeColor || state.user.themeColor,
      aiPosting: userData.aiPosting !== undefined ? userData.aiPosting : state.user.aiPosting,
      weeklyReports: userData.weeklyReports !== undefined ? userData.weeklyReports : state.user.weeklyReports,
      emailNotifications: userData.emailNotifications !== undefined ? userData.emailNotifications : state.user.emailNotifications,
      pushNotifications: userData.pushNotifications !== undefined ? userData.pushNotifications : state.user.pushNotifications,
      smsNotifications: userData.smsNotifications !== undefined ? userData.smsNotifications : state.user.smsNotifications,
      newsletter: userData.newsletter !== undefined ? userData.newsletter : state.user.newsletter,
      announcements: userData.announcements !== undefined ? userData.announcements : state.user.announcements,
      theme: userData.theme || state.user.theme,
      reducedMotion: userData.reducedMotion !== undefined ? userData.reducedMotion : state.user.reducedMotion,
      highContrast: userData.highContrast !== undefined ? userData.highContrast : state.user.highContrast,
      twoFactor: userData.twoFactor !== undefined ? userData.twoFactor : state.user.twoFactor,
      language: userData.language || state.user.language,
      timezone: userData.timezone || state.user.timezone,
      workspaceName: userData.workspaceName || state.user.workspaceName,
      workspaceUrl: userData.workspaceUrl || state.user.workspaceUrl,
      socialAccounts: userData.socialAccounts || state.user.socialAccounts,
    }
  })),

  // ── Store Reset (Wipe Cached Data on Logout) ──
  resetStore: () => set({
    session: null,
    user: {
      name: '',
      role: '',
      avatar: '',
      email: '',
      followers: '0',
      engagementScore: '0',
      streak: 0,
      socialAccounts: []
    },
    posts: [],
    campaigns: [],
    notifications: [],
    activePlatformFilter: 'all',
    activeCampaignFilter: 'all'
  }),
}))
