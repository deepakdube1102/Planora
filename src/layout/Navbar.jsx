import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  LayoutDashboard, 
  Sparkles, 
  Settings as SettingsIcon, 
  Bell, 
  User,
  Library,
  BarChart,
  Megaphone,
  LogOut,
  History,
  Menu,
  ChevronLeft,
  ChevronRight,
  Crown,
  ChevronDown,
  HelpCircle
} from 'lucide-react'
import { 
  NavLink, 
  useNavigate,
  useLocation
} from 'react-router-dom'
import { supabase } from '../lib/supabase'
import logo from '../assets/logo_golden.png'
import NotificationsDropdown from '../components/notifications/NotificationsDropdown'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { useChatStore } from '../store/useChatStore'

const Navbar = ({ onLogoClick }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, notifications } = useAppStore()
  const setHistoryOpen = useChatStore(state => state.setHistoryOpen)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    let lastScroll = 0
    const handleScroll = (e) => {
      const target = e.target
      if (!target) return
      
      let currentScroll = 0
      if (target === document) {
        currentScroll = window.scrollY
      } else {
        currentScroll = target.scrollTop || 0
      }
      
      if (currentScroll > lastScroll && currentScroll > 30) {
        setIsVisible(false) // scrolling down
      } else {
        setIsVisible(true)  // scrolling up
      }
      lastScroll = currentScroll
    }

    document.addEventListener('scroll', handleScroll, { capture: true, passive: true })
    return () => document.removeEventListener('scroll', handleScroll, { capture: true })
  }, [])

  const unreadCount = notifications.filter(n => n.unread).length

  const activeTab = location.pathname.split('/')[1] || 'dashboard'
  const isSettingsSubpage = location.pathname.startsWith('/settings/') && location.pathname.split('/')[2]

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'content', label: 'Content', icon: Library },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  ]

  return (
    <>
      <div className={`nav-wrapper ${isVisible ? 'visible' : 'hidden'} ${isSettingsSubpage ? 'in-settings-subpage' : ''}`}>
        {/* Floating Pill Navigation Layout */}
        <nav className="nav-container">
          {/* Left Section: Logo Pill (Aligned Far Left) */}
          <div className="nav-section-left">
            <div 
              className="logo-pill" 
              onClick={() => {
                if (window.innerWidth <= 1100) {
                  setIsMobileMenuOpen(true)
                } else {
                  navigate('/dashboard')
                }
              }}
            >
               <img src={logo} alt="Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
               <span className="logo-text">planora</span>
            </div>
          </div>

          {/* Center Section: Tabs Pill (Centered Independently) */}
          <div className="nav-section-center">
            <div className="tabs-pill">
              {menuItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={`/${item.id}`}
                  className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right Section: Actions (Aligned Far Right) */}
          <div className="nav-section-right">
            <div className="action-group">
              <NavLink 
                to="/settings"
                className={({ isActive }) => `pill-button settings-nav-item ${isActive ? 'active-pill' : ''} ${activeTab === 'settings' ? 'in-settings-route' : ''}`}
              >
                <SettingsIcon size={18} />
                <span>Setting</span>
              </NavLink>
              
              <div style={{ position: 'relative' }}>
                <button 
                  className={`circle-button ${showNotifications ? 'active' : ''}`}
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && <div className="notification-dot" />}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <NotificationsDropdown onClose={() => setShowNotifications(false)} isOpen={showNotifications} />
                  )}
                </AnimatePresence>
              </div>

              <div className="user-profile-group">
                <button 
                  className={`circle-button profile ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => navigate('/profile')}
                  style={{ padding: 0, overflow: 'hidden' }}
                >
                  <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
                {activeTab !== 'profile' && (
                  <div className="profile-dropdown">
                    <button 
                      className="dropdown-item"
                      onClick={() => navigate('/profile')}
                    >
                      <User size={14} />
                      <span>My Profile</span>
                    </button>
                    <button 
                      className="dropdown-item logout"
                      onClick={async () => {
                        await supabase.auth.signOut()
                        navigate('/login')
                      }}
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
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
                  <button className="sidebar-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
                    <ChevronLeft size={18} />
                  </button>
                </div>
                <div className="sidebar-nav">
                  {menuItems.map((item) => (
                    <NavLink
                      key={item.id}
                      to={`/${item.id}`}
                      className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
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


      <style jsx="true">{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

        .nav-wrapper {
          position: fixed;
          top: 24px; /* Reduced from 32px to minimize vertical gap */
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          z-index: 1000;
          pointer-events: none;
          font-family: 'Outfit', sans-serif;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
        }
        .nav-wrapper.hidden {
          transform: translateY(-150%);
          opacity: 0;
        }
        .nav-wrapper.visible {
          transform: translateY(0);
          opacity: 1;
        }

        .nav-container {
          display: grid;
          grid-template-columns: 1fr auto 1fr; /* Proper 3-section layout */
          align-items: center;
          width: 100%;
          max-width: 1440px; /* Matches dashboard-container width */
          margin: 0 auto;
          pointer-events: auto;
        }

        /* ── Section Alignments ── */
        .nav-section-left {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 8px;
        }
        .nav-section-center {
          display: flex;
          justify-content: center;
        }
        .nav-section-right {
          display: flex;
          justify-content: flex-end;
        }

        /* ── Pill Styles (Spacious & Refined) ── */
        .logo-pill, .tabs-pill, .pill-button, .circle-button {
          background: #F9F6F1;
          border: 1px solid rgba(0, 0, 0, 0.07);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
          display: flex;
          align-items: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .logo-pill {
          padding: 10px 24px;
          border-radius: 999px;
          gap: 10px;
          cursor: pointer;
        }
        .logo-pill:hover {
          background: #F9F9F7;
          border-color: rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        .logo-text {
          font-weight: 600;
          font-size: 17px;
          color: #1A1A1A;
          letter-spacing: -0.02em;
          transform: translateY(-0.5px);
        }

        .tabs-pill {
          padding: 6px;
          border-radius: 999px;
          gap: 4px;
        }
        .tab-item {
          padding: 9px 22px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: #666666;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .tab-item:hover {
          background: #1A1A1A;
          color: #BE8755;
        }
        .tab-item.active {
          background: #1A1A1A;
          color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .action-group {
          display: flex;
          align-items: center;
          gap: 6px; /* Further reduced from 8px */
        }
        .pill-button {
          padding: 9px 16px; /* Further reduced */
          border-radius: 999px;
          gap: 5px; /* Further reduced */
          border: 1px solid rgba(0, 0, 0, 0.07);
          background: #F9F6F1;
          color: #1A1A1A;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
        }
        .pill-button:hover, .pill-button.active-pill {
          background: #F9F9F7;
          border-color: rgba(0,0,0,0.12);
        }
        .pill-button.active-pill {
          color: #BE8755;
        }

        .circle-button {
          width: 44px;
          height: 44px;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.07);
          background: #F9F6F1;
          color: #666666;
          cursor: pointer;
          position: relative;
        }
        .circle-button:hover, .circle-button.active {
          background: #F9F9F7;
          color: #1A1A1A;
          border-color: rgba(0,0,0,0.12);
        }

        .notification-dot {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 6px;
          height: 6px;
          background: #FDBA74;
          border-radius: 50%;
          border: 1.5px solid #F9F6F1;
        }

        .user-profile-group {
          position: relative;
        }
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 160px;
          background: #F9F6F1;
          border: 1px solid rgba(0, 0, 0, 0.07);
          border-radius: 18px;
          padding: 6px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.08);
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .user-profile-group:hover .profile-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #666;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .dropdown-item:hover {
          background: rgba(0,0,0,0.03);
          color: #1A1A1A;
        }
        .dropdown-item.logout:hover {
          background: #FFF5F5;
          color: #E53E3E;
        }

        .mobile-only {
          display: none !important;
        }
        .mobile-bottom-nav {
          display: none;
        }

        @media (max-width: 1100px) {
          .nav-container {
            width: calc(100% - 48px);
            grid-template-columns: auto 1fr;
            gap: 16px;
          }
          .nav-section-center {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .nav-wrapper {
            top: 16px;
            width: 100%;
            padding: 0 16px;
          }
          .profile-dropdown {
            display: none !important;
          }
          .nav-wrapper.in-settings-subpage {
            display: none !important;
          }
          .nav-container {
            width: 100%;
            grid-template-columns: auto 1fr;
            gap: 12px;
          }
          .logo-pill {
            padding: 8px 16px;
            gap: 8px;
          }
          .logo-text {
            font-size: 15px;
          }
          .action-group {
            gap: 8px;
          }
          /* Hide settings text, make it a circular icon button */
          .settings-nav-item span {
            display: none;
          }
          .settings-nav-item {
            padding: 0 !important;
            width: 44px !important;
            height: 44px !important;
            justify-content: center !important;
            border-radius: 50% !important;
          }
          .circle-button {
            width: 44px;
            height: 44px;
          }
        }


      `}</style>
    </>
  )
}

export default Navbar
