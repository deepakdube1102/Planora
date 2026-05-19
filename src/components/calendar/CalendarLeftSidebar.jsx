import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Grid, 
  Check, 
  Circle,
  MoreVertical
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns'
import { Instagram, Twitter, Linkedin, Facebook, Youtube, Tiktok } from '../ui/BrandIcons'
import { useAppStore } from '../../store/useAppStore'

const CalendarLeftSidebar = ({ onDateSelect, selectedDate, onViewAllCampaigns }) => {
  const { 
    activePlatformFilter, 
    setActivePlatformFilter, 
    campaigns, 
    activeCampaignFilter, 
    setActiveCampaignFilter 
  } = useAppStore()

  const [currentMiniMonth, setCurrentMiniMonth] = useState(new Date())

  const platforms = [
    { id: 'all', name: 'All Platforms', icon: Grid, color: '#6B6B6B' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E1306C' },
    { id: 'tiktok', name: 'TikTok', icon: Tiktok, color: '#000000' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0077B5' },
    { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: '#14171A' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
  ]

  const miniCalendarDays = eachDayOfInterval({
    start: startOfMonth(currentMiniMonth),
    end: endOfMonth(currentMiniMonth)
  })

  return (
    <aside className="calendar-left-sidebar">
      {/* 1. Mini Calendar */}
      <section className="sidebar-section">
        <div className="section-header-nav">
          <button onClick={() => setCurrentMiniMonth(subMonths(currentMiniMonth, 1))}><ChevronLeft size={16} /></button>
          <h3>{format(currentMiniMonth, 'MMMM yyyy')}</h3>
          <button onClick={() => setCurrentMiniMonth(addMonths(currentMiniMonth, 1))}><ChevronRight size={16} /></button>
        </div>
        <div className="mini-calendar-grid">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="mini-day-label">{d}</div>
          ))}
          {/* Fillers for alignment if needed, but let's keep it simple for now */}
          {miniCalendarDays.map(day => (
            <button 
              key={day.toISOString()}
              className={`mini-day-btn ${isToday(day) ? 'today' : ''} ${isSameDay(day, selectedDate) ? 'selected' : ''}`}
              onClick={() => onDateSelect(day)}
            >
              {format(day, 'd')}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Platform Filters */}
      <section className="sidebar-section">
        <h3 className="section-title">Filter by Platform</h3>
        <div className="filter-list">
          {platforms.map(p => (
            <button 
              key={p.id}
              className={`filter-item ${activePlatformFilter === p.id ? 'active' : ''}`}
              onClick={() => setActivePlatformFilter(p.id)}
            >
              <div className="filter-info">
                <p.icon size={16} style={{ color: p.color }} />
                <span>{p.name}</span>
              </div>
              <div className={`check-indicator ${activePlatformFilter === p.id ? 'checked' : ''}`}>
                <Check size={10} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Campaigns Panel */}
      <section className="sidebar-section">
        <div className="section-title-row">
          <h3 className="section-title">My Campaigns</h3>
          <button className="text-btn" onClick={onViewAllCampaigns}>View all</button>
        </div>
        <div className="campaign-list">
          {campaigns.map(c => (
            <button 
              key={c.id} 
              className={`campaign-card-mini ${activeCampaignFilter === c.id ? 'active' : ''}`}
              onClick={() => setActiveCampaignFilter(activeCampaignFilter === c.id ? 'all' : c.id)}
            >
              <div className="campaign-dot" style={{ backgroundColor: c.color }} />
              <div className="campaign-info">
                <p className="c-name">{c.title}</p>
                <span className="c-count">{c.postsCount} Posts</span>
              </div>
            </button>
          ))}
          <button className="btn-add-campaign">
            <Plus size={14} />
            <span>New Campaign</span>
          </button>
        </div>
      </section>

      <style jsx="true">{`
        .calendar-left-sidebar {
          width: 300px;
          border-right: 1px solid rgba(0,0,0,0.04);
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
          margin-bottom: 16px;
          letter-spacing: -0.01em;
        }

        .section-header-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .section-header-nav h3 { font-size: 14px; font-weight: 700; color: #1A1A1A; }
        .section-header-nav button { 
          background: none; border: none; cursor: pointer; color: #666; 
          width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .section-header-nav button:hover { background: rgba(0,0,0,0.04); }

        .mini-calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 16px;
          padding: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
        }

        .mini-day-label {
          font-size: 10px;
          font-weight: 700;
          color: #9CA3AF;
          text-align: center;
          padding-bottom: 8px;
        }

        .mini-day-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #4B5563;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }

        .mini-day-btn:hover { background: #FAF8F5; }
        .mini-day-btn.today { color: #BE8755; font-weight: 800; border: 1px solid rgba(190, 135, 85, 0.2); }
        .mini-day-btn.selected { 
          background: var(--gold-gradient, linear-gradient(135deg, #DFB574, #BE8755)); 
          color: white !important; 
          box-shadow: 0 4px 10px rgba(190, 135, 85, 0.3);
        }

        .filter-list { display: flex; flex-direction: column; gap: 10px; }
        .filter-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px 12px 12px;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-left: 4px solid transparent;
          background: #FFFFFF;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .filter-item:hover { 
          background: #FAF8F5; 
          border-color: rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }
        .filter-item.active { 
          border: 1px solid rgba(190, 135, 85, 0.15); 
          border-left: 4px solid #BE8755;
          background: #FFF7EE;
          box-shadow: 0 4px 12px rgba(190, 135, 85, 0.04);
        }

        .filter-info { display: flex; align-items: center; gap: 12px; }
        .filter-info span { font-size: 13px; font-weight: 600; color: #1A1A1A; }

        .check-indicator {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #E5E7EB;
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
          transition: 0.2s;
        }
        .check-indicator.checked {
          background: #BE8755;
          border-color: #BE8755;
          color: white;
        }

        .section-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .text-btn { background: none; border: none; font-size: 12px; font-weight: 600; color: #BE8755; cursor: pointer; }

        .campaign-list { display: flex; flex-direction: column; gap: 10px; }
        .campaign-card-mini {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px 12px 12px;
          background: #FFFFFF;
          border: 1px solid rgba(0,0,0,0.04);
          border-left: 4px solid transparent;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
          cursor: pointer;
          text-align: left;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
        }
        .campaign-card-mini:hover { 
          background: #FAF8F5; 
          border-color: rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }
        .campaign-card-mini.active { 
          border: 1px solid rgba(190, 135, 85, 0.15); 
          border-left: 4px solid #BE8755;
          background: #FFF7EE;
          box-shadow: 0 4px 12px rgba(190, 135, 85, 0.04);
        }

        .campaign-dot { width: 8px; height: 8px; border-radius: 50%; }
        .c-name { font-size: 13px; font-weight: 700; color: #1A1A1A; margin-bottom: 2px; }
        .c-count { font-size: 11px; color: #9CA3AF; font-weight: 600; }

        .btn-add-campaign {
          width: 100%;
          padding: 12px;
          border-radius: 16px;
          border: 1px dashed rgba(190, 135, 85, 0.25);
          background: #FFFFFF;
          color: #BE8755;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-add-campaign:hover { background: #FFF7EE; border-color: #BE8755; transform: translateY(-1px); }
      `}</style>
    </aside>
  )
}

export default CalendarLeftSidebar
