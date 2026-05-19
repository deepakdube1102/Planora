import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  Target, 
  Share2, 
  Sparkles, 
  Clock, 
  Zap, 
  ArrowUpRight,
  ChevronRight,
  MoreVertical,
  Plus,
  Settings,
  Flame,
  CheckCircle2,
  TrendingUp,
  Layout,
  MessageSquare,
  FileText,
  Copy,
  Check
} from 'lucide-react'
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart, Line
} from 'recharts'
import { Instagram, Twitter, Linkedin, Facebook, Github } from '../components/ui/BrandIcons'
import { useAppStore } from '../store/useAppStore'
import { useNavigate, useLocation } from 'react-router-dom'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const Dashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [showLoginToast, setShowLoginToast] = useState(location.state?.loginSuccess || false)

  useEffect(() => {
    if (showLoginToast) {
      // Clear state so refresh doesn't show it again
      window.history.replaceState({}, document.title)
      const timer = setTimeout(() => setShowLoginToast(false), 2500)
      return () => clearTimeout(timer)
    }
  }, [showLoginToast])
  const { user, posts, campaigns } = useAppStore()

  // Get start of the current week (Monday)
  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 })
  
  // Generate 7 days of the current week
  const currentWeekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i))

  // Hours / Slots we want to display on Dashboard calendar grid
  const dashboardHours = [9, 12, 15, 18] // 9 AM, 12 PM, 3 PM, 6 PM
  
  // Format labels for hour blocks
  const getHourLabel = (hour) => {
    if (hour === 12) return '12 PM'
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`
  }

  // Get posts for a specific day and hour slot
  const getPostsForSlot = (day, hourBlock) => {
    return posts.filter(post => {
      if (post.status !== 'scheduled') return false
      const pDate = new Date(post.scheduled_at)
      if (!isSameDay(pDate, day)) return false
      
      const hour = pDate.getHours()
      if (hourBlock === 9) return hour >= 5 && hour < 12
      if (hourBlock === 12) return hour >= 12 && hour < 15
      if (hourBlock === 15) return hour >= 15 && hour < 18
      if (hourBlock === 18) return hour >= 18 || hour < 5
      return false
    })
  }

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return { className: 'insta', Icon: Instagram }
      case 'twitter':
      case 'x':
        return { className: 'twitter', Icon: Twitter }
      case 'linkedin':
        return { className: 'linkedin', Icon: Linkedin }
      case 'facebook':
        return { className: 'fb', Icon: Facebook }
      default:
        return { className: 'campaign', Icon: Calendar }
    }
  }
  // Mock tasks for now as they weren't in the global store snippet
  const tasks = [
    { id: 1, label: 'Record Weekly Vlog', category: 'Instagram', completed: false },
    { id: 2, label: 'Draft Q2 Strategy', category: 'Campaign', completed: true },
    { id: 3, label: 'Reply to Comments', category: 'Community', completed: false },
  ]
  const toggleTask = () => {}
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const chartData = [
    { name: 'M', value: 40, engagement: 24 },
    { name: 'T', value: 30, engagement: 13 },
    { name: 'W', value: 90, engagement: 48 },
    { name: 'T', value: 40, engagement: 39 },
    { name: 'F', value: 80, engagement: 43 },
    { name: 'S', value: 60, engagement: 25 },
    { name: 'S', value: 70, engagement: 31 },
  ]

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setAiResult("🚀 5 game-changing productivity hacks for creators! Stop trading time for stress. Thread below. #creatorlife #productivity #saas")
      setIsGenerating(false)
    }, 1500)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(aiResult)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="dashboard-wrapper">
      
      <header className="dash-header">
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="welcome-container"
        >
          <h1 className="greeting">{getGreeting()}, <span className="greeting-name">{(user?.name || 'Creator').split(' ')[0]}</span></h1>
        </motion.div>
      </header>

      <div className="stats-row">
        {[
          { 
            label: 'Posts Scheduled', 
            val: posts.filter(p => p.status === 'scheduled').length, 
            change: `+${posts.filter(p => p.status === 'scheduled').length} active`, 
            icon: Calendar, 
            color: '#F59E0B',
            path: '/calendar'
          },
          { 
            label: 'Engagement Rate', 
            val: `${user.engagementScore}%`, 
            change: '+1.3% vs last week', 
            icon: Share2, 
            color: '#F43F5E',
            path: '/analytics'
          },
          { 
            label: 'Audience Growth', 
            val: user.followers, 
            change: '+2.5K this month', 
            icon: Users, 
            color: '#8B5CF6',
            path: '/analytics'
          },
          { 
            label: 'Active Campaigns', 
            val: campaigns.filter(c => c.status === 'active').length, 
            change: `${campaigns.filter(c => c.status === 'active').length} active`, 
            icon: Target, 
            color: '#10B981',
            path: '/campaigns'
          },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            className="stat-card-premium" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(stat.path)}
          >
            <div className="s-top">
              <div className="s-icon" style={{ background: `${stat.color}10`, color: stat.color }}>
                <stat.icon size={20} />
              </div>
              <div className="s-text">
                <span className="s-label">{stat.label}</span>
                <span className="s-val">{stat.val}</span>
                <span className="s-change" style={{ color: stat.change.includes('+') ? '#10B981' : '#F43F5E' }}>{stat.change}</span>
              </div>
            </div>
            <div className="s-chart">
              <ResponsiveContainer width="100%" height={40}>
                <AreaChart data={chartData}>
                  <Area type="monotone" dataKey="value" stroke={stat.color} fill={stat.color} fillOpacity={0.05} strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="main-grid">
        
        {/* Profile Card */}
        <div className="col-profile">
          <div className="profile-card-ident clickable-card" onClick={() => navigate('/profile')}>
            <div className="p-settings" onClick={(e) => { e.stopPropagation(); navigate('/settings'); }}><Settings size={16} /></div>
            <div className="p-info">
              <div className="p-avatar">
                <img src={user.avatar} alt="User" />
              </div>
              <h2>{user.name}</h2>
              <p>{user.role}</p>
            </div>
            <div className="p-stats">
              <div className="ps-item">
                <span className="ps-label">Followers</span>
                <span className="ps-val">{user.followers}</span>
                <span className="ps-sub">+8.2% this month</span>
              </div>
              <div className="ps-item">
                <span className="ps-label">Engagement Score</span>
                <span className="ps-val">{user.engagementScore}</span>
                <span className="ps-sub"><div className="dot-green" /> Excellent</span>
              </div>
            </div>
            <div className="p-streak">
              <div className="streak-head">
                <span>Content Streak</span>
                <span className="streak-badge"><Flame size={14} fill="#F59E0B" color="#F59E0B" /> {user.streak} days</span>
              </div>
              <p>Keep it up! You're on fire.</p>
              <div className="streak-dots">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <div key={idx} className={`s-dot ${idx < 6 ? 'active' : ''}`}>
                    <span>{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="col-performance">
          <div className="perf-card-ident clickable-card" onClick={(e) => { if (e.target.closest('select')) return; navigate('/analytics'); }}>
            <div className="card-top">
              <h3>Content Performance</h3>
              <select className="minimal-select">
                <option>This Week</option>
              </select>
            </div>
            <div className="perf-metrics-row">
              <div className="pm-item">
                <span className="pm-label">Engagement</span>
                <span className="pm-val">18.7K</span>
                <span className="pm-trend pos">↑ 12.5%</span>
              </div>
              <div className="pm-item">
                <span className="pm-label">Impressions</span>
                <span className="pm-val">312K</span>
                <span className="pm-trend pos">↑ 8.1%</span>
              </div>
              <div className="pm-item">
                <span className="pm-label">Profile Visits</span>
                <span className="pm-val">8,214</span>
                <span className="pm-trend pos">↑ 15.3%</span>
              </div>
              <div className="pm-item">
                <span className="pm-label">Link Clicks</span>
                <span className="pm-val">1,250</span>
                <span className="pm-trend pos">↑ 10.2%</span>
              </div>
            </div>
            <div className="perf-chart">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF'}} />
                  <Bar dataKey="value" fill="#FDE68A" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="perf-bottom-split">
              <div className="top-performing-post">
                <span className="split-label">Top Performing Post</span>
                <div className="mini-post">
                  <img src="https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=2574&auto=format&fit=crop" alt="Post" />
                  <div className="mp-info">
                    <span className="mp-tag">Reel</span>
                    <span className="mp-title">5 Productivity Habits That Changed My Life</span>
                    <div className="mp-stats">
                      <span>❤️ 12.1K</span>
                      <span>💬 210</span>
                      <span>📈 6.8%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="best-posting-day">
                <span className="split-label">Best Posting Day</span>
                <h4>Wednesday</h4>
                <p>↑ 28% more engagement</p>
                <div className="mini-bar-chart">
                  {[3, 5, 8, 4, 6].map((h, i) => <div key={i} style={{height: `${h*10}%`, width: '12%', background: i === 2 ? '#BE8755' : '#FDE68A', borderRadius: '4px'}} />)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="col-ai">
          <div className="ai-card-ident clickable-card" onClick={(e) => { if (e.target.closest('button') || e.target.closest('span')) return; navigate('/ai-assistant'); }}>
            <div className="card-top">
              <div className="title-icon"><Sparkles size={18} color="#BE8755" /> <h3>AI Assistant</h3></div>
              <button 
                className={`btn-gold-sm ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? 'Thinking...' : 'Generate'}
              </button>
            </div>
            <div className="ai-group">
              <label>Caption Suggestion</label>
              <div className="ai-box">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="loading-shimmer"
                    >
                      <div className="shimmer-line" />
                      <div className="shimmer-line short" />
                    </motion.div>
                  ) : aiResult ? (
                    <motion.p 
                      key="result"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="ai-result-text"
                    >
                      {aiResult}
                    </motion.p>
                  ) : (
                    <p>Click generate to get AI-powered captions for your next post.</p>
                  )}
                </AnimatePresence>
                {aiResult && !isGenerating && (
                  <div className="ai-box-actions">
                    <button onClick={handleCopy} className="icon-btn-minimal">
                      {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="ai-group">
              <label>Trending Hashtags</label>
              <div className="hashtag-row">
                {['#contentcreator', '#productivity', '#dailyvlog', '#creatorlife'].map(h => <span key={h}>{h}</span>)}
              </div>
            </div>
            <div className="ai-group">
              <label>Best Time to Post</label>
              <div className="time-display">
                <Clock size={16} color="#BE8755" />
                <div>
                  <span className="time-val">11:00 AM – 1:00 PM</span>
                  <span className="time-sub">Today</span>
                </div>
              </div>
            </div>
            <div className="ai-group">
              <label>Content Optimization</label>
              <div className="score-row">
                <div className="score-ring"><span>92</span></div>
                <p>Great job! Your content is <span>highly optimized.</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow (Dark) */}
        <div className="col-workflow">
          <div className="workflow-card-dark clickable-card" onClick={(e) => { if (e.target.closest('.w-item') || e.target.closest('button')) return; navigate('/calendar'); }}>
            <h3>Publishing Workflow</h3>
            <div className="w-list">
              {tasks.map((task, i) => (
                <div 
                  key={task.id} 
                  className={`w-item ${task.completed ? 'completed' : ''}`}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className="w-icon" style={{ 
                    background: task.completed ? '#10B981' : 'rgba(255,255,255,0.1)',
                    opacity: task.completed ? 1 : 0.6
                  }}>
                    {task.completed ? <Check size={16} color="white" /> : <Clock size={16} color="white" />}
                  </div>
                  <div className="w-info">
                    <span className="w-label" style={{ textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.5 : 1 }}>
                      {task.label}
                    </span>
                    <span className="w-sub">{task.category}</span>
                  </div>
                  {task.completed && <CheckCircle2 size={16} color="#10B981" />}
                </div>
              ))}
              <div className="w-item disabled">
                <div className="w-icon" style={{ background: '#3B82F6' }}><Share2 size={16} /></div>
                <div className="w-info">
                  <span className="w-label">Publishing Queue</span>
                  <span className="w-sub">Ready to publish</span>
                </div>
                <span className="w-count">5</span>
              </div>
            </div>
            <button className="btn-dark-outline" onClick={() => navigate('/calendar')}>View All Tasks</button>
          </div>
        </div>

      </div>

      {/* ── Bottom Section Grid ── */}
      <div className="bottom-grid-refined">
        
        {/* Left Side (Accounts + Drafts) */}
        <div className="bot-left">
          <div className="bot-card-premium accounts clickable-card" onClick={(e) => { if (e.target.closest('button')) return; navigate('/settings'); }}>
            <div className="card-top"><h3>Connected Accounts</h3> <button className="txt-btn" onClick={() => navigate('/settings')}>Manage</button></div>
            <div className="acc-list">
              {user.socialAccounts.map((acc, i) => (
                <div key={acc.id} className="acc-item">
                  <div className="acc-brand">
                    {acc.platform === 'Instagram' && <Instagram size={16} />}
                    {acc.platform === 'Twitter' && <Twitter size={16} />}
                    {acc.platform === 'LinkedIn' && <Linkedin size={16} />}
                    <span>{acc.handle}</span>
                  </div>
                  <span className="acc-status">Connected</span>
                </div>
              ))}
            </div>
            <button className="btn-minimal-full" onClick={() => navigate('/settings')}><Plus size={14} /> Connect More</button>
          </div>
          
          <div className="bot-card-premium drafts clickable-card" onClick={(e) => { if (e.target.closest('button')) return; navigate('/content'); }}>
            <div className="card-top"><h3>Recent Drafts</h3> <button className="txt-btn" onClick={() => navigate('/content')}>View all</button></div>
            <div className="draft-list">
              {[
                { title: 'Morning Routine for Productivity', type: 'Reel • Instagram', time: 'Edited 2h ago', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2574&auto=format&fit=crop' },
                { title: '5 Books That Changed My Life', type: 'Carousel • LinkedIn', time: 'Edited 5h ago', img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2574&auto=format&fit=crop' },
              ].map((d, i) => (
                <div key={i} className="draft-row">
                  <div className="draft-img"><img src={d.img} alt="Draft" /></div>
                  <div className="draft-info">
                    <h4>{d.title}</h4>
                    <p>{d.type}</p>
                    <span>{d.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center (Large Calendar) */}
        <div className="bot-center">
          <div className="calendar-card-premium-ident clickable-card" onClick={(e) => { if (e.target.closest('button') || e.target.closest('.cal-post-pill')) return; navigate('/calendar'); }}>
            <div className="cal-top-row">
              <div className="cal-tabs-group">
                <h3>Content Calendar</h3>
                <div className="tabs-pill-small">
                  <button className="active">Week</button>
                  <button>Month</button>
                </div>
              </div>
              <div className="cal-nav-group">
                <button className="nav-btn"><ChevronRight size={16} style={{transform: 'rotate(180deg)'}} /></button>
                <span>Today</span>
                <button className="nav-btn"><ChevronRight size={16} /></button>
              </div>
              <button className="btn-dark-create">Create Post <Plus size={14} /></button>
            </div>
            
            <div className="calendar-grid-ident">
              <div className="grid-head">
                <div className="time-spacer" />
                {currentWeekDays.map((day, i) => (
                  <div key={i} className={`grid-day-label ${isSameDay(day, new Date()) ? 'active' : ''}`}>
                    {format(day, 'eee d')}
                  </div>
                ))}
              </div>
              <div className="grid-body">
                {dashboardHours.map(hour => (
                  <div key={hour} className="grid-row">
                    <div className="time-label">{getHourLabel(hour)}</div>
                    {currentWeekDays.map((day, idx) => {
                      const slotPosts = getPostsForSlot(day, hour)
                      return (
                        <div key={idx} className="grid-cell" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px', overflowY: 'auto' }}>
                          {slotPosts.map(post => {
                            const { className, Icon } = getPlatformIcon(post.platform)
                            const timeStr = format(new Date(post.scheduled_at), 'h:mm a')
                            return (
                              <div 
                                key={post.id} 
                                className={`cal-post-pill ${className}`}
                                onClick={() => navigate('/calendar')}
                                title={`${post.title} at ${timeStr}`}
                                style={{ cursor: 'pointer' }}
                              >
                                <Icon size={10} /> 
                                <div>
                                  <span>{post.title}</span> 
                                  <small>{timeStr}</small>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="cal-legend">
              {['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Campaign'].map((l, i) => (
                <div key={i} className="l-item"><div className="l-dot" style={{background: ['#E1306C', '#000', '#FF0000', '#0077B5', '#F59E0B'][i]}} /> {l}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right (Quick Analytics) */}
        <div className="bot-right">
          <div className="bot-card-premium q-analytics">
            <div className="card-top"><h3>Quick Analytics</h3> <select className="minimal-select-sm"><option>This Month</option></select></div>
            <div className="a-list">
              {[
                { label: 'Total Reach', val: '312K', growth: '+18.2%', color: '#BE8755' },
                { label: 'Impressions', val: '1.2M', growth: '+15.7%', color: '#10B981' },
                { label: 'Engagement', val: '98.7K', growth: '+20.4%', color: '#8B5CF6' },
                { label: 'Profile Visits', val: '24.5K', growth: '+12.1%', color: '#F43F5E' },
              ].map((a, i) => (
                <div key={i} className="a-row">
                  <div className="a-info">
                    <span className="a-label">{a.label}</span>
                    <div className="a-val-grp"><span className="a-val">{a.val}</span> <span className="a-growth">↑ {a.growth}</span></div>
                  </div>
                  <div className="a-mini-chart">
                    <ResponsiveContainer width="100%" height={30}>
                      <LineChart data={chartData}>
                        <Line type="monotone" dataKey="value" stroke={a.color} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-outline-full" onClick={() => navigate('/analytics')}>View Full Analytics <ArrowUpRight size={14} /></button>
          </div>
        </div>

      </div>

      <style jsx="true">{`
        .dashboard-wrapper {
          padding: 32px 64px;
          max-width: 1440px;
          margin: 0 auto;
          color: #1A1A1A;
        }
        /* ... keeping all existing styles intact ... */

        .welcome-container {
          margin-bottom: 28px;
        }
        .greeting { 
          font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
          font-size: 36px; 
          font-weight: 800; 
          margin-bottom: 6px; 
          letter-spacing: -0.03em; 
          color: #1A1A1A;
          line-height: 1.15;
        }
        .greeting-name {
          background: var(--gold-gradient, linear-gradient(135deg, #BE8755 0%, #D4A373 100%));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
          display: inline-block;
        }
        .sub-greeting { 
          color: #7A7A7A; 
          font-size: 15px; 
          font-weight: 500;
          letter-spacing: -0.01em;
          line-height: 1.5;
        }

        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 32px; }
        .stat-card-premium { 
          background: white; 
          border: 1px solid rgba(0,0,0,0.06); 
          border-radius: 28px; 
          padding: 24px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.01); 
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
          cursor: pointer; 
          min-width: 0;
          overflow: hidden;
        }
        .s-chart {
          width: 100%;
          min-width: 0;
          overflow: hidden;
        }
        .stat-card-premium:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 12px 32px rgba(0,0,0,0.05); 
          border-color: rgba(190, 135, 85, 0.2); 
        }
        .stat-card-premium:active {
          transform: translateY(-2px) scale(0.98);
        }
        .clickable-card {
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .clickable-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 36px rgba(0,0,0,0.06) !important;
          border-color: rgba(190, 135, 85, 0.2) !important;
        }
        .clickable-card:active {
          transform: translateY(-2px) scale(0.99) !important;
        }
        .s-top { display: flex; gap: 16px; margin-bottom: 20px; }
        .s-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .s-label { font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; display: block; margin-bottom: 6px; }
        .s-val { font-size: 24px; font-weight: 700; display: block; }
        .s-change { font-size: 11px; font-weight: 600; margin-top: 4px; display: block; }

        .main-grid { display: grid; grid-template-columns: 280px 1.6fr 300px 320px; gap: 24px; margin-bottom: 32px; }
        .profile-card-ident, .perf-card-ident, .ai-card-ident, .workflow-card-dark { 
          background: white; border: 1px solid rgba(0,0,0,0.06); border-radius: 28px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.02); height: 100%; position: relative;
        }

        .p-settings { display: flex; justify-content: flex-end; color: #9CA3AF; margin-bottom: 0; position: absolute; top: 24px; right: 24px; cursor: pointer; transition: color 0.2s; }
        .p-settings:hover { color: #BE8755; }
        .p-info { text-align: center; margin-bottom: 24px; }
        .p-avatar { width: 96px; height: 96px; border-radius: 50%; overflow: hidden; margin: 0 auto 16px; border: 4px solid white; box-shadow: 0 8px 20px rgba(0,0,0,0.08); transition: transform 0.3s; }
        .p-avatar:hover { transform: scale(1.05); }
        .p-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .p-info h2 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
        .p-info p { font-size: 12px; color: #6B6B6B; }
        .p-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.04); margin-bottom: 24px; }
        .ps-label { font-size: 10px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; display: block; }
        .ps-val { font-size: 16px; font-weight: 700; display: block; margin: 4px 0; }
        .ps-sub { font-size: 10px; color: #10B981; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 4px; }
        .dot-green { width: 6px; height: 6px; background: #10B981; border-radius: 50%; }
        .p-streak { background: #F9F8F6; border-radius: 20px; padding: 16px; text-align: left; }
        .streak-head { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 4px; }
        .streak-badge { color: #BE8755; display: flex; align-items: center; gap: 4px; }
        .p-streak p { font-size: 11px; color: #6B6B6B; margin-bottom: 12px; }
        .streak-dots { display: flex; gap: 6px; justify-content: space-between; }
        .s-dot { width: 28px; height: 28px; border-radius: 50%; background: white; border: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #9CA3AF; }
        .s-dot.active { background: #BE8755; color: white; border-color: #BE8755; }

        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .card-top h3 { font-size: 18px; font-weight: 700; }
        .perf-metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .pm-label { font-size: 11px; color: #6B6B6B; display: block; margin-bottom: 4px; }
        .pm-val { font-size: 17px; font-weight: 700; }
        .pm-trend { font-size: 11px; font-weight: 600; margin-top: 4px; display: block; }
        .pm-trend.pos { color: #10B981; }
        .perf-bottom-split { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; margin-top: 24px; }
        .split-label { font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; display: block; margin-bottom: 12px; }
        .mini-post { display: flex; gap: 12px; background: #FDFCFB; border: 1px solid rgba(0,0,0,0.04); padding: 10px; border-radius: 16px; align-items: center; cursor: pointer; transition: 0.2s; }
        .mini-post:hover { border-color: var(--accent-gold); }
        .mini-post img { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; }
        .mp-tag { font-size: 10px; font-weight: 700; color: #EC4899; text-transform: uppercase; }
        .mp-title { font-size: 12px; font-weight: 600; display: block; line-height: 1.3; }
        .mp-stats { font-size: 10px; color: #6B6B6B; display: flex; gap: 8px; margin-top: 4px; font-weight: 600; }
        .best-posting-day h4 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
        .best-posting-day p { font-size: 11px; color: #10B981; font-weight: 600; margin-bottom: 12px; }
        .mini-bar-chart { display: flex; gap: 4px; height: 32px; align-items: flex-end; }

        .title-icon { display: flex; align-items: center; gap: 10px; }
        .btn-gold-sm { background: #FDE68A; border: none; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-gold-sm:hover { background: #fcd34d; transform: scale(1.05); }
        .ai-group { margin-bottom: 20px; }
        .ai-group label { font-size: 12px; font-weight: 700; display: block; margin-bottom: 10px; }
        .ai-box { background: #F9F8F6; padding: 16px; border-radius: 14px; position: relative; min-height: 80px; display: flex; align-items: center; }
        .ai-result-text { font-size: 12.5px; color: #1A1A1A; line-height: 1.5; font-weight: 500; }
        .ai-box p { font-size: 12.5px; color: #6B6B6B; line-height: 1.5; padding-right: 20px; }
        .ai-box-actions { position: absolute; top: 12px; right: 12px; }
        .icon-btn-minimal { background: transparent; border: none; color: #9CA3AF; cursor: pointer; padding: 4px; transition: color 0.2s; }
        .icon-btn-minimal:hover { color: #BE8755; }
        
        .loading-shimmer { width: 100%; display: flex; flex-direction: column; gap: 8px; }
        .shimmer-line { height: 10px; background: rgba(0,0,0,0.05); border-radius: 4px; width: 100%; position: relative; overflow: hidden; }
        .shimmer-line.short { width: 60%; }
        .shimmer-line::after { content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

        .hashtag-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .hashtag-row span { background: white; border: 1px solid rgba(0,0,0,0.06); padding: 4px 8px; border-radius: 8px; font-size: 10px; color: #6B6B6B; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .hashtag-row span:hover { border-color: #BE8755; color: #BE8755; }
        .time-display { display: flex; align-items: center; gap: 12px; background: white; border: 1px solid rgba(0,0,0,0.06); padding: 10px 14px; border-radius: 14px; }
        .time-val { font-size: 13px; font-weight: 700; display: block; }
        .time-sub { font-size: 10px; color: #9CA3AF; }
        .score-row { display: flex; align-items: center; gap: 12px; }
        .score-ring { width: 44px; height: 44px; border-radius: 50%; border: 3px solid #10B981; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: #10B981; }
        .score-row p { font-size: 11.5px; color: #6B6B6B; flex: 1; }
        .score-row p span { color: #10B981; font-weight: 700; }

        .workflow-card-dark { background: #1A1A1A; color: white; }
        .w-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .w-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 16px; background: rgba(255,255,255,0.04); cursor: pointer; transition: 0.2s; position: relative; }
        .w-item:hover:not(.disabled) { background: rgba(255,255,255,0.07); transform: translateX(4px); }
        .w-item.completed { opacity: 0.8; }
        .w-item.disabled { cursor: default; }
        .w-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.3s; }
        .w-info { flex: 1; }
        .w-label { font-size: 13px; font-weight: 600; display: block; margin-bottom: 2px; }
        .w-sub { font-size: 10px; color: rgba(255,255,255,0.4); }
        .w-count { font-size: 16px; font-weight: 700; }
        .btn-dark-outline { width: 100%; padding: 12px; border-radius: 14px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.08); color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .btn-dark-outline:hover { background: rgba(255,255,255,0.12); }

        .bottom-grid-refined { display: grid; grid-template-columns: 300px 1fr 300px; gap: 24px; }
        .bot-card-premium { background: white; border: 1px solid rgba(0,0,0,0.06); border-radius: 28px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.01); margin-bottom: 24px; }
        .bot-card-premium h3 { font-size: 16px; font-weight: 700; }
        .txt-btn { background: transparent; border: none; color: #BE8755; font-size: 12px; font-weight: 600; cursor: pointer; }
        .acc-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
        .acc-item { display: flex; justify-content: space-between; align-items: center; }
        .acc-brand { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; }
        .acc-status { font-size: 10px; font-weight: 700; color: #10B981; }
        .btn-minimal-full { width: 100%; padding: 10px; background: #F9F8F6; border: none; border-radius: 12px; font-size: 12px; font-weight: 600; display: flex; justify-content: center; gap: 6px; cursor: pointer; transition: 0.2s; }
        .btn-minimal-full:hover { background: #f0f0f0; }

        .draft-list { display: flex; flex-direction: column; gap: 16px; }
        .draft-row { display: flex; gap: 14px; align-items: center; cursor: pointer; transition: transform 0.2s; }
        .draft-row:hover { transform: translateX(4px); }
        .draft-img { width: 52px; height: 52px; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
        .draft-img img { width: 100%; height: 100%; object-fit: cover; }
        .draft-info h4 { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
        .draft-info p { font-size: 11px; color: #9CA3AF; margin-bottom: 2px; }
        .draft-info span { font-size: 10px; color: #BE8755; font-weight: 600; }

        .calendar-card-premium-ident { background: white; border: 1px solid rgba(0,0,0,0.06); border-radius: 28px; padding: 24px; height: 100%; min-height: 540px; }
        .cal-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .cal-tabs-group { display: flex; align-items: center; gap: 24px; }
        .tabs-pill-small { background: #F9F8F6; padding: 4px; border-radius: 10px; display: flex; gap: 4px; }
        .tabs-pill-small button { border: none; padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 600; color: #6B6B6B; background: transparent; cursor: pointer; }
        .tabs-pill-small button.active { background: white; color: #1A1A1A; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .cal-nav-group { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 14px; }
        .nav-btn { width: 32px; height: 32px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; background: white; cursor: pointer; transition: background 0.2s; }
        .nav-btn:hover { background: #f0f0f0; }
        .btn-dark-create { background: #1A1A1A; color: white; border: none; padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: background 0.2s; }
        .btn-dark-create:hover { background: #2a2a2a; }

        .calendar-grid-ident { border: 1px solid rgba(0,0,0,0.04); border-radius: 20px; overflow: hidden; background: white; }
        .grid-head { display: grid; grid-template-columns: 80px repeat(7, 1fr); border-bottom: 1px solid rgba(0,0,0,0.04); }
        .time-spacer { border-right: 1px solid rgba(0,0,0,0.04); }
        .grid-day-label { padding: 12px; text-align: center; font-size: 11px; font-weight: 700; color: #9CA3AF; border-right: 1px solid rgba(0,0,0,0.04); }
        .grid-day-label.active { color: #BE8755; background: #FFFBF7; }
        .grid-row { display: grid; grid-template-columns: 80px repeat(7, 1fr); border-bottom: 1px solid rgba(0,0,0,0.02); height: 110px; }
        .time-label { padding: 12px; font-size: 10px; font-weight: 700; color: #9CA3AF; text-align: right; border-right: 1px solid rgba(0,0,0,0.04); }
        .grid-cell { border-right: 1px solid rgba(0,0,0,0.02); padding: 8px; }
        .cal-post-pill { background: #F9F8F6; border-radius: 10px; padding: 8px; display: flex; gap: 8px; align-items: center; cursor: pointer; transition: 0.2s; border-left: 3px solid transparent; }
        .cal-post-pill:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .cal-post-pill.insta { border-color: #E1306C; }
        .cal-post-pill.fb { border-color: #1877F2; }
        .cal-post-pill.linkedin { border-color: #0077B5; }
        .cal-post-pill span { font-size: 10px; font-weight: 700; display: block; line-height: 1.2; }
        .cal-post-pill small { font-size: 9px; color: #9CA3AF; }
        .cal-legend { display: flex; justify-content: center; gap: 20px; margin-top: 24px; }
        .l-item { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; color: #6B6B6B; }
        .l-dot { width: 6px; height: 6px; border-radius: 50%; }

        .a-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .a-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; gap: 8px; }
        .a-info { flex: 1; min-width: 0; }
        .a-label { font-size: 11px; color: #9CA3AF; font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .a-val-grp { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
        .a-val { font-size: 18px; font-weight: 700; }
        .a-growth { font-size: 11px; font-weight: 700; color: #10B981; }
        .a-mini-chart { width: 80px; flex-shrink: 0; }
        .btn-outline-full { width: 100%; padding: 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.06); background: transparent; color: #1A1A1A; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; justify-content: center; gap: 8px; transition: background 0.2s; }
        .btn-outline-full:hover { background: #f9f9f9; }

        @media (max-width: 1400px) {
          .main-grid { grid-template-columns: 1fr 1fr; }
          .bottom-grid-refined { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 1100px) {
          .dashboard-wrapper { padding: 24px; }
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .main-grid { grid-template-columns: 1fr; }
          .bottom-grid-refined { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .dashboard-wrapper { padding: 0px 16px 32px; }
          .welcome-container { margin-bottom: 20px; }
          .greeting { font-size: 28px; display: block; letter-spacing: -0.03em; line-height: 1.2; margin-bottom: 4px; }
          .sub-greeting { font-size: 13.5px; line-height: 1.45; color: #7A7A7A; }
          .stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .stat-card-premium { padding: 16px 12px; min-width: 0; }
          .s-top { margin-bottom: 12px; gap: 12px; }
          .s-icon { width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; }
          .s-val { font-size: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .s-label { font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .s-change { font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .perf-metrics-row { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
          .pm-label { font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .pm-val { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .pm-trend { font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .cal-top-row { flex-direction: column; gap: 16px; align-items: flex-start; }
          .cal-tabs-group { width: 100%; justify-content: space-between; }
          .cal-nav-group { width: 100%; justify-content: center; }
          .btn-dark-create { width: 100%; justify-content: center; }
          .perf-bottom-split { grid-template-columns: 1fr; }
        }

        @media (max-width: 375px) {
          .greeting { font-size: 22px; }
          .stat-card-premium { padding: 12px; }
          .s-val { font-size: 16px; }
          .grid-day-label { font-size: 8px; padding: 6px 2px; }
          .time-label { width: 50px; font-size: 8px; padding: 12px 6px; }
          .grid-head, .grid-row { grid-template-columns: 50px repeat(7, minmax(0, 1fr)); }
        }
      `}</style>

      {/* Floating Login Success Toast */}
      <AnimatePresence>
        {showLoginToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(20, 20, 24, 0.95)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '16px',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(212, 175, 55, 0.1)',
              backdropFilter: 'blur(20px)',
              zIndex: 9999,
            }}
          >
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'rgba(74, 222, 128, 0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <CheckCircle2 size={14} color="#4ade80" />
            </div>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
              Successfully logged in!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
