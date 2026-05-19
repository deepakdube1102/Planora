import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  // ── User Profile State ──
  const [user, setUser] = useState({
    name: 'Anaya Khan',
    role: 'Lifestyle & Productivity Creator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop',
    followers: '128K',
    engagementScore: '8.7/10',
    streak: 14,
    socialAccounts: [
      { id: 'insta', platform: 'Instagram', handle: '@anayakhan', connected: true },
      { id: 'twitter', platform: 'Twitter', handle: '@anayakhan', connected: true },
      { id: 'linkedin', platform: 'LinkedIn', handle: 'Anaya Khan', connected: true },
    ]
  })

  // ── Posts State ──
  const [posts, setPosts] = useState([
    { 
      id: 1, 
      title: 'Morning Routine for Productivity', 
      caption: 'Start your day right! ✨',
      platform: 'instagram', 
      type: 'Reel', 
      status: 'scheduled', 
      scheduled_at: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), 
      color: '#E1306C',
      campaign: 'Lifestyle 2024',
      media: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
    },
    { 
      id: 2, 
      title: 'Productivity Hacks', 
      caption: '3 tips to stay focused.',
      platform: 'linkedin', 
      type: 'Post', 
      status: 'scheduled', 
      scheduled_at: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), 
      color: '#0077B5',
      campaign: 'B2B Growth'
    },
    { 
      id: 3, 
      title: 'Weekly Vlog: Deep Work', 
      caption: 'New video out now!',
      platform: 'youtube', 
      type: 'Video', 
      status: 'published', 
      scheduled_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), 
      color: '#FF0000',
      campaign: 'Creator Series'
    },
  ])

  // ── Campaigns State ──
  const [campaigns, setCampaigns] = useState([
    { id: 'c1', title: 'Product Launch', postsCount: 12, color: '#F43F5E', active: true },
    { id: 'c2', title: 'Brand Awareness', postsCount: 8, color: '#8B5CF6', active: true },
    { id: 'c3', title: 'Community Engagement', postsCount: 6, color: '#10B981', active: true },
  ])

  // ── Filters State ──
  const [activePlatformFilter, setActivePlatformFilter] = useState('all')
  const [activeCampaignFilter, setActiveCampaignFilter] = useState('all')

  // ── Notifications State ──
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'schedule', title: 'Ready to Publish', desc: 'Your post "Future of SaaS" is scheduled for tomorrow at 10 AM.', time: '2m ago', unread: true, color: '#3B82F6' },
    { id: 2, type: 'ai', title: 'AI Insight', desc: 'Based on recent trends, we suggest adding #minimalism to your next reel.', time: '1h ago', unread: true, color: '#BE8755' },
    { id: 3, type: 'analytics', title: 'Milestone Reached!', desc: 'Your LinkedIn post just crossed 10k impressions.', time: '5h ago', unread: false, color: '#10B981' },
  ])

  // ── Workflow Tasks ──
  const [tasks, setTasks] = useState([
    { id: 1, label: 'Review AI Captions', completed: false, category: 'AI Assistant' },
    { id: 2, label: 'Approve Saturday Reel', completed: false, category: 'Approvals' },
    { id: 3, label: 'Sync with Collaborator', completed: true, category: 'Collaborations' },
  ])

  // ── Actions ──
  const addPost = (post) => setPosts([...posts, { ...post, id: Date.now() }])
  const updatePost = (id, updates) => setPosts(posts.map(p => p.id === id ? { ...p, ...updates } : p))
  const deletePost = (id) => setPosts(posts.filter(p => p.id !== id))
  const reschedulePost = (id, newDate) => {
    setPosts(posts.map(p => p.id === id ? { ...p, scheduled_at: newDate.toISOString() } : p))
  }

  const addCampaign = (campaign) => setCampaigns([...campaigns, { ...campaign, id: Date.now() }])

  const markAllNotificationsRead = () => setNotifications(notifications.map(n => ({ ...n, unread: false })))
  const markNotificationRead = (id) => setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n))

  const toggleTask = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))

  const updateProfile = (updates) => setUser({ ...user, ...updates })

  return (
    <AppContext.Provider value={{
      user, updateProfile,
      posts, addPost, updatePost, deletePost, reschedulePost,
      campaigns, addCampaign,
      activePlatformFilter, setActivePlatformFilter,
      activeCampaignFilter, setActiveCampaignFilter,
      notifications, markAllNotificationsRead, markNotificationRead,
      tasks, toggleTask
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
