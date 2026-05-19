import React from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronRight, 
  ArrowUpRight, 
  TrendingUp, 
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react'
import { format, isSameDay, isTomorrow } from 'date-fns'
import { useAppStore } from '../../store/useAppStore'
import { Instagram, Twitter, Linkedin, Tiktok, Youtube } from '../ui/BrandIcons'

const CalendarRightSidebar = ({ onEditPost }) => {
  const { posts } = useAppStore()

  const platformIcons = {
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    tiktok: Tiktok,
    youtube: Youtube
  }

  // Get next 4 scheduled posts
  const upcomingPosts = posts
    .filter(p => new Date(p.scheduled_at) > new Date() && p.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .slice(0, 4)

  const summary = {
    total: posts.length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    drafts: posts.filter(p => p.status === 'draft').length,
    pending: posts.filter(p => p.status === 'pending').length || 2
  }

  const bestTimes = [
    { day: 'Tuesday', time: '10:00 AM - 12:00 PM', level: 'High', color: '#10B981' },
    { day: 'Wednesday', time: '1:00 PM - 3:00 PM', level: 'High', color: '#10B981' },
    { day: 'Friday', time: '11:00 AM - 1:00 PM', level: 'Medium', color: '#F59E0B' },
  ]

  return (
    <aside className="calendar-right-sidebar">
      {/* 1. Up Next */}
      <section className="sidebar-section">
        <div className="section-title-row">
          <h3 className="section-title">Up Next</h3>
          <button className="text-btn">View all</button>
        </div>
        <div className="upcoming-list">
          {upcomingPosts.map(post => {
            const Icon = platformIcons[post.platform] || Instagram
            const postDate = new Date(post.scheduled_at)
            const timeStr = format(postDate, 'h:mm a')
            const displayTime = isSameDay(postDate, new Date())
              ? `Today, ${timeStr}`
              : isTomorrow(postDate)
              ? `Tomorrow, ${timeStr}`
              : format(postDate, 'MMM d, h:mm a')

            return (
              <div key={post.id} className="upcoming-card" onClick={() => onEditPost(post)}>
                <div className="u-card-left">
                  <div className="u-avatar">
                     {post.media ? <img src={post.media} alt="" /> : <Icon size={14} color="#666" />}
                  </div>
                  <div className="u-info">
                    <p className="u-time">{displayTime}</p>
                    <p className="u-title">{post.title}</p>
                  </div>
                </div>
                <div className="u-badge">Scheduled</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 2. Calendar Summary */}
      <section className="sidebar-section">
        <div className="section-title-row">
          <h3 className="section-title">Calendar Summary</h3>
          <select className="minimal-select-sm">
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="s-val">{summary.total}</span>
            <span className="s-label">Total Posts</span>
          </div>
          <div className="summary-item">
            <span className="s-val">{summary.scheduled}</span>
            <span className="s-label">Scheduled</span>
          </div>
          <div className="summary-item">
            <span className="s-val">{summary.drafts}</span>
            <span className="s-label">Drafts</span>
          </div>
          <div className="summary-item">
            <span className="s-val">{summary.pending}</span>
            <span className="s-label">Pending</span>
          </div>
        </div>
      </section>

      {/* 3. Best Posting Times */}
      <section className="sidebar-section">
        <div className="section-title-row">
          <h3 className="section-title">Best Posting Times</h3>
          <select className="minimal-select-sm">
            <option>This Week</option>
          </select>
        </div>
        <div className="best-times-list">
          {bestTimes.map((bt, i) => (
            <div key={i} className="best-time-row">
              <div className="bt-info">
                <p className="bt-day">{bt.day}</p>
                <p className="bt-time">{bt.time}</p>
              </div>
              <div className="bt-level" style={{ color: bt.color, background: `${bt.color}10` }}>
                {bt.level}
              </div>
            </div>
          ))}
          <button className="btn-analytics-wide">
            <span>View Analytics</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </section>

      <style jsx="true">{`
        .calendar-right-sidebar {
          width: 320px;
          border-left: 1px solid rgba(0,0,0,0.04);
          padding: clamp(16px, 4.5vh, 40px) 24px;
          display: flex;
          flex-direction: column;
          gap: 36px;
          background: #FAF8F5;
          overflow-y: auto;
        }

        .sidebar-section h3.section-title {
          font-size: 14px;
          font-weight: 700;
          color: #1A1A1A;
          letter-spacing: -0.01em;
        }

        .section-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .text-btn { background: none; border: none; font-size: 12px; font-weight: 600; color: #BE8755; cursor: pointer; }

        .upcoming-list { display: flex; flex-direction: column; gap: 12px; }
        .upcoming-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px 12px 12px;
          background: #FFFFFF;
          border: 1px solid rgba(0,0,0,0.04);
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .upcoming-card:hover { 
          background: #FAF8F5;
          border-color: rgba(0, 0, 0, 0.08);
          transform: translateY(-2px); 
          box-shadow: 0 4px 12px rgba(0,0,0,0.03); 
        }

        .u-card-left { display: flex; align-items: center; gap: 12px; }
        .u-avatar {
          width: 36px; height: 36px; border-radius: 10px; background: #FAF8F5;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.03);
        }
        .u-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .u-info { }
        .u-time { font-size: 10px; font-weight: 600; color: #9CA3AF; margin-bottom: 2px; }
        .u-title { font-size: 12px; font-weight: 700; color: #1A1A1A; }

        .u-badge {
          font-size: 9px; font-weight: 700; color: #10B981;
          background: rgba(16, 185, 129, 0.1); padding: 4px 8px; border-radius: 6px;
        }

        .summary-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
        }
        .summary-item {
          background: #FFFFFF; padding: 16px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.04);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
          text-align: center;
        }
        .s-val { display: block; font-size: 18px; font-weight: 800; color: #1A1A1A; margin-bottom: 4px; }
        .s-label { font-size: 10px; font-weight: 600; color: #9CA3AF; text-transform: uppercase; }

        .best-times-list { display: flex; flex-direction: column; gap: 12px; }
        .best-time-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 16px 12px 12px; 
          background: #FFFFFF; 
          border-radius: 16px; 
          border: 1px solid rgba(0,0,0,0.04);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
        }
        .bt-day { font-size: 11px; font-weight: 700; color: #1A1A1A; margin-bottom: 2px; }
        .bt-time { font-size: 10px; color: #9CA3AF; font-weight: 600; }
        .bt-level { font-size: 9px; font-weight: 700; padding: 4px 8px; border-radius: 6px; }

        .btn-analytics-wide {
          width: 100%; 
          padding: 14px; 
          border-radius: 16px; 
          border: 1px solid rgba(190, 135, 85, 0.25);
          background: #FFFFFF; 
          color: #BE8755; 
          font-weight: 700; 
          font-size: 13px;
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 8px; 
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
          margin-top: 8px;
        }
        .btn-analytics-wide:hover { 
          background: #FFF7EE; 
          border-color: #BE8755; 
          transform: translateY(-1px);
        }

        .minimal-select-sm {
          background: transparent; border: none; font-size: 11px; font-weight: 700; color: #BE8755; cursor: pointer; outline: none;
        }
      `}</style>
    </aside>
  )
}

export default CalendarRightSidebar
