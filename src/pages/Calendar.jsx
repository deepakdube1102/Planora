import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { 
  format, 
  startOfWeek, 
  addDays, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  startOfMonth, 
  endOfMonth, 
  endOfWeek,
  addMonths,
  subMonths,
  subWeeks,
  addWeeks,
  isSameMonth,
  startOfDay
} from 'date-fns'
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronDown, 
  MoreHorizontal, 
  Calendar as CalendarIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layout,
  List,
  Columns,
  Grid,
  Clock,
  Trash2,
  Edit2,
  Target,
  Home,
  Bot,
  BarChart3,
  Settings as SettingsIcon,
  Bell,
  LayoutDashboard,
  Library,
  Megaphone,
  Crown,
  HelpCircle,
  LogOut
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { supabase } from '../lib/supabase'
import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from '@dnd-kit/core'

import CalendarPostCard from '../components/calendar/CalendarPostCard'
import PostModal from '../components/modals/PostModal'
import CalendarLeftSidebar from '../components/calendar/CalendarLeftSidebar'
import CalendarRightSidebar from '../components/calendar/CalendarRightSidebar'
import TimeGrid from '../components/calendar/TimeGrid'
import { Instagram, Twitter, Linkedin, Facebook, Youtube, Tiktok } from '../components/ui/BrandIcons'
import logo from '../assets/logo_golden.png'

const CalendarView = () => {
  const { 
    posts, 
    addPost, 
    deletePost, 
    updatePost, 
    reschedulePost,
    activePlatformFilter,
    activeCampaignFilter,
    setActivePlatformFilter,
    user
  } = useAppStore()

  const navigate = useNavigate()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('week') // 'day' | 'week' | 'month' | 'agenda'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMonthYearSelectorOpen, setIsMonthYearSelectorOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  )

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesPlatform = activePlatformFilter === 'all' || post.platform === activePlatformFilter
      const matchesCampaign = activeCampaignFilter === 'all' || post.campaignId === activeCampaignFilter
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (post.caption && post.caption.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesPlatform && matchesCampaign && matchesSearch
    })
  }, [posts, activePlatformFilter, activeCampaignFilter, searchQuery])

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      // Intelligently parse numeric IDs (fallback mode) but retain string UUIDs (Supabase mode)
      const postId = isNaN(active.id) ? active.id : parseInt(active.id)
      const overId = over.id
      
      if (viewMode === 'month') {
        const newDate = new Date(overId)
        const oldPost = posts.find(p => p.id === postId)
        if (!oldPost) return
        
        const updatedDate = new Date(newDate)
        const oldDate = new Date(oldPost.scheduled_at)
        updatedDate.setHours(oldDate.getHours(), oldDate.getMinutes())
        reschedulePost(postId, updatedDate)
      } else {
        // Week/Day view: Id is DateString__Hour
        const [dateStr, hour] = overId.split('__')
        const newDate = new Date(dateStr)
        newDate.setHours(parseInt(hour))
        reschedulePost(postId, newDate)
      }
    }
  }

  const navigateDate = (direction) => {
    const amount = direction === 'next' ? 1 : -1
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, amount))
    if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, amount))
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, amount))
  }

  const calendarDays = useMemo(() => {
    if (viewMode === 'day') return [currentDate]
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate)
      return eachDayOfInterval({ start, end: addDays(start, 6) })
    }
    const start = startOfWeek(startOfMonth(currentDate))
    const end = endOfWeek(endOfMonth(currentDate))
    return eachDayOfInterval({ start, end })
  }, [currentDate, viewMode])

  const menuItems = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'content', label: 'Content', icon: Library },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  ], [])

  // Mobile specific helpers and data
  const platforms = useMemo(() => [
    { id: 'all', name: 'All Platforms', icon: Grid, color: '#6B6B6B' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E1306C' },
    { id: 'tiktok', name: 'TikTok', icon: Tiktok, color: '#000000' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0077B5' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#14171A' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' }
  ], [])

  const mobileCalendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate))
    const end = endOfWeek(endOfMonth(currentDate))
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const weeklyPosts = useMemo(() => {
    const start = startOfWeek(currentDate)
    const end = addDays(start, 7)
    return posts.filter(post => {
      const d = new Date(post.scheduled_at)
      return d >= start && d < end && post.status === 'scheduled'
    })
  }, [posts, currentDate])

  const weeklyPostsCount = weeklyPosts.length

  const monthlyPosts = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return posts.filter(post => {
      const d = new Date(post.scheduled_at)
      return d >= start && d <= end && post.status === 'scheduled'
    })
  }, [posts, currentDate])

  const monthlyPostsCount = monthlyPosts.length

  const upcomingFeedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
  }, [filteredPosts])

  const mockupPosts = useMemo(() => [
    {
      id: 'mock-1',
      title: 'The Future of AI in Social Media',
      platform: 'instagram',
      scheduled_at: new Date().toISOString(),
      caption: 'Exploration of generative AI tools for creators and how they are changing content pipelines...',
      media: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2532&auto=format&fit=crop'
    },
    {
      id: 'mock-2',
      title: 'Dance Trend Re-cut',
      platform: 'tiktok',
      scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      caption: 'Quick cuts and transitions for our trending choreography.',
      media: ''
    },
    {
      id: 'mock-3',
      title: 'Quarterly Update',
      platform: 'linkedin',
      scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      caption: 'A deep dive into our metrics and next quarters major initiatives.',
      media: ''
    }
  ], [])

  const displayFeed = useMemo(() => {
    const combined = [...upcomingFeedPosts]
    mockupPosts.forEach(mock => {
      if (combined.length < 3 && !combined.some(p => p.title === mock.title)) {
        combined.push(mock)
      }
    })
    return combined
  }, [upcomingFeedPosts, mockupPosts])

  const getPlatformMobileBadge = (platformName) => {
    switch (platformName?.toLowerCase()) {
      case 'instagram':
        return {
          bg: '#FFC55215',
          color: '#BE8755',
          icon: Instagram,
          label: 'Instagram Post'
        }
      case 'tiktok':
        return {
          bg: '#00000010',
          color: '#000000',
          icon: Tiktok,
          label: 'TikTok Post'
        }
      case 'linkedin':
        return {
          bg: '#FFC55215',
          color: '#BE8755',
          icon: Linkedin,
          label: 'LinkedIn Post'
        }
      case 'twitter':
      case 'x':
        return {
          bg: '#14171A10',
          color: '#14171A',
          icon: Twitter,
          label: 'Twitter Post'
        }
      default:
        return {
          bg: '#FFC55215',
          color: '#BE8755',
          icon: Grid,
          label: 'Social Post'
        }
    }
  }

  if (isMobile) {
    return (
      <div className="mobile-calendar-workspace">
        {/* 1. Sticky Header */}
        <header className="mobile-header">
          <div className="logo-pill" onClick={() => setIsMobileSidebarOpen(true)}>
             <img src={logo} alt="Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
             <span className="logo-text">planora</span>
          </div>
          <div className="header-avatar" onClick={() => navigate('/profile')}>
            <img src={user.avatar} alt="Profile" />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="mobile-scroll-container">
          
          {/* 2. Month and Create Post Row */}
          <section className="mobile-date-create-row">
            <div className="mobile-date-info">
              <h2 className="font-heading">{format(currentDate, 'MMMM yyyy')}</h2>
              <p>{monthlyPostsCount} posts scheduled this month</p>
            </div>
            <button 
              className="mobile-btn-create" 
              onClick={() => { setEditingPost(null); setIsModalOpen(true); }}
            >
              <Plus size={14} strokeWidth={3} />
              <span>Create Post</span>
            </button>
          </section>

          {/* 3. Platform Filter Dropdown Selector */}
          <section className="mobile-platform-selector-section">
            <div className="platform-dropdown-wrapper">
              <button 
                className="platform-dropdown-trigger"
                onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)}
              >
                <div className="trigger-left">
                  {(() => {
                    const selectedPlat = platforms.find(p => p.id === activePlatformFilter) || platforms[0]
                    const Icon = selectedPlat.icon
                    return (
                      <>
                        <Icon size={16} style={{ color: selectedPlat.color }} />
                        <span className="trigger-label">{selectedPlat.name}</span>
                      </>
                    )
                  })()}
                </div>
                <ChevronDown 
                  size={16} 
                  className={`trigger-arrow ${isPlatformDropdownOpen ? 'open' : ''}`} 
                />
              </button>

              <AnimatePresence>
                {isPlatformDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="platform-dropdown-menu"
                  >
                    {platforms.map(p => {
                      const Icon = p.icon
                      const isSelected = activePlatformFilter === p.id
                      return (
                        <button
                          key={p.id}
                          className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setActivePlatformFilter(p.id)
                            setIsPlatformDropdownOpen(false)
                          }}
                        >
                          <div className="item-left">
                            <Icon size={16} style={{ color: p.color }} />
                            <span>{p.name}</span>
                          </div>
                          {isSelected && <div className="selected-dot" />}
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* 4. Month Calendar Grid */}
          <section className="mobile-calendar-month-card">
            <div className="month-card-nav-row">
              <button 
                type="button"
                className="month-nav-title" 
                onClick={() => setIsMonthYearSelectorOpen(!isMonthYearSelectorOpen)}
              >
                <span>{format(currentDate, 'MMMM yyyy')}</span>
                <ChevronDown size={14} className={`chevron-indicator ${isMonthYearSelectorOpen ? 'rotated' : ''}`} />
              </button>
              <div className="month-nav-arrows">
                <button type="button" className="nav-arrow-btn" onClick={() => setCurrentDate(addMonths(currentDate, -1))}>
                  <ChevronLeft size={16} />
                </button>
                <button type="button" className="nav-arrow-btn" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isMonthYearSelectorOpen && (
                <motion.div 
                  className="month-year-dropdown"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="selector-section">
                    <span className="selector-label">Select Month</span>
                    <div className="months-select-grid">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => {
                        const isCurrent = currentDate.getMonth() === idx
                        return (
                          <button 
                            key={m} 
                            type="button"
                            className={`selector-item-btn ${isCurrent ? 'active' : ''}`}
                            onClick={() => {
                              const newDate = new Date(currentDate)
                              newDate.setMonth(idx)
                              setCurrentDate(newDate)
                              setIsMonthYearSelectorOpen(false)
                            }}
                          >
                            {m}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="selector-section border-top">
                    <span className="selector-label">Select Year</span>
                    <div className="years-select-grid">
                      {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => {
                        const isCurrent = currentDate.getFullYear() === y
                        return (
                          <button 
                            key={y} 
                            type="button"
                            className={`selector-item-btn ${isCurrent ? 'active' : ''}`}
                            onClick={() => {
                              const newDate = new Date(currentDate)
                              newDate.setFullYear(y)
                              setCurrentDate(newDate)
                              setIsMonthYearSelectorOpen(false)
                            }}
                          >
                            {y}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="month-grid-header">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <span key={idx} className="month-day-label">{day}</span>
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentDate.getMonth() + '-' + currentDate.getFullYear()}
                className="month-grid-body"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {mobileCalendarDays.map(day => {
                  const isSel = isSameDay(day, selectedDate)
                  const isTod = isToday(day)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const dayPosts = posts.filter(p => isSameDay(new Date(p.scheduled_at), day))
                  const hasPosts = dayPosts.length > 0
                  
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      className={`mobile-day-btn ${isSel ? 'selected' : ''} ${isTod ? 'today' : ''} ${!isCurrentMonth ? 'outside' : ''}`}
                      onClick={() => { setSelectedDate(day); setCurrentDate(day); }}
                    >
                      <span>{format(day, 'd')}</span>
                      {hasPosts && <span className="day-post-dot" />}
                    </button>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </section>

          {/* 5. Up Next Section */}
          <section className="mobile-up-next-section">
            <div className="up-next-header">
              <h3 className="font-heading">Up Next</h3>
              <button className="btn-view-all" onClick={() => navigate('/content')}>View all</button>
            </div>

            <div className="feed-container">
              {/* Main Card (Big Card) */}
              {displayFeed[0] && (() => {
                const mainPost = displayFeed[0]
                const badge = getPlatformMobileBadge(mainPost.platform)
                const BadgeIcon = badge.icon
                return (
                  <div className="main-post-card" onClick={() => { setEditingPost(mainPost.id.toString().startsWith('mock') ? null : mainPost); setIsModalOpen(true); }}>
                    <div className="main-card-top">
                      <div className="badge-group">
                        <div className="platform-icon-circle" style={{ background: badge.bg }}>
                          <BadgeIcon size={14} style={{ color: badge.color }} />
                        </div>
                        <div className="badge-texts">
                          <span className="badge-label">{badge.label}</span>
                          <span className="badge-time">
                            {isToday(new Date(mainPost.scheduled_at)) 
                              ? `${format(new Date(mainPost.scheduled_at), 'h:mm a')} Today` 
                              : format(new Date(mainPost.scheduled_at), 'EEEE, h:mm a')}
                          </span>
                        </div>
                      </div>
                      <button className="btn-more-options" onClick={(e) => { e.stopPropagation(); if(!mainPost.id.toString().startsWith('mock')) { setEditingPost(mainPost); setIsModalOpen(true); } }}>
                        <MoreHorizontal size={18} />
                      </button>
                    </div>

                    <div className="main-card-body">
                      <h4>{mainPost.title}</h4>
                      <p>{mainPost.caption}</p>
                    </div>

                    {mainPost.media ? (
                      <div className="main-card-image">
                        <img src={mainPost.media} alt="" />
                      </div>
                    ) : (
                      <div className="main-card-image abstract">
                        <div className="abstract-pattern" />
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Side-by-side grid */}
              <div className="side-cards-grid">
                {displayFeed.slice(1, 3).map((post, idx) => {
                  const badge = getPlatformMobileBadge(post.platform)
                  const BadgeIcon = badge.icon
                  return (
                    <div key={post.id || idx} className="side-post-card" onClick={() => { setEditingPost(post.id.toString().startsWith('mock') ? null : post); setIsModalOpen(true); }}>
                      <div className="side-card-top">
                        <div className="platform-icon-circle" style={{ background: badge.bg }}>
                          <BadgeIcon size={14} style={{ color: badge.color }} />
                        </div>
                      </div>
                      <div className="side-card-content">
                        <span className="side-card-time">
                          {isToday(new Date(post.scheduled_at)) 
                            ? `Today, ${format(new Date(post.scheduled_at), 'h:mm a')}` 
                            : format(new Date(post.scheduled_at), 'EEE, h:mm a')}
                        </span>
                        <h4>{post.title}</h4>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

        </div>

        {/* Mobile Menu Overlay Sidebar */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              <motion.div 
                className="mobile-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              <motion.div 
                className="mobile-sidebar"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <div className="sidebar-top-section">
                  <div className="sidebar-header">
                    <div className="sidebar-logo-group">
                      <img src={logo} alt="Planora" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                      <span className="logo-text-large">planora</span>
                    </div>
                    <button className="sidebar-close-btn" onClick={() => setIsMobileSidebarOpen(false)}>
                      <ChevronLeft size={18} />
                    </button>
                  </div>
                  <div className="sidebar-nav">
                    {menuItems.map((item) => (
                      <NavLink
                        key={item.id}
                        to={`/${item.id}`}
                        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                        onClick={() => setIsMobileSidebarOpen(false)}
                      >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>

                <div className="sidebar-bottom-section">
                  {/* Logout Button */}
                  <button 
                    className="sidebar-logout-btn"
                    onClick={async () => {
                      await supabase.auth.signOut()
                      navigate('/login')
                    }}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Existing PostModal */}
        <PostModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          post={editingPost}
          initialDate={selectedDate}
          onSave={(data) => editingPost ? updatePost(editingPost.id, data) : addPost(data)}
        />
        
        {/* Style block for mobile view */}
        <style jsx="true">{`
          .mobile-calendar-workspace {
            display: flex;
            flex-direction: column;
            height: 100vh;
            background: #FAF8F5;
            color: #1A1A1A;
            font-family: 'Outfit', sans-serif;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 9999;
            overflow: hidden;
          }

          .mobile-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            background: #FAF8F5;
            border-bottom: 1px solid rgba(0, 0, 0, 0.03);
            height: 60px;
          }
          .header-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            overflow: hidden;
            border: 1px solid rgba(0, 0, 0, 0.06);
            cursor: pointer;
          }
          .header-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .logo-pill {
            background: #F9F6F1;
            border: 1px solid rgba(0, 0, 0, 0.07);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
            display: flex;
            align-items: center;
            padding: 8px 16px;
            border-radius: 999px;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .logo-pill:active {
            transform: scale(0.97);
            background: #FAF8F5;
          }
          .logo-text {
            font-weight: 700;
            font-size: 16px;
            color: #1A1A1A;
            letter-spacing: -0.02em;
            transform: translateY(-0.5px);
          }
          .header-bell {
            background: transparent;
            border: none;
            color: #1A1A1A;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-scroll-container {
            flex: 1;
            overflow-y: auto;
            padding: 16px 20px 24px 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            -webkit-overflow-scrolling: touch;
          }

          .mobile-date-create-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .mobile-date-info h2 {
            font-size: 22px;
            font-weight: 700;
            margin: 0;
            color: #1A1A1A;
          }
          .mobile-date-info p {
            font-size: 12px;
            color: #6B6B6B;
            margin-top: 2px;
            font-weight: 500;
          }
          .mobile-btn-create {
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--gold-gradient, #BE8755);
            color: #FFFFFF;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 6px 16px rgba(190, 135, 85, 0.25);
          }
          .mobile-btn-create:active {
            transform: scale(0.97);
            box-shadow: 0 2px 8px rgba(190, 135, 85, 0.15);
          }

          .mobile-platform-selector-section {
            display: flex;
            flex-direction: column;
            width: 100%;
            position: relative;
            z-index: 99;
            flex-shrink: 0;
          }
          .platform-dropdown-wrapper {
            position: relative;
            width: 100%;
          }
          .platform-dropdown-trigger {
            width: 100%;
            height: 48px;
            background: #FFFFFF;
            border: 1px solid rgba(0, 0, 0, 0.05);
            border-radius: 16px;
            padding: 0 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.01);
          }
          .platform-dropdown-trigger:active {
            transform: scale(0.99);
            background: #FAF8F5;
          }
          .trigger-left {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .trigger-label {
            font-size: 14px;
            font-weight: 700;
            color: #1A1A1A;
          }
          .trigger-arrow {
            color: #9CA3AF;
            transition: transform 0.2s ease;
          }
          .trigger-arrow.open {
            transform: rotate(180deg);
          }

          .platform-dropdown-menu {
            position: absolute;
            top: calc(100% + 8px);
            left: 0;
            right: 0;
            background: #FFFFFF;
            border: 1px solid rgba(0, 0, 0, 0.06);
            border-radius: 18px;
            padding: 8px;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
            display: flex;
            flex-direction: column;
            gap: 4px;
            z-index: 1000;
          }
          .dropdown-item {
            width: 100%;
            height: 44px;
            border: none;
            background: transparent;
            border-radius: 12px;
            padding: 0 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .dropdown-item:hover, .dropdown-item:active {
            background: #FAF8F5;
          }
          .dropdown-item.selected {
            background: #FFCA6215;
          }
          .item-left {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13.5px;
            font-weight: 700;
            color: #1A1A1A;
          }
          .selected-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #BE8755;
          }

          .mobile-calendar-month-card {
            background: #FFFFFF;
            border: 1px solid rgba(0, 0, 0, 0.04);
            border-radius: 20px;
            padding: 20px 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.015);
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          .month-card-nav-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 4px;
          }
          .month-nav-title {
            background: transparent;
            border: none;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 15px;
            font-weight: 800;
            color: #1A1A1A;
            cursor: pointer;
            padding: 4px 8px;
            margin-left: -8px;
            border-radius: 8px;
            transition: background 0.2s;
          }
          .month-nav-title:active {
            background: rgba(0, 0, 0, 0.03);
          }
          .chevron-indicator {
            color: #9CA3AF;
            transition: transform 0.2s ease;
          }
          .chevron-indicator.rotated {
            transform: rotate(180deg);
          }
          .month-nav-arrows {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .nav-arrow-btn {
            background: #FAF8F5;
            border: none;
            color: #6B7280;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
          }
          .nav-arrow-btn:active {
            background: #FFCA6215;
            color: #BE8755;
            transform: scale(0.95);
          }

          .month-year-dropdown {
            background: #FAF9F6;
            border-radius: 16px;
            padding: 12px;
            margin-bottom: 8px;
            border: 1px solid rgba(0,0,0,0.02);
            overflow: hidden;
          }
          .selector-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 4px 0;
          }
          .selector-section.border-top {
            border-top: 1px solid rgba(0,0,0,0.05);
            margin-top: 8px;
            padding-top: 10px;
          }
          .selector-label {
            font-size: 11px;
            font-weight: 800;
            color: #9CA3AF;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .months-select-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
          }
          .years-select-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
          }
          .selector-item-btn {
            background: #FFFFFF;
            border: 1px solid rgba(0,0,0,0.03);
            color: #4B5563;
            font-size: 12px;
            font-weight: 700;
            height: 32px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.15s;
          }
          .selector-item-btn.active {
            background: #BE8755;
            color: #FFFFFF;
            border-color: #BE8755;
            box-shadow: 0 4px 10px rgba(190, 135, 85, 0.2);
          }
          .selector-item-btn:active:not(.active) {
            background: #FAF8F5;
          }

          .month-grid-header {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            border-bottom: 1px solid rgba(0, 0, 0, 0.03);
            padding-bottom: 10px;
          }
          .month-day-label {
            font-size: 11px;
            font-weight: 800;
            color: #9CA3AF;
            text-transform: uppercase;
          }
          .month-grid-body {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            justify-items: center;
            align-items: center;
            gap: 12px 0;
            width: 100%;
          }
          .mobile-day-btn {
            width: 38px;
            height: 38px;
            border: none;
            background: transparent;
            font-size: 14px;
            font-weight: 700;
            color: #4B5563;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
            transition: all 0.15s;
            border-radius: 50%;
          }
          .mobile-day-btn.outside {
            color: #D1D5DB;
            opacity: 0.4;
          }
          .mobile-day-btn.selected {
            background: #000000;
            color: #FFFFFF !important;
            border-radius: 50%;
          }
          .mobile-day-btn.selected::before {
            content: '';
            position: absolute;
            left: -2px;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 18px;
            background: #BE8755;
            border-radius: 99px;
          }
          .mobile-day-btn.today {
            border: 1.5px solid #BE8755 !important;
          }
          
          .day-post-dot {
            position: absolute;
            bottom: 4px;
            width: 4px;
            height: 4px;
            background: #BE8755;
            border-radius: 50%;
          }
          .mobile-day-btn.selected .day-post-dot {
            background: #FFFFFF;
          }

          .mobile-up-next-section {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .up-next-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .up-next-header h3 {
            font-size: 16px;
            font-weight: 700;
            color: #1A1A1A;
          }
          .btn-view-all {
            background: transparent;
            border: none;
            color: #BE8755;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
          }

          .feed-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .main-post-card {
            background: #FFFFFF;
            border: 1px solid rgba(0, 0, 0, 0.05);
            border-radius: 20px;
            padding: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.015);
            display: flex;
            flex-direction: column;
            gap: 12px;
            cursor: pointer;
          }
          .main-card-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .badge-group {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .platform-icon-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .badge-texts {
            display: flex;
            flex-direction: column;
          }
          .badge-label {
            font-size: 10px;
            font-weight: 800;
            color: #BE8755;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .badge-time {
            font-size: 11px;
            color: #9CA3AF;
            font-weight: 600;
          }
          .btn-more-options {
            background: transparent;
            border: none;
            color: #6B6B6B;
            cursor: pointer;
            padding: 4px;
          }
          .main-card-body h4 {
            font-size: 15px;
            font-weight: 700;
            color: #1A1A1A;
            margin-bottom: 4px;
          }
          .main-card-body p {
            font-size: 12px;
            color: #6B6B6B;
            line-height: 1.5;
          }
          .main-card-image {
            width: 100%;
            height: 160px;
            border-radius: 12px;
            overflow: hidden;
            background: #F9F8F6;
          }
          .main-card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .main-card-image.abstract {
            background: linear-gradient(135deg, #1E1B4B 0%, #311042 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
          }
          .abstract-pattern {
            position: absolute;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            border: 2px solid rgba(0, 242, 254, 0.15);
            background: radial-gradient(circle, rgba(0,242,254,0.08) 0%, transparent 70%);
            animation: rotateAbstract 15s linear infinite;
          }
          @keyframes rotateAbstract {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .side-cards-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .side-post-card {
            background: #FFFFFF;
            border: 1px solid rgba(0, 0, 0, 0.05);
            border-radius: 16px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.01);
          }
          .side-card-top {
            display: flex;
            align-items: center;
          }
          .side-card-content {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .side-card-time {
            font-size: 10px;
            color: #9CA3AF;
            font-weight: 700;
          }
          .side-card-content h4 {
            font-size: 12px;
            font-weight: 700;
            color: #1A1A1A;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .mobile-trends-banner {
            background: #FFCA62;
            border-radius: 20px;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            overflow: hidden;
            position: relative;
            box-shadow: 0 8px 24px rgba(255, 202, 98, 0.2);
          }
          .trends-text-side {
            display: flex;
            flex-direction: column;
            z-index: 2;
          }
          .trends-text-side h3 {
            font-size: 16px;
            font-weight: 700;
            color: #5C3E1F;
            margin: 0 0 4px 0;
          }
          .trends-text-side p {
            font-size: 12px;
            color: #5C3E1F;
            opacity: 0.85;
            font-weight: 600;
            margin: 0 0 14px 0;
          }
          .btn-analyze {
            display: flex;
            align-items: center;
            gap: 4px;
            background: #000000;
            color: #FFFFFF;
            border: none;
            padding: 8px 14px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            align-self: flex-start;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-analyze:active {
            transform: scale(0.97);
          }
          .trends-watermark-side {
            width: 70px;
            height: 70px;
            opacity: 0.2;
            position: absolute;
            right: 10px;
            bottom: 0px;
          }
          .chart-watermark {
            width: 100%;
            height: 100%;
          }

          .mobile-bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0; right: 0;
            height: 75px;
            background: #FFFFFF;
            border-top: 1px solid rgba(0, 0, 0, 0.05);
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 8px 16px;
            z-index: 10000;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.03);
          }
          .bottom-nav-item {
            background: transparent;
            border: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            color: #9CA3AF;
            font-size: 9px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            width: 60px;
          }
          .bottom-nav-item.active {
            color: #000000;
          }
          .icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 28px;
            border-radius: 20px;
            transition: all 0.2s;
          }
          .bottom-nav-item.active .icon-wrapper {
            background: #FFCA62;
            color: #000000;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="professional-workspace">
      {/* 1. Left Sidebar */}
      <CalendarLeftSidebar 
        selectedDate={currentDate} 
        onDateSelect={(d) => setCurrentDate(d)} 
      />

      {/* 2. Main Scheduler */}
      <main className="main-scheduler-panel">
        <header className="scheduler-header">
          <div className="sh-left">
            <div className="date-display">
              <h2>{format(currentDate, 'MMMM d, yyyy')}</h2>
              <p>Plan, schedule and manage your content across all platforms.</p>
            </div>
          </div>

          <div className="sh-right">
            <div className="view-switcher-premium">
              {['day', 'week', 'month', 'agenda'].map(mode => (
                <button 
                  key={mode}
                  className={viewMode === mode ? 'active' : ''}
                  onClick={() => setViewMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
            
            <div className="sh-actions">
              <button className="btn-today" onClick={() => setCurrentDate(new Date())}>Today</button>
              <div className="nav-arrows">
                <button onClick={() => navigateDate('prev')}><ChevronLeft size={18} /></button>
                <button onClick={() => navigateDate('next')}><ChevronRight size={18} /></button>
              </div>
              <button className="btn-gold-scheduler" onClick={() => { setEditingPost(null); setIsModalOpen(true); }}>
                <Plus size={18} />
                <span>Create Post</span>
                <ChevronDown size={14} className="ml-2 opacity-50" />
              </button>
            </div>
          </div>
        </header>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="scheduler-content-area">
            {viewMode === 'month' ? (
              <MonthGrid 
                days={calendarDays} 
                posts={filteredPosts} 
                currentDate={currentDate}
                onCellClick={(d) => { setSelectedDate(d); setEditingPost(null); setIsModalOpen(true); }}
                onEditPost={(p) => { setEditingPost(p); setIsModalOpen(true); }}
                onDeletePost={deletePost}
              />
            ) : (
              <TimeGrid 
                days={calendarDays} 
                posts={filteredPosts}
                onCellClick={(d) => { setSelectedDate(d); setEditingPost(null); setIsModalOpen(true); }}
                onEditPost={(p) => { setEditingPost(p); setIsModalOpen(true); }}
                onDeletePost={deletePost}
              />
            )}
          </div>
        </DndContext>
      </main>

      {/* 3. Right Sidebar */}
      <CalendarRightSidebar onEditPost={(p) => { setEditingPost(p); setIsModalOpen(true); }} />

      <PostModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={editingPost}
        initialDate={selectedDate}
        onSave={(data) => editingPost ? updatePost(editingPost.id, data) : addPost(data)}
      />

      <style jsx="true">{`
        .professional-workspace {
          display: flex;
          height: calc(100vh - var(--navbar-height));
          background: #FDFCFB;
          overflow: hidden;
        }

        @media (max-width: 1100px) {
          .professional-workspace { flex-direction: column; height: auto; min-height: 100vh; overflow-y: auto; }
          .main-scheduler-panel { width: 100%; height: auto; overflow: visible; }
        }

        @media (max-width: 768px) {
          .scheduler-header { padding: 80px 16px 24px; flex-direction: column; gap: 20px; align-items: flex-start; }
          .sh-right { width: 100%; flex-direction: column; gap: 16px; align-items: stretch; }
          .sh-actions { justify-content: space-between; }
          .btn-gold-scheduler { justify-content: center; width: 100%; }
        }

        @media (max-width: 375px) {
          .date-display h2 { font-size: 20px; }
          .mg-day-label { font-size: 9px; padding: 8px 4px; }
          .month-cell { min-height: 80px; padding: 4px; }
          .cell-num { font-size: 11px; margin-bottom: 4px; }
        }

        .main-scheduler-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
          position: relative;
        }

        .scheduler-header {
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .date-display h2 { font-size: 24px; font-weight: 700; color: #1A1A1A; margin-bottom: 4px; }
        .date-display p { font-size: 13px; color: #6B6B6B; font-weight: 500; }

        .sh-right { display: flex; align-items: center; gap: 32px; }

        .view-switcher-premium {
          background: #F9F8F6;
          padding: 4px;
          border-radius: 12px;
          display: flex;
          gap: 4px;
        }
        .view-switcher-premium button {
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
          background: transparent;
          color: #6B6B6B;
          cursor: pointer;
          transition: 0.2s;
        }
        .view-switcher-premium button.active { background: white; color: #1A1A1A; box-shadow: 0 4px 10px rgba(0,0,0,0.04); }

        .sh-actions { display: flex; align-items: center; gap: 16px; }
        .btn-today {
          background: white; border: 1px solid rgba(0,0,0,0.06); padding: 8px 16px; border-radius: 10px;
          font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s;
        }
        .btn-today:hover { background: #FDFCFB; }

        .nav-arrows { display: flex; gap: 4px; }
        .nav-arrows button {
          width: 36px; height: 36px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.06);
          background: white; display: flex; align-items: center; justify-content: center; cursor: pointer;
        }

        .btn-gold-scheduler {
          background: var(--gold-gradient); color: white; border: none; padding: 10px 20px;
          border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 10px;
          cursor: pointer; box-shadow: 0 10px 20px rgba(190, 135, 85, 0.2); transition: 0.2s;
        }
        .btn-gold-scheduler:hover { transform: translateY(-1px); box-shadow: 0 12px 24px rgba(190, 135, 85, 0.3); }

        .scheduler-content-area {
          flex: 1;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

const MonthGrid = ({ days, posts, currentDate, onCellClick, onEditPost, onDeletePost }) => {
  return (
    <div className="month-grid-premium">
      <div className="mg-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="mg-day-label">{d}</div>
        ))}
      </div>
      <div className="mg-body">
        {days.map(day => (
          <MonthCell 
            key={day.toISOString()}
            day={day}
            isCurrentMonth={isSameMonth(day, currentDate)}
            posts={posts.filter(p => isSameDay(new Date(p.scheduled_at), day))}
            onCellClick={onCellClick}
            onEditPost={onEditPost}
            onDeletePost={onDeletePost}
          />
        ))}
      </div>
      <style jsx="true">{`
        .month-grid-premium { display: flex; flex-direction: column; height: 100%; }
        .mg-header { display: grid; grid-template-columns: repeat(7, 1fr); background: #FDFCFB; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .mg-day-label { padding: 12px; text-align: center; font-size: 11px; font-weight: 800; color: #9CA3AF; text-transform: uppercase; }
        .mg-body { display: grid; grid-template-columns: repeat(7, 1fr); flex: 1; overflow-y: auto; }
      `}</style>
    </div>
  )
}

const MonthCell = ({ day, isCurrentMonth, posts, onCellClick, onEditPost, onDeletePost }) => {
  const { isOver, setNodeRef } = useDroppable({ id: day.toISOString() })

  return (
    <div 
      ref={setNodeRef}
      className={`month-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday(day) ? 'today' : ''} ${isOver ? 'drag-over' : ''}`}
      onClick={() => onCellClick(day)}
    >
      <div className="cell-num">{format(day, 'd')}</div>
      <div className="cell-posts">
        {posts.map(p => (
          <CalendarPostCard 
            key={p.id} 
            post={p} 
            onEdit={onEditPost} 
            onDelete={onDeletePost} 
            onClick={(e) => {
              e.stopPropagation()
              onEditPost(p)
            }}
          />
        ))}
      </div>
      <style jsx="true">{`
        .month-cell { min-height: 120px; border-right: 1px solid rgba(0,0,0,0.03); border-bottom: 1px solid rgba(0,0,0,0.03); padding: 8px; transition: 0.2s; }
        .month-cell:hover { background: #FDFCFB; }
        .month-cell.other-month { opacity: 0.4; background: #F9F9F9; }
        .month-cell.today .cell-num { color: var(--accent-gold); font-weight: 800; }
        .month-cell.drag-over { background: var(--accent-gold-glow) !important; }
        .cell-num { font-size: 13px; font-weight: 700; color: #1A1A1A; margin-bottom: 8px; }
        .cell-posts { display: flex; flex-direction: column; gap: 4px; }
      `}</style>
    </div>
  )
}

import { useDroppable } from '@dnd-kit/core'

export default CalendarView
