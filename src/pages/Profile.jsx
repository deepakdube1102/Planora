import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  Mail, 
  MapPin, 
  Link as LinkIcon, 
  Calendar,
  Edit2,
  Check,
  X,
  Share2,
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Plus,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  TrendingUp,
  Zap,
  Layout,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  Crown,
  LogOut
} from 'lucide-react'
import { Instagram, Twitter, Linkedin, Youtube, Github } from '../components/ui/BrandIcons'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import Toast, { ToastContainer } from '../components/ui/Toast'

const Profile = () => {
  const navigate = useNavigate()
  const { user, updateUser } = useAppStore()
  const [activeTab, setActiveTab] = useState('personal')
  const [activeMobileSubpage, setActiveMobileSubpage] = useState(null)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Planora Creator Profile',
        text: `Check out ${formData.name}'s social strategy profile on Planora!`,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Profile link copied to clipboard!');
    }
  }
  const [isDirty, setIsDirty] = useState(false)
  const [toasts, setToasts] = useState([])
  const fileInputRef = useRef(null)

  // Local state for editing
  const [formData, setFormData] = useState({
    name: user.name || '',
    role: user.role || 'creator',
    email: user.email || '',
    location: user.location || '',
    website: user.website || 'creator',
    bio: user.bio || 'Product Designer and Content Strategist helping creators scale their digital presence.',
    themeColor: user.themeColor || '#BE8755',
    notifications: user.notifications || {
      email: true,
      push: true,
      mentions: true,
      reports: false
    },
    socials: user.socialAccounts || []
  })

  // Sync with store changes (e.g. after Google OAuth login or Settings updates)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: user.name || prev.name,
      email: user.email || prev.email,
      role: user.role || prev.role,
      location: user.location || prev.location,
      website: user.website || prev.website,
      bio: user.bio || prev.bio,
      themeColor: user.themeColor || prev.themeColor,
      notifications: user.notifications || prev.notifications,
      socials: user.socialAccounts || prev.socials
    }))
    setImagePreview(user.avatar || prev.avatar)
  }, [user])

  const [imagePreview, setImagePreview] = useState(user.avatar)
  const [errors, setErrors] = useState({})
  const [passwordCurrent, setPasswordCurrent] = useState('')
  const [passwordNew, setPasswordNew] = useState('')

  const handleUpdatePassword = async () => {
    if (!passwordNew || passwordNew.length < 8) {
      addToast('New password must be at least 8 characters long', 'error')
      return
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordNew })
      if (error) throw error
      addToast('Password updated successfully!')
      setPasswordCurrent('')
      setPasswordNew('')
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleDeleteAccount = () => {
    addToast('Account deletion is disabled in the demo environment', 'error')
  }

  const handleTogglePlatform = (platformName) => {
    setFormData(prev => {
      const currentSocials = prev.socials || []
      const existingIdx = currentSocials.findIndex(s => s.platform.toLowerCase() === platformName.toLowerCase())
      
      let newSocials;
      if (existingIdx >= 0) {
        newSocials = [...currentSocials]
        newSocials[existingIdx] = {
          ...newSocials[existingIdx],
          connected: !newSocials[existingIdx].connected
        }
      } else {
        newSocials = [...currentSocials, {
          id: Date.now(),
          platform: platformName,
          handle: `@${(prev.name || '').toLowerCase().replace(' ', '_')}`,
          connected: true
        }]
      }
      return { ...prev, socials: newSocials }
    })
  }

  const socialPlatforms = [
    { platform: 'Instagram', icon: Instagram, color: '#E1306C' },
    { platform: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { platform: 'LinkedIn', icon: Linkedin, color: '#0077B5' },
    { platform: 'YouTube', icon: Youtube, color: '#FF0000' },
    { platform: 'GitHub', icon: Github, color: '#181717' },
  ].map(sp => {
    const connectedAcc = formData.socials?.find(s => s.platform.toLowerCase() === sp.platform.toLowerCase())
    return {
      ...sp,
      connected: connectedAcc ? connectedAcc.connected : false
    }
  })

  // Detect unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify({
      name: user.name,
      role: user.role || 'creator',
      email: user.email,
      location: user.location || '',
      website: user.website || 'creator',
      bio: user.bio || 'Product Designer and Content Strategist helping creators scale their digital presence.',
      themeColor: user.themeColor || '#BE8755',
      notifications: user.notifications || {
        email: true,
        push: true,
        mentions: true,
        reports: false
      },
      socials: user.socialAccounts
    })
    setIsDirty(hasChanges)
  }, [formData, user])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email address'
    if (formData.website && !formData.website.includes('.')) newErrors.website = 'Invalid website URL'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) {
      addToast('Please fix the errors before saving', 'error')
      return
    }
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error("Not authenticated")

      // Save profile to database (using upsert to automatically insert the row if it does not exist)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          full_name: formData.name,
          email: formData.email,
          role: formData.role,
          location: formData.location,
          website: formData.website,
          bio: formData.bio,
          theme_color: formData.themeColor,
          avatar_url: imagePreview,
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        if (profileError.code === 'PGRST116' || profileError.status === 404) {
          console.warn('profiles table not yet created. Changes saved locally.')
        } else {
          throw profileError
        }
      }

      // Save social accounts
      for (const social of (formData.socials || [])) {
        const { error: socialError } = await supabase
          .from('social_accounts')
          .upsert({
            user_id: authUser.id,
            platform: social.platform,
            handle: social.handle,
            connected: social.connected
          }, { onConflict: 'user_id,platform' })

        if (socialError) {
          if (socialError.code === 'PGRST116' || socialError.status === 404) {
            console.warn('social_accounts table not yet created. Changes saved locally.')
          } else {
            console.error('Error saving social account:', socialError)
          }
        }
      }

      // Update global store regardless of database status
      updateUser({
        ...formData,
        avatar: imagePreview,
        socialAccounts: formData.socials
      })
      
      setIsDirty(false)
      addToast('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      
      // Still update local store so user doesn't lose changes
      updateUser({
        ...formData,
        avatar: imagePreview,
        socialAccounts: formData.socials
      })
      
      let errorMessage = 'Profile saved locally. '
      if (error.message?.includes('PGRST116') || error.status === 404) {
        errorMessage += 'Database tables not found - run schema.sql migration in Supabase.'
      } else {
        errorMessage += error.message || 'Please try again.'
      }
      
      addToast(errorMessage, 'warning')
      setIsDirty(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name,
      role: user.role || 'creator',
      email: user.email,
      location: user.location || '',
      website: user.website || 'creator',
      bio: user.bio || 'Product Designer and Content Strategist helping creators scale their digital presence.',
      themeColor: user.themeColor || '#BE8755',
      notifications: user.notifications || {
        email: true,
        push: true,
        mentions: true,
        reports: false
      },
      socials: user.socialAccounts
    })
    setImagePreview(user.avatar)
    setIsDirty(false)
    addToast('Changes discarded', 'info')
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setIsDirty(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'social', label: 'Social Accounts', icon: Globe },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  const stats = [
    { label: 'Follower Growth', value: '+12.5%', icon: TrendingUp, color: '#10B981' },
    { label: 'Engagement Rate', value: '8.4%', icon: Zap, color: '#F59E0B' },
    { label: 'Scheduled Posts', value: '14', icon: Layout, color: '#6366F1' },
    { label: 'Consistency Streak', value: '12 Days', icon: Check, color: '#EC4899' },
  ]

  return (
    <div className="profile-page-root">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* ── DESKTOP PROFILE VIEW ── */}
      <div className="desktop-profile-view">
        {/* ── HEADER ── */}
        <div className="profile-header">
          <div className="header-content">
            <div className="avatar-section">
              <div className="avatar-container" onClick={() => fileInputRef.current.click()}>
                <img src={imagePreview} alt="Profile" className="profile-avatar" />
                <div className="avatar-overlay">
                  <Camera size={24} color="white" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
              <div className="user-info-basic">
                <h1>{formData.name} <span className="badge-pro">PRO</span></h1>
                <p>{formData.role}</p>
              </div>
            </div>

            <div className="header-actions">
              <AnimatePresence>
                {isDirty && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="dirty-actions"
                  >
                    <button className="btn-cancel-top" onClick={handleCancel}>Cancel</button>
                    <button className="btn-save-top" onClick={handleSave}>Save Changes</button>
                  </motion.div>
                )}
              </AnimatePresence>
              <button className="btn-share" onClick={handleShare}><Share2 size={18} /> <span>Share Profile</span></button>
            </div>
          </div>
        </div>

        <div className="profile-content-grid">
          {/* ── SIDEBAR (NAV) ── */}
          <div className="profile-sidebar">
            <div className="nav-card glass-card">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && <motion.div layoutId="active-pill" className="active-pill" />}
                </button>
              ))}
              <div className="nav-divider" style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '8px 0' }} />
              <button
                className="nav-item text-red-500 hover-bg-red"
                onClick={async () => {
                  await supabase.auth.signOut()
                  navigate('/login')
                }}
                style={{ color: '#E53E3E' }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>

            {/* ── ANALYTICS MINI ── */}
            <div className="analytics-sidebar-grid">
              {stats.map((stat, i) => (
                <div key={i} className="stat-card glass-card">
                  <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                    <stat.icon size={16} />
                  </div>
                  <div className="stat-meta">
                    <span className="stat-val">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── MAIN EDIT AREA ── */}
          <div className="profile-main-area">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="tab-content-wrapper"
              >
                {activeTab === 'personal' && (
                  <div className="workspace-section glass-card">
                    <div className="section-header">
                      <h2>Personal Information</h2>
                      <p>Update your personal details and how others see you on Planora.</p>
                    </div>
                    
                    <div className="form-grid">
                      <div className="input-group">
                        <label>Full Name</label>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                      </div>
                      <div className="input-group">
                        <label>Email Address</label>
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                      </div>
                      <div className="input-group">
                        <label>Professional Role</label>
                        <input 
                          type="text" 
                          value={formData.role}
                          onChange={e => setFormData({ ...formData, role: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label>Location</label>
                        <input 
                          type="text" 
                          value={formData.location}
                          onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                      <div className="input-group full">
                        <label>Website / Portfolio URL</label>
                        <input 
                          type="text" 
                          value={formData.website}
                          onChange={e => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      <div className="input-group full">
                        <label>Bio</label>
                        <textarea 
                          rows={4}
                          value={formData.bio}
                          onChange={e => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Tell the world about your creative journey..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'branding' && (
                  <div className="workspace-section glass-card">
                    <div className="section-header">
                      <h2>Creator Branding</h2>
                      <p>Customize your workspace theme and brand identity.</p>
                    </div>
                    
                    <div className="branding-grid">
                      <div className="branding-item">
                        <label>Brand Theme Color</label>
                        <div className="color-picker-row">
                          {['#BE8755', '#10B981', '#6366F1', '#EC4899', '#F59E0B', '#1A1A1A'].map(color => (
                            <button 
                              key={color}
                              className={`color-pill ${formData.themeColor === color ? 'active' : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setFormData({ ...formData, themeColor: color })}
                            >
                              {formData.themeColor === color && <Check size={14} color="white" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="branding-item">
                        <label>Public Workspace Preview</label>
                        <div className="preview-card" style={{ borderColor: formData.themeColor + '30' }}>
                          <div className="preview-header" style={{ background: `linear-gradient(135deg, ${formData.themeColor} 0%, ${formData.themeColor}88 100%)` }} />
                          <div className="preview-body">
                            <div className="preview-avatar" />
                            <div className="preview-text">
                              <div className="line-long" />
                              <div className="line-short" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'social' && (
                  <div className="workspace-section glass-card">
                    <div className="section-header">
                      <h2>Social Accounts</h2>
                      <p>Manage your connected platforms and automation settings.</p>
                    </div>
                    
                    <div className="social-workspace-list">
                      {socialPlatforms.map(acc => (
                        <div key={acc.platform} className="social-manage-row">
                          <div className="social-info">
                            <div className="social-icon-box" style={{ backgroundColor: `${acc.color}15` }}>
                              <acc.icon size={20} color={acc.color} />
                            </div>
                            <div className="social-text">
                              <h3>{acc.platform}</h3>
                              <p>{acc.connected ? `@${formData.name.toLowerCase().replace(' ', '_')}` : 'Not connected'}</p>
                            </div>
                          </div>
                          <button 
                            className={`btn-connect ${acc.connected ? 'connected' : ''}`}
                            onClick={() => handleTogglePlatform(acc.platform)}
                          >
                            {acc.connected ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="workspace-section glass-card">
                    <div className="section-header">
                      <h2>Notification Preferences</h2>
                      <p>Control how and when you want to be notified.</p>
                    </div>
                    
                    <div className="pref-manage-list">
                      {[
                        { id: 'email', label: 'Email Notifications', desc: 'Weekly reports and major updates' },
                        { id: 'push', label: 'Push Notifications', desc: 'Real-time alerts for post publishing' },
                        { id: 'mentions', label: 'Mention Alerts', desc: 'When someone tags your brand' },
                        { id: 'reports', label: 'Analytical Reports', desc: 'Deep dive monthly performance data' },
                      ].map(pref => (
                        <div key={pref.id} className="pref-manage-item">
                          <div className="pref-manage-info">
                            <h3>{pref.label}</h3>
                            <p>{pref.desc}</p>
                          </div>
                          <div 
                            className={`toggle-switch ${formData.notifications[pref.id] ? 'active' : ''}`}
                            onClick={() => setFormData({
                              ...formData,
                              notifications: {
                                ...formData.notifications,
                                [pref.id]: !formData.notifications[pref.id]
                              }
                            })}
                          >
                            <div className="toggle-handle" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="workspace-section glass-card">
                    <div className="section-header">
                      <h2>Security & Password</h2>
                      <p>Keep your account secure by updating your credentials.</p>
                    </div>
                    
                    <div className="security-form">
                      <div className="input-group">
                        <label>Current Password</label>
                        <div className="password-wrapper">
                          <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={passwordCurrent}
                            onChange={(e) => setPasswordCurrent(e.target.value)}
                          />
                          <Lock size={16} className="pw-icon" />
                        </div>
                      </div>
                      <div className="input-group">
                        <label>New Password</label>
                        <div className="password-wrapper">
                          <input 
                            type="password" 
                            placeholder="Min. 8 characters" 
                            value={passwordNew}
                            onChange={(e) => setPasswordNew(e.target.value)}
                          />
                          <Shield size={16} className="pw-icon" />
                        </div>
                      </div>
                      <button className="btn-security-update" onClick={handleUpdatePassword}>Update Password</button>
                    </div>

                    <div className="danger-zone">
                      <h3>Danger Zone</h3>
                      <p>Permanently delete your account and all its data. This action cannot be undone.</p>
                      <button className="btn-delete-account" onClick={handleDeleteAccount}>Delete Account</button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── MOBILE PROFILE VIEW ── */}
      <div className="mobile-profile-view">
        {activeMobileSubpage === null ? (
          /* Mobile Profile Home View */
          <div className="mobile-profile-home">
            {/* User Profile Card */}
            <div className="mobile-profile-card">
              <div className="mobile-card-top-row">
                <div className="mobile-avatar-col">
                  <div className="mobile-avatar-wrapper" onClick={() => fileInputRef.current.click()}>
                    <img src={imagePreview} alt="Profile" className="mobile-avatar-img" />
                    <div className="mobile-camera-overlay">
                      <Camera size={12} color="#BE8755" />
                    </div>
                  </div>
                </div>
                <div className="mobile-details-col">
                  <div className="mobile-name-pro">
                    <span className="mobile-user-name">{formData.name}</span>
                    <span className="mobile-badge-pro">
                      <span className="crown-emoji">👑</span> PRO
                    </span>
                  </div>
                  <span className="mobile-user-role">{formData.role}</span>
                  
                  <div className="mobile-location-share">
                    <span className="mobile-user-location">
                      <MapPin size={11} className="loc-icon" /> {formData.location}
                    </span>
                    <button className="mobile-btn-share" onClick={handleShare}>
                      <Share2 size={11} /> Share Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mobile-stats-row">
              {stats.map((stat, i) => (
                <div key={i} className="mobile-stat-card">
                  <div className="mobile-stat-icon-wrapper" style={{ backgroundColor: `${stat.color}12`, color: stat.color }}>
                    <stat.icon size={16} />
                  </div>
                  <span className="mobile-stat-value">{stat.value}</span>
                  <span className="mobile-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Settings Links Menu Card */}
            <div className="mobile-menu-card">
              {[
                { id: 'personal', label: 'Personal Information', desc: 'Edit your personal details', icon: User },
                { id: 'branding', label: 'Branding', desc: 'Manage your brand identity', icon: Palette },
                { id: 'social', label: 'Social Accounts', desc: 'Connect and manage platforms', icon: Globe },
                { id: 'preferences', label: 'Preferences', desc: 'Customize your experience', icon: Bell },
                { id: 'security', label: 'Security', desc: 'Password and account security', icon: Shield }
              ].map(item => (
                <div 
                  key={item.id} 
                  className="mobile-menu-item"
                  onClick={() => {
                    setActiveTab(item.id);
                    setActiveMobileSubpage(item.id);
                  }}
                >
                  <div className="mobile-menu-left">
                    <div className="mobile-menu-icon-box">
                      <item.icon size={18} color="#BE8755" />
                    </div>
                    <div className="mobile-menu-text">
                      <span className="mobile-menu-title">{item.label}</span>
                      <span className="mobile-menu-desc">{item.desc}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="mobile-menu-chevron" />
                </div>
              ))}
              <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '8px 16px' }} />
              <div 
                className="mobile-menu-item"
                onClick={async () => {
                  await supabase.auth.signOut()
                  navigate('/login')
                }}
              >
                <div className="mobile-menu-left">
                  <div className="mobile-menu-icon-box" style={{ background: '#FFF5F5' }}>
                    <LogOut size={18} color="#E53E3E" />
                  </div>
                  <div className="mobile-menu-text">
                    <span className="mobile-menu-title" style={{ color: '#E53E3E' }}>Logout</span>
                    <span className="mobile-menu-desc">Sign out of your account</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade Banner */}
            <div className="mobile-upgrade-banner">
              <div className="mobile-upgrade-left">
                <div className="mobile-upgrade-icon-box">
                  <Crown size={18} style={{ fill: '#BE8755', color: '#BE8755' }} />
                </div>
                <div className="mobile-upgrade-text">
                  <span className="mobile-upgrade-title">Upgrade to Planora Pro</span>
                  <span className="mobile-upgrade-desc">Unlock advanced features and insights</span>
                </div>
              </div>
              <ChevronRight size={18} color="#BE8755" />
            </div>
          </div>
        ) : (
          /* Mobile Nested Editing View */
          <div className="mobile-subpage-view">
            {/* Mobile Subpage Top Header Bar */}
            <div className="mobile-subpage-header">
              <button className="mobile-subpage-back" onClick={() => setActiveMobileSubpage(null)}>
                <ArrowLeft size={20} />
              </button>
              <h2>{tabs.find(t => t.id === activeMobileSubpage)?.label}</h2>
              <button 
                className={`mobile-subpage-save ${isDirty ? 'dirty' : ''}`}
                onClick={handleSave}
                disabled={!isDirty}
              >
                <Check size={20} />
              </button>
            </div>

            {/* Mobile Subpage Content area */}
            <div className="mobile-subpage-content">
              {activeMobileSubpage === 'personal' && (
                <div className="mobile-section-card">
                  <div className="mobile-input-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>
                  <div className="mobile-input-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>
                  <div className="mobile-input-group">
                    <label>Professional Role</label>
                    <input 
                      type="text" 
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>
                  <div className="mobile-input-group">
                    <label>Location</label>
                    <input 
                      type="text" 
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="mobile-input-group">
                    <label>Website / Portfolio URL</label>
                    <input 
                      type="text" 
                      value={formData.website}
                      onChange={e => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="mobile-input-group">
                    <label>Bio</label>
                    <textarea 
                      rows={4}
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell the world about your journey..."
                    />
                  </div>
                </div>
              )}

              {activeMobileSubpage === 'branding' && (
                <div className="mobile-section-card">
                  <label className="mobile-section-label">Brand Theme Color</label>
                  <div className="mobile-color-picker">
                    {['#BE8755', '#10B981', '#6366F1', '#EC4899', '#F59E0B', '#1A1A1A'].map(color => (
                      <button 
                        key={color}
                        className={`mobile-color-pill ${formData.themeColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, themeColor: color })}
                      >
                        {formData.themeColor === color && <Check size={14} color="white" />}
                      </button>
                    ))}
                  </div>

                  <label className="mobile-section-label" style={{ marginTop: '24px', display: 'block' }}>Public Workspace Preview</label>
                  <div className="mobile-preview-card" style={{ borderColor: formData.themeColor + '30' }}>
                    <div className="mobile-preview-header" style={{ background: `linear-gradient(135deg, ${formData.themeColor} 0%, ${formData.themeColor}88 100%)` }} />
                    <div className="mobile-preview-body">
                      <div className="mobile-preview-avatar" />
                      <div className="mobile-preview-text">
                        <div className="mobile-line-long" />
                        <div className="mobile-line-short" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeMobileSubpage === 'social' && (
                <div className="mobile-section-card social-list">
                  {socialPlatforms.map(acc => (
                    <div key={acc.platform} className="mobile-social-row">
                      <div className="social-info">
                        <div className="social-icon-box" style={{ backgroundColor: `${acc.color}12` }}>
                          <acc.icon size={20} color={acc.color} />
                        </div>
                        <div className="social-text">
                          <h3>{acc.platform}</h3>
                          <p>{acc.connected ? `@${formData.name.toLowerCase().replace(' ', '_')}` : 'Not connected'}</p>
                        </div>
                      </div>
                      <button 
                        className={`mobile-btn-connect ${acc.connected ? 'connected' : ''}`}
                        onClick={() => handleTogglePlatform(acc.platform)}
                      >
                        {acc.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeMobileSubpage === 'preferences' && (
                <div className="mobile-section-card pref-list">
                  {[
                    { id: 'email', label: 'Email Notifications', desc: 'Weekly reports and major updates' },
                    { id: 'push', label: 'Push Notifications', desc: 'Real-time alerts for post publishing' },
                    { id: 'mentions', label: 'Mention Alerts', desc: 'When someone tags your brand' },
                    { id: 'reports', label: 'Analytical Reports', desc: 'Deep dive monthly performance data' },
                  ].map(pref => (
                    <div key={pref.id} className="mobile-pref-row">
                      <div className="pref-info">
                        <h3>{pref.label}</h3>
                        <p>{pref.desc}</p>
                      </div>
                      <div 
                        className={`mobile-toggle-switch ${formData.notifications[pref.id] ? 'active' : ''}`}
                        onClick={() => setFormData({
                          ...formData,
                          notifications: {
                            ...formData.notifications,
                            [pref.id]: !formData.notifications[pref.id]
                          }
                        })}
                      >
                        <div className="toggle-handle" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeMobileSubpage === 'security' && (
                <div className="mobile-section-card security-card">
                  <div className="mobile-input-group">
                    <label>Current Password</label>
                    <div className="mobile-pw-wrapper">
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={passwordCurrent}
                        onChange={(e) => setPasswordCurrent(e.target.value)}
                      />
                      <Lock size={16} className="pw-icon" />
                    </div>
                  </div>
                  <div className="mobile-input-group">
                    <label>New Password</label>
                    <div className="mobile-pw-wrapper">
                      <input 
                        type="password" 
                        placeholder="Min. 8 characters" 
                        value={passwordNew}
                        onChange={(e) => setPasswordNew(e.target.value)}
                      />
                      <Shield size={16} className="pw-icon" />
                    </div>
                  </div>
                  <button className="mobile-btn-security-update" onClick={handleUpdatePassword}>Update Password</button>

                  <div className="mobile-danger-zone">
                    <h3>Danger Zone</h3>
                    <p>Permanently delete your account. This action cannot be undone.</p>
                    <button className="mobile-btn-delete-account" onClick={handleDeleteAccount}>Delete Account</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .desktop-profile-view {
          display: block;
        }
        .mobile-profile-view {
          display: none;
        }

        .profile-page-root {
          padding: 40px;
          max-width: 1400px;
          margin: 0 auto;
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
        }

        /* ── HEADER ── */
        .profile-header {
          margin-bottom: 40px;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .avatar-section {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .avatar-container {
          width: 100px;
          height: 100px;
          border-radius: 30px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          background: #f0f0f0;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .profile-avatar { width: 100%; height: 100%; object-fit: cover; }
        .avatar-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s;
        }
        .avatar-container:hover .avatar-overlay { opacity: 1; }

        .user-info-basic h1 { font-size: 28px; font-weight: 700; color: #1a1a1a; display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
        .badge-pro { font-size: 10px; background: #1a1a1a; color: white; padding: 4px 8px; border-radius: 6px; }
        .user-info-basic p { color: #6b6b6b; font-weight: 500; }

        .header-actions { display: flex; align-items: center; gap: 12px; }
        .dirty-actions { display: flex; gap: 12px; }
        .btn-cancel-top { padding: 10px 20px; border-radius: 12px; font-weight: 600; color: #6b6b6b; cursor: pointer; background: transparent; border: none; }
        .btn-save-top { padding: 10px 24px; border-radius: 14px; font-weight: 600; background: #1a1a1a; color: white; cursor: pointer; border: none; box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
        .btn-share { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 14px; background: white; border: 1px solid rgba(0,0,0,0.05); font-weight: 600; color: #1a1a1a; cursor: pointer; transition: 0.2s; }
        .btn-share:hover { background: #f9f9f9; }

        /* ── GRID LAYOUT ── */
        .profile-content-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 40px;
        }

        /* ── SIDEBAR ── */
        .profile-sidebar { display: flex; flex-direction: column; gap: 32px; }
        .nav-card { padding: 12px; display: flex; flex-direction: column; gap: 4px; }
        .nav-item {
          display: flex; align-items: center; gap: 12px; padding: 14px 16px;
          border-radius: 16px; font-weight: 600; color: #6b6b6b; cursor: pointer;
          border: none; background: transparent; position: relative; width: 100%;
          transition: 0.2s;
        }
        .nav-item:hover { color: #1a1a1a; background: rgba(0,0,0,0.02); }
        .nav-item.active { color: #1a1a1a; }
        .active-pill {
          position: absolute; inset: 0; background: white; border-radius: 16px;
          z-index: -1; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.03);
        }

        .analytics-sidebar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .stat-card { padding: 16px; text-align: center; }
        .stat-icon { width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
        .stat-val { display: block; font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
        .stat-label { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.02em; }

        /* ── MAIN AREA ── */
        .workspace-section { padding: 40px; }
        .section-header { margin-bottom: 32px; }
        .section-header h2 { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; }
        .section-header p { color: #9ca3af; font-size: 14px; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group.full { grid-column: span 2; }
        .input-group label { font-size: 13px; font-weight: 700; color: #1a1a1a; margin-left: 4px; }
        .input-group input, .input-group textarea {
          padding: 12px 16px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.08);
          background: white; outline: none; font-size: 14px; font-family: inherit;
          transition: 0.2s;
        }
        .input-group input:focus, .input-group textarea:focus { border-color: #1a1a1a; box-shadow: 0 0 0 4px rgba(0,0,0,0.02); }
        .input-group input.error { border-color: #ef4444; background: #fffafa; }
        .error-text { font-size: 12px; color: #ef4444; font-weight: 600; margin-left: 4px; }

        /* ── BRANDING ── */
        .branding-grid { display: flex; flex-direction: column; gap: 32px; }
        .color-picker-row { display: flex; gap: 12px; margin-top: 12px; }
        .color-pill { width: 40px; height: 40px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .color-pill.active { transform: scale(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

        .preview-card { border: 1px solid; border-radius: 20px; overflow: hidden; margin-top: 16px; max-width: 400px; }
        .preview-header { height: 80px; }
        .preview-body { padding: 16px; display: flex; gap: 12px; background: white; }
        .preview-avatar { width: 40px; height: 40px; border-radius: 12px; background: #f0f0f0; }
        .preview-text { flex: 1; display: flex; flex-direction: column; gap: 8px; padding-top: 4px; }
        .line-long { height: 8px; width: 80%; background: #f0f0f0; border-radius: 4px; }
        .line-short { height: 8px; width: 40%; background: #f0f0f0; border-radius: 4px; }

        /* ── SOCIAL ── */
        .social-workspace-list { display: flex; flex-direction: column; gap: 16px; }
        .social-manage-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px; border-radius: 20px; background: white; border: 1px solid rgba(0,0,0,0.03);
        }
        .social-info { display: flex; align-items: center; gap: 16px; }
        .social-icon-box { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .social-text h3 { font-size: 15px; font-weight: 700; }
        .social-text p { font-size: 13px; color: #9ca3af; }
        .btn-connect { padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; border: 1px solid rgba(0,0,0,0.05); background: #f9f9f9; }
        .btn-connect.connected { background: #fff; color: #ef4444; border-color: #fee2e2; }

        /* ── PREFERENCES ── */
        .pref-manage-list { display: flex; flex-direction: column; gap: 20px; }
        .pref-manage-item { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid rgba(0,0,0,0.03); }
        .pref-manage-info h3 { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
        .pref-manage-info p { font-size: 13px; color: #9ca3af; }
        .toggle-switch { width: 48px; height: 26px; background: #e5e7eb; border-radius: 100px; padding: 4px; cursor: pointer; transition: 0.3s; }
        .toggle-switch.active { background: #1a1a1a; }
        .toggle-handle { width: 18px; height: 18px; background: white; border-radius: 50%; transition: 0.3s; }
        .toggle-switch.active .toggle-handle { transform: translateX(22px); }

        /* ── SECURITY ── */
        .security-form { display: flex; flex-direction: column; gap: 20px; margin-bottom: 40px; }
        .password-wrapper { position: relative; }
        .password-wrapper input { width: 100%; padding-right: 44px; }
        .pw-icon { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .btn-security-update { width: max-content; padding: 12px 24px; border-radius: 14px; background: #1a1a1a; color: white; font-weight: 700; border: none; cursor: pointer; }

        .danger-zone { padding: 24px; border-radius: 20px; background: #fff5f5; border: 1px solid #fee2e2; }
        .danger-zone h3 { color: #c53030; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
        .danger-zone p { font-size: 13px; color: #9b2c2c; margin-bottom: 16px; }
        .btn-delete-account { padding: 10px 20px; border-radius: 12px; background: #c53030; color: white; font-weight: 700; border: none; cursor: pointer; }

        .hidden { display: none; }

        @media (max-width: 1024px) {
          .profile-content-grid { grid-template-columns: 1fr; }
          .profile-sidebar { flex-direction: column; }
          .nav-card { flex-direction: row; overflow-x: auto; width: 100%; padding: 8px; scrollbar-width: none; }
          .nav-card::-webkit-scrollbar { display: none; }
          .nav-item { white-space: nowrap; flex-shrink: 0; padding: 10px 16px; font-size: 13px; }
          .analytics-sidebar-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .desktop-profile-view {
            display: none !important;
          }
          .mobile-profile-view {
            display: block !important;
            padding: 16px 0 40px;
            max-width: 100%;
            overflow-x: hidden;
          }
          .profile-page-root {
            padding: 0 16px;
            background: #F9F6F1;
            min-height: 100vh;
          }
          
          /* User Profile Card */
          .mobile-profile-card {
            background: #FFFFFF;
            border: 1px solid rgba(0, 0, 0, 0.05);
            border-radius: 24px;
            padding: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
            margin-bottom: 16px;
          }
          .mobile-card-top-row {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .mobile-avatar-col {
            position: relative;
          }
          .mobile-avatar-wrapper {
            position: relative;
            width: 76px;
            height: 76px;
            border-radius: 20px;
            overflow: hidden;
            background: #F9F6F1;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            cursor: pointer;
          }
          .mobile-avatar-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .mobile-camera-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 24px;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .mobile-details-col {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .mobile-name-pro {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          .mobile-user-name {
            font-size: 18px;
            font-weight: 700;
            color: #1A1A1A;
            letter-spacing: -0.02em;
          }
          .mobile-badge-pro {
            background: linear-gradient(135deg, #BE8755 0%, #a27244 100%);
            color: #FFFFFF;
            font-size: 9px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 99px;
            display: flex;
            align-items: center;
            gap: 2px;
            letter-spacing: 0.05em;
            box-shadow: 0 2px 6px rgba(190, 135, 85, 0.2);
          }
          .mobile-user-role {
            font-size: 12px;
            color: #6B7280;
            font-weight: 500;
          }
          
          .mobile-location-share {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 4px;
            gap: 8px;
          }
          .mobile-user-location {
            font-size: 11px;
            color: #9CA3AF;
            display: flex;
            align-items: center;
            gap: 4px;
            font-weight: 500;
          }
          .loc-icon {
            color: #BE8755;
          }
          .mobile-btn-share {
            background: #F9F6F1;
            border: 1px solid rgba(190, 135, 85, 0.15);
            color: #BE8755;
            font-size: 11px;
            font-weight: 600;
            padding: 5px 10px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            outline: none;
            transition: all 0.2s;
          }
          .mobile-btn-share:active {
            transform: scale(0.95);
          }

          /* Stats Row */
          .mobile-stats-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-bottom: 16px;
            width: 100%;
          }
          .mobile-stat-card {
            background: #FFFFFF;
            border: 1px solid rgba(0, 0, 0, 0.04);
            border-radius: 16px;
            padding: 10px 4px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
          }
          .mobile-stat-icon-wrapper {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 6px;
          }
          .mobile-stat-value {
            font-size: 13px;
            font-weight: 700;
            color: #1A1A1A;
            margin-bottom: 2px;
          }
          .mobile-stat-label {
            font-size: 8px;
            font-weight: 700;
            color: #9CA3AF;
            text-transform: uppercase;
            letter-spacing: 0.02em;
          }

          /* Luxury Menu Card */
          .mobile-menu-card {
            background: #FFFFFF;
            border: 1px solid rgba(0, 0, 0, 0.05);
            border-radius: 24px;
            padding: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
            margin-bottom: 16px;
            display: flex;
            flex-direction: column;
          }
          .mobile-menu-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 12px;
            border-radius: 16px;
            cursor: pointer;
            transition: background 0.2s;
          }
          .mobile-menu-item:active {
            background: #F9F6F1;
          }
          .mobile-menu-item:not(:last-child) {
            border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          }
          .mobile-menu-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .mobile-menu-icon-box {
            width: 38px;
            height: 38px;
            border-radius: 12px;
            background: #F9F6F1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .mobile-menu-text {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .mobile-menu-title {
            font-size: 14px;
            font-weight: 600;
            color: #1A1A1A;
          }
          .mobile-menu-desc {
            font-size: 11px;
            color: #9CA3AF;
          }
          .mobile-menu-chevron {
            color: #BE8755;
          }

          /* Upgrade Banner */
          .mobile-upgrade-banner {
            background: linear-gradient(135deg, #FFFDF9 0%, #FAF6F0 100%);
            border: 1.5px solid rgba(190, 135, 85, 0.25);
            border-radius: 20px;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(190, 135, 85, 0.03);
          }
          .mobile-upgrade-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .mobile-upgrade-icon-box {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: rgba(190, 135, 85, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .mobile-upgrade-text {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .mobile-upgrade-title {
            font-size: 14px;
            font-weight: 700;
            color: #BE8755;
          }
          .mobile-upgrade-desc {
            font-size: 11px;
            color: #8C6540;
            font-weight: 500;
          }

          /* Nested Subpage Edit Drawer View */
          .mobile-subpage-view {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #F9F6F1;
            z-index: 2000;
            display: flex;
            flex-direction: column;
          }
          
          /* Back, Title, and Save Bar */
          .mobile-subpage-header {
            height: 64px;
            background: #FFFFFF;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
          }
          .mobile-subpage-back {
            background: transparent;
            border: none;
            cursor: pointer;
            color: #1A1A1A;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            outline: none;
          }
          .mobile-subpage-back:active {
            background: rgba(0, 0, 0, 0.03);
          }
          .mobile-subpage-header h2 {
            font-size: 16px;
            font-weight: 700;
            color: #1A1A1A;
            margin: 0;
          }
          .mobile-subpage-save {
            background: transparent;
            border: none;
            cursor: pointer;
            color: #D1D5DB;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            outline: none;
            transition: all 0.2s;
          }
          .mobile-subpage-save.dirty {
            color: #BE8755;
          }
          .mobile-subpage-save:active:not(:disabled) {
            background: rgba(190, 135, 85, 0.05);
          }

          .mobile-subpage-content {
            flex: 1;
            overflow-y: auto;
            padding: 20px 16px 40px;
          }
          .mobile-section-card {
            background: #FFFFFF;
            border: 1px solid rgba(0, 0, 0, 0.05);
            border-radius: 24px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          }

          /* Forms Elements */
          .mobile-input-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
          }
          .mobile-input-group label {
            font-size: 12px;
            font-weight: 700;
            color: #1A1A1A;
            margin-left: 2px;
          }
          .mobile-input-group input, .mobile-input-group textarea {
            padding: 12px 14px;
            border-radius: 12px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: #FFFFFF;
            outline: none;
            font-size: 14px;
            font-family: inherit;
            color: #1A1A1A;
            transition: border-color 0.2s;
          }
          .mobile-input-group input:focus, .mobile-input-group textarea:focus {
            border-color: #BE8755;
          }
          .mobile-input-group input.error {
            border-color: #EF4444;
            background: #FFF5F5;
          }

          /* Branding Subpage specific */
          .mobile-section-label {
            font-size: 12px;
            font-weight: 700;
            color: #1A1A1A;
          }
          .mobile-color-picker {
            display: flex;
            gap: 10px;
            margin-top: 10px;
          }
          .mobile-color-pill {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
          }
          .mobile-color-pill:active {
            transform: scale(0.9);
          }
          .mobile-color-pill.active {
            transform: scale(1.05);
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
          }
          
          .mobile-preview-card {
            border: 1px solid;
            border-radius: 16px;
            overflow: hidden;
            margin-top: 12px;
            width: 100%;
          }
          .mobile-preview-header {
            height: 60px;
          }
          .mobile-preview-body {
            padding: 12px;
            display: flex;
            gap: 10px;
            background: #FFFFFF;
          }
          .mobile-preview-avatar {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: #F3F4F6;
          }
          .mobile-preview-text {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding-top: 2px;
          }
          .mobile-line-long {
            height: 6px;
            width: 75%;
            background: #F3F4F6;
            border-radius: 3px;
          }
          .mobile-line-short {
            height: 6px;
            width: 35%;
            background: #F3F4F6;
            border-radius: 3px;
          }

          /* Social connections row */
          .mobile-social-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
          }
          .mobile-social-row:not(:last-child) {
            border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          }
          .mobile-social-row .social-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .mobile-social-row .social-icon-box {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .mobile-social-row h3 {
            font-size: 14px;
            font-weight: 700;
            margin: 0;
            color: #1A1A1A;
          }
          .mobile-social-row p {
            font-size: 11px;
            color: #9CA3AF;
            margin: 2px 0 0;
          }
          .mobile-btn-connect {
            padding: 6px 12px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
            border: 1px solid rgba(0, 0, 0, 0.05);
            background: #F9F6F1;
            color: #BE8755;
            outline: none;
            transition: all 0.2s;
          }
          .mobile-btn-connect:active {
            transform: scale(0.95);
          }
          .mobile-btn-connect.connected {
            background: #FFFFFF;
            color: #EF4444;
            border-color: #FEE2E2;
          }

          /* Preferences switches */
          .mobile-pref-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
          }
          .mobile-pref-row:not(:last-child) {
            border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          }
          .mobile-pref-row h3 {
            font-size: 14px;
            font-weight: 700;
            margin: 0;
            color: #1A1A1A;
          }
          .mobile-pref-row p {
            font-size: 11px;
            color: #9CA3AF;
            margin: 2px 0 0;
          }
          .mobile-toggle-switch {
            width: 44px;
            height: 24px;
            background: #E5E7EB;
            border-radius: 100px;
            padding: 3px;
            cursor: pointer;
            transition: background 0.3s;
          }
          .mobile-toggle-switch.active {
            background: #BE8755;
          }
          .mobile-toggle-switch .toggle-handle {
            width: 18px;
            height: 18px;
            background: #FFFFFF;
            border-radius: 50%;
            transition: transform 0.3s;
          }
          .mobile-toggle-switch.active .toggle-handle {
            transform: translateX(20px);
          }

          /* Security Page specific */
          .mobile-pw-wrapper {
            position: relative;
          }
          .mobile-pw-wrapper input {
            width: 100%;
            padding-right: 40px;
          }
          .mobile-pw-wrapper .pw-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #9CA3AF;
          }
          .mobile-btn-security-update {
            width: 100%;
            padding: 12px;
            border-radius: 12px;
            background: #1A1A1A;
            color: #FFFFFF;
            font-weight: 700;
            border: none;
            cursor: pointer;
            margin-top: 10px;
            outline: none;
            transition: background 0.2s;
          }
          .mobile-btn-security-update:active {
            background: #333333;
          }
          .mobile-danger-zone {
            margin-top: 24px;
            padding: 16px;
            border-radius: 16px;
            background: #FFF5F5;
            border: 1px solid #FEE2E2;
          }
          .mobile-danger-zone h3 {
            color: #C53030;
            font-size: 14px;
            font-weight: 700;
            margin: 0 0 4px;
          }
          .mobile-danger-zone p {
            font-size: 11px;
            color: #9B2C2C;
            margin: 0 0 12px;
          }
          .mobile-btn-delete-account {
            width: 100%;
            padding: 10px;
            border-radius: 10px;
            background: #C53030;
            color: #FFFFFF;
            font-weight: 700;
            border: none;
            cursor: pointer;
            outline: none;
          }
        }
      `}</style>
    </div>
  )
}

export default Profile
