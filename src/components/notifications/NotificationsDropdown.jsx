import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  X, 
  Check, 
  Calendar, 
  Zap, 
  TrendingUp, 
  AlertCircle,
  Clock,
  MoreHorizontal
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const NotificationsDropdown = ({ isOpen, onClose }) => {
  const { notifications, markAllNotificationsRead, markNotificationRead } = useAppStore()

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop to close on click outside */}
          <motion.div 
            className="dropdown-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div 
            className="notifications-dropdown"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="dropdown-header">
              <div className="header-left">
                <h3>Notifications</h3>
                {unreadCount > 0 && <span className="unread-badge">{unreadCount} New</span>}
              </div>
              <div className="header-actions">
                <button className="text-btn" onClick={markAllNotificationsRead}>Mark all read</button>
                <button className="icon-close" onClick={onClose}><X size={18} /></button>
              </div>
            </div>

            <div className="notifications-list custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Bell size={32} /></div>
                  <p>All caught up!</p>
                  <span>No new notifications at the moment.</span>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <motion.div 
                    key={n.id}
                    className={`notification-item ${n.unread ? 'unread' : ''}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => markNotificationRead(n.id)}
                  >
                    <div className="n-icon" style={{ background: `${n.color}15`, color: n.color }}>
                      {n.type === 'schedule' && <Calendar size={18} />}
                      {n.type === 'ai' && <Zap size={18} />}
                      {n.type === 'analytics' && <TrendingUp size={18} />}
                    </div>
                    <div className="n-content">
                      <div className="n-top">
                        <span className="n-title">{n.title}</span>
                        <span className="n-time">{n.time}</span>
                      </div>
                      <p className="n-desc">{n.desc}</p>
                    </div>
                    {n.unread && <div className="unread-dot" />}
                  </motion.div>
                ))
              )}
            </div>

            <div className="dropdown-footer">
              <button className="view-all-btn">View All Notifications</button>
            </div>
          </motion.div>
        </>
      )}

      <style jsx="true">{`
        .dropdown-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 998;
          background: transparent;
        }

        .notifications-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 12px;
          width: 380px;
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
          z-index: 999;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transform-origin: top right;
          WebkitBackdropFilter: blur(20px);
        }

        .dropdown-header {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-left h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1A1A1A;
        }

        .unread-badge {
          background: #BE8755;
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 99px;
          text-transform: uppercase;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .text-btn {
          background: transparent;
          border: none;
          color: #BE8755;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .text-btn:hover { opacity: 0.8; }

        .icon-close {
          background: #F9F8F6;
          border: none;
          color: #1A1A1A;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .icon-close:hover { background: #F0EEEA; }

        .notifications-list {
          max-height: 420px;
          overflow-y: auto;
          padding: 12px;
        }

        .notification-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          border-radius: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .notification-item:hover {
          background: #F9F8F6;
        }

        .notification-item.unread {
          background: rgba(190, 135, 85, 0.03);
        }

        .notification-item.unread:hover {
          background: rgba(190, 135, 85, 0.06);
        }

        .n-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .n-content {
          flex: 1;
        }

        .n-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .n-title {
          font-size: 14px;
          font-weight: 700;
          color: #1A1A1A;
        }

        .n-time {
          font-size: 11px;
          color: #9CA3AF;
          font-weight: 500;
        }

        .n-desc {
          font-size: 13px;
          color: #6B6B6B;
          line-height: 1.4;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #BE8755;
          border-radius: 50%;
          position: absolute;
          top: 20px;
          right: 20px;
        }

        .dropdown-footer {
          padding: 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .view-all-btn {
          width: 100%;
          padding: 12px;
          background: #FDFCFB;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 14px;
          color: #1A1A1A;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-all-btn:hover {
          background: #F9F8F6;
          border-color: #BE8755;
          color: #BE8755;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: #9CA3AF;
        }

        .empty-icon {
          margin-bottom: 16px;
          opacity: 0.3;
          display: flex;
          justify-content: center;
        }

        .empty-state p {
          font-size: 16px;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 4px;
        }

        .empty-state span {
          font-size: 13px;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }

        /* Responsive Mobile Sizing */
        @media (max-width: 480px) {
          .notifications-dropdown {
            position: fixed;
            top: 75px;
            left: 16px;
            right: 16px;
            width: auto;
            margin-top: 0;
            max-height: calc(100vh - 120px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          }
          .notifications-list {
            max-height: calc(100vh - 260px);
          }
        }

        /* ── Dark Theme Overrides ── */
        [data-theme="dark"] .notifications-dropdown {
          background: #1C1A17;
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }
        [data-theme="dark"] .dropdown-header {
          border-bottom-color: rgba(255, 255, 255, 0.05);
        }
        [data-theme="dark"] .header-left h3 {
          color: #FAF8F5;
        }
        [data-theme="dark"] .icon-close {
          background: #2D2A26;
          color: #FAF8F5;
        }
        [data-theme="dark"] .icon-close:hover {
          background: #3D3934;
        }
        [data-theme="dark"] .notification-item:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        [data-theme="dark"] .notification-item.unread {
          background: rgba(190, 135, 85, 0.06);
        }
        [data-theme="dark"] .notification-item.unread:hover {
          background: rgba(190, 135, 85, 0.1);
        }
        [data-theme="dark"] .n-title {
          color: #FAF8F5;
        }
        [data-theme="dark"] .n-desc {
          color: #C0B7AD;
        }
        [data-theme="dark"] .dropdown-footer {
          border-top-color: rgba(255, 255, 255, 0.05);
        }
        [data-theme="dark"] .view-all-btn {
          background: #12110E;
          border-color: rgba(255, 255, 255, 0.08);
          color: #FAF8F5;
        }
        [data-theme="dark"] .view-all-btn:hover {
          background: #2D2A26;
          color: #BE8755;
          border-color: #BE8755;
        }
        [data-theme="dark"] .empty-state p {
          color: #FAF8F5;
        }
        [data-theme="dark"] .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </AnimatePresence>
  )
}

export default NotificationsDropdown
