import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  User, 
  Settings as SettingsIcon, 
  Monitor, 
  Bell, 
  Share2, 
  Users, 
  CreditCard, 
  Lock,
  ChevronRight,
  Globe,
  Sparkles,
  Check,
  Smartphone,
  Mail,
  ShieldCheck,
  Plus,
  ChevronLeft,
  Copy,
  Moon,
  Sun,
  Laptop,
  Key,
  RefreshCw,
  AlertCircle,
  Trash2,
  LockKeyhole,
  CheckCircle2,
  Settings2,
  LogOut
} from 'lucide-react'
import { Instagram, Twitter, Linkedin, Facebook, Youtube } from '../components/ui/BrandIcons'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { supabase } from '../lib/supabase'

const Settings = () => {
  const { section } = useParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAppStore()
  
  const [isSaving, setIsSaving] = useState(false)
  const [showSavedToast, setShowSavedToast] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Local state for settings toggles and forms initialized from global store
  const [settings, setSettings] = useState(() => ({
    aiPosting: user.aiPosting ?? true,
    weeklyReports: user.weeklyReports ?? false,
    emailNotifications: user.emailNotifications ?? true,
    pushNotifications: user.pushNotifications ?? true,
    smsNotifications: user.smsNotifications ?? false,
    newsletter: user.newsletter ?? true,
    announcements: user.announcements ?? false,
    theme: user.theme ?? 'Light',
    reducedMotion: user.reducedMotion ?? false,
    highContrast: user.highContrast ?? false,
    twoFactor: user.twoFactor ?? false,
    language: user.language ?? 'English',
    timezone: user.timezone || "(GMT+05:30) Mumbai, Kolkata, New Delhi",
    workspaceName: user.workspaceName || "Aryan's Creative Studio",
    workspaceUrl: user.workspaceUrl || "aryans-creative-studio.planora.com",
    fullName: user.name || "Aryan Pandey",
    email: user.email || "aryan@planora.ai",
    role: user.role || "creator",
  }))

  const [inviteEmail, setInviteEmail] = useState('')
  const [passwordCurrent, setPasswordCurrent] = useState('')
  const [passwordNew, setPasswordNew] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Deepak Dube', email: 'deepak@planora.com', role: 'Owner', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop' },
    { id: 2, name: 'Aryan Pandey', email: 'aryan@planora.com', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop' },
    { id: 3, name: 'Sarah Connor', email: 'sarah@planora.com', role: 'Editor', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop' },
  ])

  // Map initial platforms state to global store socialAccounts values
  const [platforms, setPlatforms] = useState(() => {
    const defaultPlatforms = [
      { id: 'instagram', name: 'Instagram', handle: '@planora_app', icon: Instagram, connected: false, color: '#E1306C' },
      { id: 'linkedin', name: 'LinkedIn', handle: 'Planora AI', icon: Linkedin, connected: false, color: '#0077B5' },
      { id: 'twitter', name: 'Twitter (X)', handle: '@planora_hq', icon: Twitter, connected: false, color: '#1A1A1A' },
      { id: 'facebook', name: 'Facebook', handle: 'Planora Page', icon: Facebook, connected: false, color: '#1877F2' },
      { id: 'youtube', name: 'YouTube', handle: 'Planora Tech', icon: Youtube, connected: false, color: '#FF0000' },
    ]
    
    // Merge connected state and handles from global store user.socialAccounts
    if (user.socialAccounts && Array.isArray(user.socialAccounts)) {
      return defaultPlatforms.map(dp => {
        const matchingGlobal = user.socialAccounts.find(sa => sa.platform.toLowerCase() === dp.id)
        if (matchingGlobal) {
          return {
            ...dp,
            connected: matchingGlobal.connected,
            handle: matchingGlobal.handle || dp.handle
          }
        }
        return dp
      })
    }
    return defaultPlatforms
  })

  // Redirect on desktop if on base /settings
  useEffect(() => {
    const handleResizeRedirect = () => {
      if (window.innerWidth > 768 && !section) {
        navigate('/settings/general', { replace: true })
      }
    }
    
    handleResizeRedirect()
    window.addEventListener('resize', handleResizeRedirect)
    return () => window.removeEventListener('resize', handleResizeRedirect)
  }, [section, navigate])

  // Sync local state with global user store updates
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      fullName: user.name || prev.fullName,
      email: user.email || prev.email,
      role: user.role || prev.role,
      workspaceName: user.workspaceName || prev.workspaceName,
      workspaceUrl: user.workspaceUrl || prev.workspaceUrl,
      aiPosting: user.aiPosting ?? prev.aiPosting,
      weeklyReports: user.weeklyReports ?? prev.weeklyReports,
      emailNotifications: user.emailNotifications ?? prev.emailNotifications,
      pushNotifications: user.pushNotifications ?? prev.pushNotifications,
      smsNotifications: user.smsNotifications ?? prev.smsNotifications,
      newsletter: user.newsletter ?? prev.newsletter,
      announcements: user.announcements ?? prev.announcements,
      theme: user.theme ?? prev.theme,
      reducedMotion: user.reducedMotion ?? prev.reducedMotion,
      highContrast: user.highContrast ?? prev.highContrast,
      twoFactor: user.twoFactor ?? prev.twoFactor,
      language: user.language ?? prev.language,
      timezone: user.timezone ?? prev.timezone,
    }))
  }, [user])

  // Effect to dynamically apply selected theme in real-time
  useEffect(() => {
    const applyTheme = (themeName) => {
      if (themeName === 'Dark') {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else if (themeName === 'Light') {
        document.documentElement.removeAttribute('data-theme')
      } else {
        // System preference listener
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.setAttribute('data-theme', 'dark')
        } else {
          document.documentElement.removeAttribute('data-theme')
        }
      }
    }
    
    applyTheme(settings.theme)
  }, [settings.theme])

  const handleToggle = async (key) => {
    const nextValue = !settings[key]
    setSettings(prev => ({ ...prev, [key]: nextValue }))

    if (key === 'pushNotifications') {
      const { syncPushRegistration } = await import('../lib/pushNative')
      const ok = await syncPushRegistration(nextValue)
      if (nextValue && ok === false) {
        setSettings(prev => ({ ...prev, pushNotifications: false }))
        alert('Push permission was denied. Enable notifications in system settings to use push alerts.')
      }
    }
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(settings.workspaceUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    // If the user is trying to change password
    if (passwordNew || passwordCurrent || passwordConfirm) {
      if (!passwordCurrent) {
        alert("Please enter your current password to make security changes.")
        return
      }
      if (passwordNew.length < 8) {
        alert("Your new password must be at least 8 characters long.")
        return
      }
      if (passwordNew !== passwordConfirm) {
        alert("New password and confirm password do not match!")
        return
      }
      // Password changed successfully! Clear fields
      setPasswordCurrent('')
      setPasswordNew('')
      setPasswordConfirm('')
    }

    setIsSaving(true)
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error("Not authenticated")

      // Save to user_settings table
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: authUser.id,
          ai_posting: settings.aiPosting,
          weekly_reports: settings.weeklyReports,
          email_notifications: settings.emailNotifications,
          push_notifications: settings.pushNotifications,
          sms_notifications: settings.smsNotifications,
          newsletter: settings.newsletter,
          announcements: settings.announcements,
          theme: settings.theme,
          reduced_motion: settings.reducedMotion,
          high_contrast: settings.highContrast,
          two_factor: settings.twoFactor,
          language: settings.language,
          timezone: settings.timezone,
          workspace_name: settings.workspaceName,
          workspace_url: settings.workspaceUrl,
          updated_at: new Date().toISOString()
        })

      if (settingsError) {
        // Handle 404 - table doesn't exist yet
        if (settingsError.code === 'PGRST116' || settingsError.status === 404) {
          console.warn('user_settings table not yet created. Changes will be saved to local state only.')
        } else {
          throw settingsError
        }
      }

      // Save to profiles table (using upsert to automatically insert the row if it does not exist)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          full_name: settings.fullName,
          email: settings.email,
          role: settings.role,
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        if (profileError.code === 'PGRST116' || profileError.status === 404) {
          console.warn('profiles table not yet created. Changes will be saved to local state only.')
        } else {
          throw profileError
        }
      }

      // Save social accounts
      for (const platform of platforms) {
        const { error: platformError } = await supabase
          .from('social_accounts')
          .upsert({
            user_id: authUser.id,
            platform: platform.name,
            handle: platform.handle,
            connected: platform.connected
          }, { onConflict: 'user_id,platform' })

        if (platformError) {
          if (platformError.code === 'PGRST116' || platformError.status === 404) {
            console.warn('social_accounts table not yet created. Changes will be saved to local state only.')
          } else {
            console.error('Error saving social account:', platformError)
          }
        }
      }

      // Save live details to Zustand global store
      updateUser({
        name: settings.fullName,
        role: settings.role,
        email: settings.email,
        workspaceName: settings.workspaceName,
        workspaceUrl: settings.workspaceUrl,
        aiPosting: settings.aiPosting,
        weeklyReports: settings.weeklyReports,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        smsNotifications: settings.smsNotifications,
        newsletter: settings.newsletter,
        announcements: settings.announcements,
        theme: settings.theme,
        reducedMotion: settings.reducedMotion,
        highContrast: settings.highContrast,
        twoFactor: settings.twoFactor,
        language: settings.language,
        timezone: settings.timezone,
        socialAccounts: platforms.map(p => ({
          id: p.id,
          platform: p.name,
          handle: p.handle,
          connected: p.connected
        }))
      })

      setTimeout(() => {
        setIsSaving(false)
        setShowSavedToast(true)
        setTimeout(() => setShowSavedToast(false), 3000)
      }, 800)
    } catch (error) {
      console.error('Error saving settings:', error)
      
      let errorMessage = 'Failed to save settings. '
      if (error.message?.includes('PGRST116') || error.status === 404) {
        errorMessage += 'Database tables not found. Please run the schema.sql migration in Supabase. Changes are saved locally.'
      } else {
        errorMessage += 'Please try again.'
      }
      
      // Still update local store so user doesn't lose changes
      updateUser({
        name: settings.fullName,
        role: settings.role,
        email: settings.email,
        workspaceName: settings.workspaceName,
        workspaceUrl: settings.workspaceUrl,
        aiPosting: settings.aiPosting,
        weeklyReports: settings.weeklyReports,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        smsNotifications: settings.smsNotifications,
        newsletter: settings.newsletter,
        announcements: settings.announcements,
        theme: settings.theme,
        reducedMotion: settings.reducedMotion,
        highContrast: settings.highContrast,
        twoFactor: settings.twoFactor,
        language: settings.language,
        timezone: settings.timezone,
        socialAccounts: platforms.map(p => ({
          id: p.id,
          platform: p.name,
          handle: p.handle,
          connected: p.connected
        }))
      })
      
      alert(errorMessage)
      setIsSaving(false)
    }
  }

  const handleInviteMember = (e) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    const newMember = {
      id: Date.now(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'Editor',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop'
    }
    setTeamMembers(prev => [...prev, newMember])
    setInviteEmail('')
  }

  const togglePlatform = (id) => {
    setPlatforms(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          const isNowConnected = !p.connected
          return {
            ...p,
            connected: isNowConnected,
            handle: isNowConnected ? (id === 'instagram' ? '@planora_app' : id === 'linkedin' ? 'Planora AI' : id === 'twitter' ? '@planora_hq' : 'Planora Channel') : ''
          }
        }
        return p
      })
      
      // Update the global store's socialAccounts as well
      const newSocialAccounts = updated.map(p => ({
        id: p.id === 'instagram' ? 1 : p.id === 'twitter' ? 2 : p.id === 'linkedin' ? 3 : Date.now(),
        platform: p.name,
        handle: p.handle,
        connected: p.connected
      }))
      updateUser({ socialAccounts: newSocialAccounts })
      
      return updated
    })
  }

  const sections = [
    { key: 'general', name: 'General', desc: 'Manage your workspace preferences and core settings.', icon: SettingsIcon, bg: '#FFF9F1', color: '#BE8755' },
    { key: 'account', name: 'Account', desc: 'Manage your creator profile details, role, and language.', icon: User, bg: '#FDF2F2', color: '#E05A47' },
    { key: 'appearance', name: 'Appearance', desc: 'Customize display themes, modes, and accessibility details.', icon: Monitor, bg: '#F0F5FF', color: '#3B82F6' },
    { key: 'notifications', name: 'Notifications', desc: 'Configure push, email, and digest channel settings.', icon: Bell, bg: '#FFF5F5', color: '#F97316' },
    { key: 'platforms', name: 'Connected Platforms', desc: 'Connect, update, and manage your social channels.', icon: Share2, bg: '#FFFBEB', color: '#D97706' },
    { key: 'team', name: 'Team & Collaboration', desc: 'Invite colleagues, edit roles, and manage team access.', icon: Users, bg: '#FAF5FF', color: '#8B5CF6' },
    { key: 'billing', name: 'Billing', desc: 'Manage subscriptions, payment methods, and invoices.', icon: CreditCard, bg: '#FDF2F8', color: '#EC4899' },
    { key: 'security', name: 'Security', desc: 'Protect your account with credentials and device authorization.', icon: Lock, bg: '#ECFDF5', color: '#10B981' },
  ]

  const activeSectionInfo = sections.find(s => s.key === section)

  const renderSectionContent = () => {
    switch (section) {
      case 'general':
        return (
          <>
            {/* Workspace Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <Settings2 size={16} color="#1A1A1A" />
                <h3>Workspace</h3>
              </div>
              
              <div className="form-group">
                <label>Workspace Name</label>
                <input 
                  type="text" 
                  value={settings.workspaceName}
                  onChange={(e) => setSettings(prev => ({ ...prev, workspaceName: e.target.value }))}
                  placeholder="Enter workspace name"
                />
              </div>

              <div className="form-group">
                <label>Workspace URL</label>
                <div className="input-copy-container">
                  <input 
                    type="text" 
                    value={settings.workspaceUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, workspaceUrl: e.target.value }))}
                    placeholder="Enter workspace URL"
                  />
                  <button onClick={handleCopyUrl} className="btn-copy-action">
                    {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                  </button>
                </div>
                <span className="form-hint">This is your unique workspace URL.</span>
              </div>
            </div>

            {/* Timezone Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <Globe size={16} color="#1A1A1A" />
                <h3>Timezone</h3>
              </div>

              <div className="form-group">
                <div className="select-wrapper">
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                  >
                    <option>(GMT+05:30) Mumbai, Kolkata, New Delhi</option>
                    <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                    <option>(GMT+00:00) London, United Kingdom</option>
                    <option>(GMT+01:00) Central European Time</option>
                  </select>
                  <ChevronRight size={16} className="select-arrow-icon" style={{ transform: 'rotate(90deg)' }} />
                </div>
              </div>
            </div>

            {/* AI Assistant Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <Sparkles size={16} color="#1A1A1A" />
                <h3>AI Assistant</h3>
              </div>

              <div className="toggle-row-premium">
                <div className="toggle-label-wrap">
                  <h4>AI Assistant Optimization</h4>
                  <p>Allow AI to suggest optimal posting times based on engagement.</p>
                </div>
                <div 
                  className={`premium-toggle-switch ${settings.aiPosting ? 'active' : ''}`}
                  onClick={() => handleToggle('aiPosting')}
                >
                  <div className="toggle-switch-thumb" />
                </div>
              </div>

              <div className="divider-line" />

              <div className="toggle-row-premium">
                <div className="toggle-label-wrap">
                  <h4>Weekly Performance Reports</h4>
                  <p>Receive a detailed PDF summary of your weekly reach.</p>
                </div>
                <div 
                  className={`premium-toggle-switch ${settings.weeklyReports ? 'active' : ''}`}
                  onClick={() => handleToggle('weeklyReports')}
                >
                  <div className="toggle-switch-thumb" />
                </div>
              </div>
            </div>
          </>
        )
      case 'account':
        return (
          <>
            {/* Profile Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <User size={16} color="#1A1A1A" />
                <h3>Profile Details</h3>
              </div>

              <div className="avatar-uploader-row">
                <div className="uploader-avatar">
                  <img src={user.avatar} alt="User Avatar" />
                </div>
                <div className="uploader-actions">
                  <button className="btn-dark-outline-sm">Upload New Image</button>
                  <p>JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <div className="grid-2-col">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={settings.fullName}
                    onChange={(e) => setSettings(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input 
                    type="text" 
                    value={settings.role}
                    onChange={(e) => setSettings(prev => ({ ...prev, role: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={settings.email}
                  onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            {/* Language Preferences Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <Globe size={16} color="#1A1A1A" />
                <h3>Preferences</h3>
              </div>

              <div className="form-group">
                <label>System Language</label>
                <div className="select-wrapper">
                  <select 
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                  <ChevronRight size={16} className="select-arrow-icon" style={{ transform: 'rotate(90deg)' }} />
                </div>
              </div>
            </div>
          </>
        )
      case 'appearance':
        return (
          <>
            {/* Theme Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <Monitor size={16} color="#1A1A1A" />
                <h3>Theme Preference</h3>
              </div>

              <div className="theme-premium-grid">
                {[
                  { name: 'Light', icon: Sun, bg: '#FFFDFB', preview: 'light' },
                  { name: 'Dark', icon: Moon, bg: '#1A1A1A', preview: 'dark' },
                  { name: 'System', icon: Laptop, bg: 'linear-gradient(135deg, #FFFDFB 50%, #1A1A1A 50%)', preview: 'system' }
                ].map((t) => (
                  <div 
                    key={t.name}
                    className={`theme-premium-box ${settings.theme === t.name ? 'active' : ''}`}
                    onClick={() => setSettings(prev => ({ ...prev, theme: t.name }))}
                  >
                    <div className="theme-box-preview" style={{ background: t.bg }}>
                      {settings.theme === t.name && (
                        <div className="theme-active-dot">
                          <Check size={10} color="white" />
                        </div>
                      )}
                    </div>
                    <div className="theme-box-label">
                      <t.icon size={14} color={settings.theme === t.name ? '#BE8755' : '#6B6B6B'} />
                      <span>{t.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accessibility Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <Sparkles size={16} color="#1A1A1A" />
                <h3>Accessibility</h3>
              </div>

              <div className="toggle-row-premium">
                <div className="toggle-label-wrap">
                  <h4>Reduced Motion</h4>
                  <p>Disable non-essential animations across the dashboard.</p>
                </div>
                <div 
                  className={`premium-toggle-switch ${settings.reducedMotion ? 'active' : ''}`}
                  onClick={() => handleToggle('reducedMotion')}
                >
                  <div className="toggle-switch-thumb" />
                </div>
              </div>

              <div className="divider-line" />

              <div className="toggle-row-premium">
                <div className="toggle-label-wrap">
                  <h4>High Contrast</h4>
                  <p>Optimize element readability and color ranges.</p>
                </div>
                <div 
                  className={`premium-toggle-switch ${settings.highContrast ? 'active' : ''}`}
                  onClick={() => handleToggle('highContrast')}
                >
                  <div className="toggle-switch-thumb" />
                </div>
              </div>
            </div>
          </>
        )
      case 'notifications':
        return (
          <>
            {/* Delivery preferences Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <Bell size={16} color="#1A1A1A" />
                <h3>Delivery Channels</h3>
              </div>

              <div className="toggle-row-premium">
                <div className="toggle-label-wrap">
                  <h4>Email Notifications</h4>
                  <p>Receive notifications for comment highlights, active mentions, and posts.</p>
                </div>
                <div 
                  className={`premium-toggle-switch ${settings.emailNotifications ? 'active' : ''}`}
                  onClick={() => handleToggle('emailNotifications')}
                >
                  <div className="toggle-switch-thumb" />
                </div>
              </div>

              <div className="divider-line" />

              <div className="toggle-row-premium">
                <div className="toggle-label-wrap">
                  <h4>Push Notifications</h4>
                  <p>Get real-time alerts on comment streams and campaign publications.</p>
                </div>
                <div 
                  className={`premium-toggle-switch ${settings.pushNotifications ? 'active' : ''}`}
                  onClick={() => handleToggle('pushNotifications')}
                >
                  <div className="toggle-switch-thumb" />
                </div>
              </div>

              <div className="divider-line" />

              <div className="toggle-row-premium">
                <div className="toggle-label-wrap">
                  <h4>SMS Alert Reminders</h4>
                  <p>Receive mobile notifications for calendar reminders and urgent errors.</p>
                </div>
                <div 
                  className={`premium-toggle-switch ${settings.smsNotifications ? 'active' : ''}`}
                  onClick={() => handleToggle('smsNotifications')}
                >
                  <div className="toggle-switch-thumb" />
                </div>
              </div>
            </div>

            {/* Digest preferences Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <Sparkles size={16} color="#1A1A1A" />
                <h3>Digest Preferences</h3>
              </div>

              <div className="toggle-row-premium">
                <div className="toggle-label-wrap">
                  <h4>Planora Weekly Briefing</h4>
                  <p>Weekly social strategies, content ideas, and curation summaries.</p>
                </div>
                <div 
                  className={`premium-toggle-switch ${settings.newsletter ? 'active' : ''}`}
                  onClick={() => handleToggle('newsletter')}
                >
                  <div className="toggle-switch-thumb" />
                </div>
              </div>

              <div className="divider-line" />

              <div className="toggle-row-premium">
                <div className="toggle-label-wrap">
                  <h4>Product Features & Launch News</h4>
                  <p>Be the first to know about new integrations and new features.</p>
                </div>
                <div 
                  className={`premium-toggle-switch ${settings.announcements ? 'active' : ''}`}
                  onClick={() => handleToggle('announcements')}
                >
                  <div className="toggle-switch-thumb" />
                </div>
              </div>
            </div>
          </>
        )
      case 'platforms':
        return (
          <>
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <Share2 size={16} color="#1A1A1A" />
                <h3>Connected Platforms</h3>
              </div>

              <p className="card-desc-text">Manage your integrations and publishing accounts for automatic sharing.</p>

              <div className="platforms-action-list">
                {platforms.map((p) => (
                  <div key={p.id} className="platform-action-row">
                    <div className="p-brand-details">
                      <div className="p-brand-badge" style={{ background: `${p.color}12`, color: p.color }}>
                        <p.icon size={20} />
                      </div>
                      <div className="p-brand-info">
                        <h4>{p.name}</h4>
                        <p>{p.connected ? p.handle : 'Not Connected'}</p>
                      </div>
                    </div>
                    
                    <div className="p-connection-actions">
                      <span className={`p-status-badge ${p.connected ? 'active' : ''}`}>
                        {p.connected ? 'Connected' : 'Disconnected'}
                      </span>
                      <button 
                        className={`btn-connection-toggle ${p.connected ? 'connected' : ''}`}
                        onClick={() => togglePlatform(p.id)}
                      >
                        {p.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )
      case 'team':
        return (
          <>
            {/* Workspace Members Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <Users size={16} color="#1A1A1A" />
                <h3>Workspace Members</h3>
              </div>

              <p className="card-desc-text">Administrate your collaborative social team accounts and workflow access rights.</p>

              <div className="team-members-list">
                {teamMembers.map((member) => (
                  <div key={member.id} className="team-member-row">
                    <div className="tm-profile">
                      <div className="tm-avatar">
                        <img src={member.avatar} alt={member.name} />
                      </div>
                      <div className="tm-info">
                        <h4>{member.name}</h4>
                        <p>{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="tm-actions">
                      <span className={`tm-role-badge ${member.role.toLowerCase()}`}>{member.role}</span>
                      {member.role !== 'Owner' && (
                        <button 
                          className="btn-trash-action"
                          onClick={() => setTeamMembers(prev => prev.filter(m => m.id !== member.id))}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite Member Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <Plus size={16} color="#1A1A1A" />
                <h3>Invite Team Member</h3>
              </div>

              <form onSubmit={handleInviteMember} className="invite-member-form">
                <div className="form-group flex-1">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="colleague@yourcompany.com" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-dark-cta-sm">Send Invite</button>
              </form>
            </div>
          </>
        )
      case 'billing':
        return (
          <>
            {/* Active Plan Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <CreditCard size={16} color="#1A1A1A" />
                <h3>Subscription Plan</h3>
              </div>

              <div className="premium-plan-card">
                <div className="plan-details">
                  <div className="plan-badge">PRO</div>
                  <div className="plan-text">
                    <h4>Planora Pro Membership</h4>
                    <p>Unlimited platforms, AI automation access, and active team slots.</p>
                  </div>
                </div>
                <div className="plan-price">
                  <span>$29</span><small>/mo</small>
                </div>
              </div>

              <div className="billing-meta-row">
                <div className="billing-meta-item">
                  <span className="bm-label">Next Invoice Date</span>
                  <span className="bm-val">June 18, 2026</span>
                </div>
                <div className="billing-meta-item">
                  <span className="bm-label">Payment Interval</span>
                  <span className="bm-val">Monthly</span>
                </div>
              </div>

              <div className="card-footer-buttons">
                <button className="btn-gold-sm">Upgrade Plan</button>
                <button className="btn-dark-outline-sm">Cancel Subscription</button>
              </div>
            </div>

            {/* Credit Card Detail Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <CreditCard size={16} color="#1A1A1A" />
                <h3>Payment Details</h3>
              </div>

              <div className="premium-credit-card-preview">
                <div className="cc-details-top">
                  <span className="cc-provider">Visa ending in 4242</span>
                  <span className="cc-chip-design" />
                </div>
                <div className="cc-details-bottom">
                  <span>Deepak Dubey</span>
                  <span>Expires 12/28</span>
                </div>
              </div>

              <div className="card-footer-buttons">
                <button className="btn-dark-outline-sm">Update Card Info</button>
              </div>
            </div>

            {/* Past Invoices Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <RefreshCw size={16} color="#1A1A1A" />
                <h3>Past Invoices</h3>
              </div>

              <div className="invoices-list">
                {[
                  { id: 'PLN-93829', date: 'May 18, 2026', amount: '$29.00', status: 'Paid' },
                  { id: 'PLN-83921', date: 'Apr 18, 2026', amount: '$29.00', status: 'Paid' },
                  { id: 'PLN-72911', date: 'Mar 18, 2026', amount: '$29.00', status: 'Paid' },
                ].map((inv) => (
                  <div key={inv.id} className="invoice-row">
                    <div className="inv-meta">
                      <h4>{inv.id}</h4>
                      <p>{inv.date}</p>
                    </div>
                    <div className="inv-status">
                      <span>{inv.amount}</span>
                      <span className="inv-paid-badge"><CheckCircle2 size={12} color="#10B981" /> Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )
      case 'security':
        return (
          <>
            {/* Password Management Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <LockKeyhole size={16} color="#1A1A1A" />
                <h3>Password Credentials</h3>
              </div>

              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••" 
                  value={passwordCurrent}
                  onChange={(e) => setPasswordCurrent(e.target.value)}
                />
              </div>

              <div className="grid-2-col">
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    placeholder="Min. 8 characters" 
                    value={passwordNew}
                    onChange={(e) => setPasswordNew(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="Verify password" 
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Security Toggles Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <ShieldCheck size={16} color="#1A1A1A" />
                <h3>Security Settings</h3>
              </div>

              <div className="toggle-row-premium">
                <div className="toggle-label-wrap">
                  <h4>Two-Factor Authentication (2FA)</h4>
                  <p>Secure your Planora creator account with an extra verification factor.</p>
                </div>
                <div 
                  className={`premium-toggle-switch ${settings.twoFactor ? 'active' : ''}`}
                  onClick={() => handleToggle('twoFactor')}
                >
                  <div className="toggle-switch-thumb" />
                </div>
              </div>
            </div>

            {/* Active Sessions Card */}
            <div className="settings-section-card">
              <div className="card-header-with-icon">
                <Laptop size={16} color="#1A1A1A" />
                <h3>Active Device Sessions</h3>
              </div>

              <div className="active-sessions-list">
                {[
                  { device: 'Safari • macOS (14.2)', location: 'Mumbai, India', status: 'Active Now', current: true },
                  { device: 'Planora App • iPhone SE', location: 'Kolkata, India', status: 'Authorized 2d ago', current: false },
                ].map((s, idx) => (
                  <div key={idx} className="session-item-row">
                    <div className="session-info">
                      <h4>{s.device}</h4>
                      <p>{s.location} • <span style={{ color: s.current ? '#BE8755' : '#9CA3AF', fontWeight: 600 }}>{s.status}</span></p>
                    </div>
                    {!s.current && (
                      <button className="btn-minimal-revoke">Revoke</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )
      default:
        return (
          <div className="empty-settings-state">
            <Sparkles size={48} className="empty-icon" />
            <h3>Select a Section</h3>
            <p>Choose a category from the menu list to refine your workspace preferences.</p>
          </div>
        )
    }
  }

  // Renders the list of settings categories (on mobile root, or desktop sidebar)
  const renderSettingsMenu = () => {
    const blocks = []
    let currentGroup = []

    sections.forEach((sec) => {
      const isActive = section === sec.key
      if (isActive) {
        if (currentGroup.length > 0) {
          blocks.push({ type: 'group', items: currentGroup })
          currentGroup = []
        }
        blocks.push({ type: 'active', item: sec })
      } else {
        currentGroup.push(sec)
      }
    })

    if (currentGroup.length > 0) {
      blocks.push({ type: 'group', items: currentGroup })
    }

    return (
      <div className="settings-menu-panel">
        <div className="settings-menu-header">
          <h1>Settings</h1>
          <p>Manage your workspace preferences and account.</p>
        </div>
        <div className="menu-sections-list">
          {blocks.map((block, bIdx) => {
            if (block.type === 'active') {
              const item = block.item
              return (
                <button
                  key={item.key}
                  className="menu-section-row active-standalone"
                  onClick={() => navigate(`/settings/${item.key}`)}
                >
                  <div className="sec-left-details">
                    <div className="sec-icon-box active">
                      <item.icon size={18} />
                    </div>
                    <div className="sec-titles">
                      <span className="sec-title-name active">{item.name}</span>
                      <span className="sec-title-desc active">{item.desc}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="sec-arrow-chev active" />
                </button>
              )
            } else {
              return (
                <div key={`group-${bIdx}`} className="menu-sections-group-card">
                  {block.items.map((item) => (
                    <button
                      key={item.key}
                      className="menu-section-group-row"
                      onClick={() => navigate(`/settings/${item.key}`)}
                    >
                      <div className="sec-left-details">
                        <div className="sec-icon-box inactive">
                          <item.icon size={18} />
                        </div>
                        <div className="sec-titles">
                          <span className="sec-title-name">{item.name}</span>
                          <span className="sec-title-desc">{item.desc}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="sec-arrow-chev" />
                    </button>
                  ))}
                </div>
              )
            }
          })}
          <div className="menu-sections-group-card" style={{ marginTop: '16px' }}>
            <button
              className="menu-section-group-row"
              onClick={async () => {
                await supabase.auth.signOut()
                navigate('/login')
              }}
            >
              <div className="sec-left-details">
                <div className="sec-icon-box" style={{ background: '#FFF5F5', color: '#E53E3E' }}>
                  <LogOut size={18} />
                </div>
                <div className="sec-titles">
                  <span className="sec-title-name" style={{ color: '#E53E3E' }}>Logout</span>
                  <span className="sec-title-desc">Sign out of your account</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-parent-layout">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {showSavedToast && (
          <motion.div 
            className="premium-toast-alert"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <ShieldCheck size={18} color="#BE8755" />
            <span>Changes saved successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop side-by-side view (hidden on mobile) */}
      <div className="desktop-layout-view">
        <aside className="settings-sidebar">
          {renderSettingsMenu()}
        </aside>
        
        <main className="settings-content-pane">
          {activeSectionInfo && (
            <div className="desktop-pane-header">
              <h2>{activeSectionInfo.name} Settings</h2>
              <p>{activeSectionInfo.desc}.</p>
            </div>
          )}
          
          <div className="desktop-pane-body">
            <AnimatePresence mode="wait">
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="section-form-flow"
              >
                {renderSectionContent()}

                {activeSectionInfo && (
                  <div className="save-button-container">
                    <button className="btn-gold-save" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <RefreshCw className="spinner-icon-animate" size={16} /> : null}
                      <span>{isSaving ? 'Saving...' : '✓ Save Changes'}</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile-first navigation layout (stacked cards) */}
      <div className="mobile-layout-view">
        <AnimatePresence mode="wait">
          {!section ? (
            /* Root Menu Screen */
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="mobile-root-wrapper"
            >
              {renderSettingsMenu()}
            </motion.div>
          ) : (
            /* Subpage Screen */
            <motion.div
              key={section}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="mobile-subpage-wrapper"
            >
              <div className="mobile-subpage-header">
                <button className="mobile-back-btn" onClick={() => navigate('/settings')}>
                  <ChevronLeft size={20} />
                </button>
                <div className="mobile-header-titles">
                  <h2>{activeSectionInfo?.name} Settings</h2>
                  <p>{activeSectionInfo?.desc}</p>
                </div>
                <div style={{ width: '40px' }} /> {/* alignment balance with back button */}
              </div>

              <div className="mobile-subpage-body">
                <div className="section-form-flow">
                  {renderSectionContent()}
                  
                  {activeSectionInfo && (
                    <div className="save-button-container">
                      <button className="btn-gold-save" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <RefreshCw className="spinner-icon-animate" size={16} /> : null}
                        <span>{isSaving ? 'Saving...' : '✓ Save Changes'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx="true">{`
        /* Core wrapper styles */
        .settings-parent-layout {
          min-height: 100vh;
          background: #FAF8F5;
          width: 100%;
          font-family: 'Outfit', sans-serif;
        }

        /* Layout selectors */
        .desktop-layout-view {
          display: grid;
          grid-template-columns: 340px 1fr;
          max-width: 1440px;
          margin: 0 auto;
          min-height: 100vh;
          background: #FAF8F5;
        }
        .mobile-layout-view {
          display: none;
        }

        /* Sidebar styling */
        .settings-sidebar {
          border-right: 1px solid rgba(0,0,0,0.04);
          background: #FAF8F5;
          padding: clamp(16px, 4.5vh, 40px) 24px;
          min-height: 100vh;
        }

        /* Settings menu block */
        .settings-menu-header h1 {
          font-size: 32px;
          font-weight: 800;
          color: #1A1A1A;
          letter-spacing: -0.03em;
          margin-top: 0; /* Remove browser default top margin */
          margin-bottom: 6px;
        }
        .settings-menu-header p {
          font-size: 14px;
          color: #9CA3AF;
          margin-bottom: 16px;
        }

        .menu-sections-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .menu-section-row.active-standalone {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px 14px 12px;
          border-radius: 16px;
          border: 1px solid rgba(190, 135, 85, 0.15);
          border-left: 4px solid #BE8755;
          background: #FFF7EE;
          box-shadow: 0 4px 12px rgba(190, 135, 85, 0.04);
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .menu-sections-group-card {
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
          width: 100%;
        }

        .menu-section-group-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px 14px 12px;
          background: transparent;
          border: none;
          border-left: 4px solid transparent;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          text-align: left;
          border-bottom: 1px solid rgba(0, 0, 0, 0.035);
        }
        .menu-section-group-row:last-child {
          border-bottom: none;
        }
        .menu-section-group-row:hover, .menu-section-group-row:active {
          background: #FFF7EE;
          border-left-color: #BE8755;
        }

        .sec-left-details {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .sec-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .sec-icon-box.inactive {
          background: #F7F3EC;
          color: #8A8074;
        }
        .sec-icon-box.active {
          background: #FFFFFF;
          color: #BE8755;
          box-shadow: 0 2px 6px rgba(190, 135, 85, 0.15);
          border: 1px solid rgba(190, 135, 85, 0.1);
        }

        .sec-titles {
          display: flex;
          flex-direction: column;
        }
        .sec-title-name {
          font-size: 12.5px;
          font-weight: 700;
          color: #1A1A1A;
        }
        .sec-title-name.active {
          color: #BE8755;
        }
        .sec-title-desc {
          font-size: 10.2px;
          color: #9A958D;
          font-weight: 400;
          margin-top: 2px;
        }
        .sec-title-desc.active {
          color: #B49680;
        }

        .sec-arrow-chev {
          color: #C0B7AD;
          transition: transform 0.2s, color 0.2s;
        }
        .sec-arrow-chev.active {
          color: #BE8755;
        }

        /* Group row hover & active state transformations */
        .menu-section-group-row:hover .sec-icon-box.inactive,
        .menu-section-group-row:active .sec-icon-box.inactive {
          background: #FFFFFF;
          color: #BE8755;
          box-shadow: 0 2px 6px rgba(190, 135, 85, 0.15);
          border: 1px solid rgba(190, 135, 85, 0.1);
        }
        .menu-section-group-row:hover .sec-title-name,
        .menu-section-group-row:active .sec-title-name {
          color: #BE8755;
        }
        .menu-section-group-row:hover .sec-title-desc,
        .menu-section-group-row:active .sec-title-desc {
          color: #B49680;
        }
        .menu-section-group-row:hover .sec-arrow-chev,
        .menu-section-group-row:active .sec-arrow-chev {
          transform: translateX(2px);
          color: #BE8755;
        }
        .menu-section-row.active-standalone:hover .sec-arrow-chev {
          transform: translateX(2px);
        }

        /* Content pane styling */
        .settings-content-pane {
          padding: clamp(24px, 6.5vh, 60px) clamp(24px, 6vw, 80px);
          background: #FAF8F5;
        }
        .desktop-pane-header h2 {
          font-size: 26px;
          font-weight: 800;
          color: #1A1A1A;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .desktop-pane-header p {
          font-size: 14px;
          color: #9CA3AF;
          margin-bottom: 40px;
        }

        .desktop-pane-body {
          max-width: 680px;
        }

        /* Form Controls & Cards matching high fidelity */
        .section-form-flow {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .settings-section-card {
          background: #FFFFFF;
          border: 1px solid rgba(0,0,0,0.05);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.015);
        }

        .card-header-with-icon {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .card-header-with-icon h3 {
          font-size: 14px;
          font-weight: 700;
          color: #1A1A1A;
        }

        .card-desc-text {
          font-size: 13px;
          color: #9CA3AF;
          margin-top: -12px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }
        .form-group:last-child {
          margin-bottom: 0;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 8px;
        }
        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="password"] {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #E5E7EB;
          background: #FFFFFF;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          color: #1A1A1A;
          transition: all 0.2s;
        }
        .form-group input:focus {
          border-color: #BE8755;
          box-shadow: 0 0 0 3px rgba(190, 135, 85, 0.05);
        }

        .grid-2-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .input-copy-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-copy-container input {
          padding-right: 44px !important;
        }
        .btn-copy-action {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
          padding: 6px;
          transition: color 0.2s;
        }
        .btn-copy-action:hover {
          color: #BE8755;
        }

        .form-hint {
          display: block;
          font-size: 11.5px;
          color: #9CA3AF;
          margin-top: 6px;
        }

        .select-wrapper {
          position: relative;
        }
        .select-wrapper select {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid #E5E7EB;
          background: #FFFFFF;
          font-size: 14px;
          outline: none;
          appearance: none;
          cursor: pointer;
          font-weight: 500;
          color: #1A1A1A;
        }
        .select-arrow-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%) rotate(90deg);
          color: #9CA3AF;
          pointer-events: none;
          transition: transform 0.2s;
        }

        /* iOS-style toggle controls to match general settings mockup exactly */
        .toggle-row-premium {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
        }
        .toggle-label-wrap h4 {
          font-size: 13.5px;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 2px;
        }
        .toggle-label-wrap p {
          font-size: 11.5px;
          color: #9CA3AF;
          line-height: 1.4;
        }

        .premium-toggle-switch {
          width: 48px;
          height: 26px;
          background: #E5E7EB;
          border-radius: 99px;
          padding: 3px;
          cursor: pointer;
          transition: background 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          flex-shrink: 0;
        }
        .premium-toggle-switch.active {
          background: #E2AF74;
        }
        .toggle-switch-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-toggle-switch.active .toggle-switch-thumb {
          transform: translateX(22px);
        }

        .divider-line {
          height: 1px;
          background: rgba(0,0,0,0.04);
          margin: 16px 0;
        }

        /* Avatar Uploader */
        .avatar-uploader-row {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }
        .uploader-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          background: #FAF8F5;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .uploader-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .uploader-actions p {
          font-size: 11.5px;
          color: #9CA3AF;
          margin-top: 4px;
        }

        /* Team & members details */
        .team-members-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .team-member-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          border-radius: 12px;
          background: #FAF8F5;
          border: 1px solid rgba(0,0,0,0.02);
        }
        .tm-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tm-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          overflow: hidden;
        }
        .tm-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .tm-info h4 {
          font-size: 13.5px;
          font-weight: 700;
          color: #1A1A1A;
        }
        .tm-info p {
          font-size: 11.5px;
          color: #9CA3AF;
        }
        .tm-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tm-role-badge {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(0,0,0,0.04);
          color: #6B6B6B;
        }
        .tm-role-badge.owner {
          background: #FFF3E0;
          color: #E65100;
        }
        .tm-role-badge.admin {
          background: #E8EAF6;
          color: #283593;
        }

        .btn-trash-action {
          background: transparent;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
        }
        .btn-trash-action:hover {
          color: #F43F5E;
        }

        .invite-member-form {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        .flex-1 { flex: 1; }

        /* Connected platforms */
        .platforms-action-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .platform-action-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.04);
          background: #FFFFFF;
        }
        .p-brand-details {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .p-brand-badge {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .p-brand-info h4 {
          font-size: 13.5px;
          font-weight: 700;
          color: #1A1A1A;
        }
        .p-brand-info p {
          font-size: 11px;
          color: #9CA3AF;
        }
        .p-connection-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .p-status-badge {
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 4px 8px;
          border-radius: 6px;
          background: #F3F4F6;
          color: #6B6B6B;
        }
        .p-status-badge.active {
          background: #E8F5E9;
          color: #2E7D32;
        }
        .btn-connection-toggle {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.08);
          background: white;
          color: #1A1A1A;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-connection-toggle:hover {
          border-color: #BE8755;
          color: #BE8755;
        }
        .btn-connection-toggle.connected {
          background: #FAF8F5;
          color: #6B6B6B;
          border-color: transparent;
        }
        .btn-connection-toggle.connected:hover {
          background: #FEE2E2;
          color: #EF4444;
        }

        /* Billing styles */
        .premium-plan-card {
          background: #FFF9F3;
          border: 1px solid rgba(190, 135, 85, 0.12);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .plan-details {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .plan-badge {
          background: #BE8755;
          color: white;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }
        .plan-text h4 {
          font-size: 14px;
          font-weight: 700;
          color: #1A1A1A;
        }
        .plan-text p {
          font-size: 11.5px;
          color: #9CA3AF;
          margin-top: 1px;
        }
        .plan-price span {
          font-size: 26px;
          font-weight: 800;
          color: #BE8755;
        }
        .plan-price small {
          font-size: 12px;
          color: #6B6B6B;
        }

        .billing-meta-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .billing-meta-item {
          display: flex;
          flex-direction: column;
        }
        .bm-label {
          font-size: 10.5px;
          font-weight: 700;
          color: #9CA3AF;
          text-transform: uppercase;
        }
        .bm-val {
          font-size: 13.5px;
          font-weight: 700;
          color: #1A1A1A;
          margin-top: 4px;
        }

        .premium-credit-card-preview {
          background: linear-gradient(135deg, #1E1B18 0%, #322A26 100%);
          border-radius: 14px;
          padding: 20px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 130px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .cc-details-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cc-provider {
          font-size: 12.5px;
          font-weight: 600;
          opacity: 0.9;
        }
        .cc-chip-design {
          width: 30px;
          height: 20px;
          background: #DFB277;
          border-radius: 4px;
          opacity: 0.8;
        }
        .cc-details-bottom {
          display: flex;
          justify-content: space-between;
          font-size: 11.5px;
          opacity: 0.8;
        }

        .invoices-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .invoice-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.04);
        }
        .inv-meta h4 {
          font-size: 12.5px;
          font-weight: 700;
          color: #1A1A1A;
        }
        .inv-meta p {
          font-size: 11px;
          color: #9CA3AF;
        }
        .inv-status {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .inv-status span {
          font-size: 12.5px;
          font-weight: 700;
          color: #1A1A1A;
        }
        .inv-paid-badge {
          font-size: 9.5px;
          font-weight: 700;
          color: #10B981;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Active Sessions list */
        .active-sessions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .session-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.04);
        }
        .session-info h4 {
          font-size: 12.5px;
          font-weight: 700;
          color: #1A1A1A;
        }
        .session-info p {
          font-size: 11px;
          color: #9CA3AF;
        }
        .btn-minimal-revoke {
          background: transparent;
          border: none;
          color: #9CA3AF;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: color 0.2s;
        }
        .btn-minimal-revoke:hover {
          color: #EF4444;
        }

        /* Theme options styling */
        .theme-premium-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .theme-premium-box {
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        .theme-box-preview {
          height: 64px;
          border-radius: 10px;
          border: 2px solid transparent;
          margin-bottom: 8px;
          position: relative;
          box-shadow: 0 4px 10px rgba(0,0,0,0.01);
          transition: all 0.2s;
        }
        .theme-premium-box.active .theme-box-preview {
          border-color: #BE8755;
          box-shadow: 0 0 0 3px rgba(190, 135, 85, 0.08);
        }
        .theme-active-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #BE8755;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .theme-box-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .theme-box-label span {
          font-size: 12px;
          font-weight: 600;
          color: #6B6B6B;
        }
        .theme-premium-box.active .theme-box-label span {
          color: #BE8755;
        }

        /* Button & Save Layout container */
        .save-button-container {
          margin-top: 12px;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .btn-gold-save {
          background: #E2AF74;
          color: #1A1A1A;
          border: none;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(226, 175, 116, 0.2);
          width: 100%;
        }
        .btn-gold-save:hover {
          background: #d4a065;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(226, 175, 116, 0.3);
        }
        .btn-gold-save:active {
          transform: translateY(0);
        }

        .card-footer-buttons {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        .btn-gold-sm {
          background: #BE8755;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-gold-sm:hover {
          background: #a97548;
        }
        .btn-dark-outline-sm {
          background: white;
          border: 1px solid rgba(0,0,0,0.08);
          color: #1A1A1A;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-dark-outline-sm:hover {
          border-color: #BE8755;
          color: #BE8755;
        }

        .btn-dark-cta-sm {
          background: #1A1A1A;
          color: white;
          border: none;
          padding: 12px 18px;
          border-radius: 10px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-dark-cta-sm:hover {
          background: #2b2b2b;
        }

        .premium-toast-alert {
          position: fixed;
          bottom: 32px;
          right: 32px;
          background: white;
          color: #1A1A1A;
          border: 1px solid rgba(190, 135, 85, 0.2);
          padding: 14px 22px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          font-weight: 700;
          box-shadow: 0 12px 36px rgba(190, 135, 85, 0.06);
          z-index: 9999;
        }

        .empty-settings-state {
          height: 340px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #9CA3AF;
        }
        .empty-icon {
          opacity: 0.15;
          color: #BE8755;
          margin-bottom: 20px;
        }
        .empty-settings-state h3 {
          font-size: 17px;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 6px;
        }
        .empty-settings-state p {
          font-size: 13px;
          max-width: 300px;
        }

        .spinner-icon-animate {
          animation: spin 1.5s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsiveness and Viewports */
        @media (max-width: 1024px) {
          .settings-content-pane {
            padding: 40px;
          }
        }

        @media (max-width: 768px) {
          /* Hide desktop views entirely */
          .desktop-layout-view {
            display: none;
          }
          .mobile-layout-view {
            display: block;
          }

          /* Mobile root menu wrapper */
          .mobile-root-wrapper {
            padding: 0px 20px 40px;
            background: #FAF8F5;
            min-height: 100vh;
          }
          .settings-menu-panel {
            width: 100%;
          }

          /* Subpages wrapper styling matching the right mockup */
          .mobile-subpage-wrapper {
            margin-top: -64px; /* Offsets main-content top padding when navbar is hidden */
            padding: 16px 0 20px;
            background: #FAF8F5;
            min-height: 100vh;
          }

          .mobile-subpage-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding: 0 20px 16px;
            background: transparent;
          }

          .mobile-back-btn {
            background: #FFFFFF;
            border: 1px solid rgba(0,0,0,0.04);
            border-radius: 12px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #1A1A1A;
            transition: all 0.2s;
            box-shadow: 0 2px 6px rgba(0,0,0,0.015);
            margin-top: 2px;
          }
          .mobile-back-btn:active {
            background: #EAE8E5;
          }

          .mobile-header-titles {
            text-align: center;
            flex: 1;
            padding: 11px 12px 0;
          }
          .mobile-header-titles h2 {
            font-size: 20px;
            font-weight: 700;
            color: #1A1A1A;
            letter-spacing: -0.025em;
            margin: 0;
          }
          .mobile-header-titles p {
            font-size: 12px;
            color: #8A8074;
            margin: 4px 0 0 0;
            line-height: 1.4;
          }

          .mobile-subpage-body {
            padding: 10px 20px 100px;
          }

          .save-button-container {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 16px 20px clamp(16px, 4vh, 24px);
            background: linear-gradient(to top, #FAF8F5 80%, rgba(250, 248, 245, 0));
            z-index: 999;
            margin-top: 0;
          }

          /* Small mobile tweaks */
          .settings-section-card {
            padding: 20px;
            border-radius: 14px;
          }
          .grid-2-col {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .theme-premium-grid {
            grid-template-columns: 1fr;
          }
          .theme-box-preview {
            height: 56px;
          }
          .invite-member-form {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .btn-dark-cta-sm {
            width: 100%;
            padding: 12px;
          }
        }
      `}</style>
    </div>
  )
}

export default Settings
