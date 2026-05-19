import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { supabase } from '../lib/supabase'
import {
  Zap,
  BarChart,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Layout,
  Users,
  Shield,
  MessageSquare,
  TrendingUp,
  Clock,
  ChevronRight,
  Play,
  Plus,
  Layers,
  Quote
} from 'lucide-react'
import stitchAi from '../assets/stitch-ai.png'
import stitchAnalytics from '../assets/stitch-analytics.png'
import stitchCalendar from '../assets/stitch-calendar.png'
import sarah from '../assets/sarah.png'
import david from '../assets/david.png'
import elena from '../assets/elena.png'
import PillNav from '../components/ui/PillNav'
import logo from '../assets/logo_golden.png'

const Landing = () => {
  const navigate = useNavigate()
  const { session } = useAppStore()
  
  const onStart = () => navigate('/signup')
  const onLogin = () => navigate('/login')
  const onGoToDashboard = () => navigate('/dashboard')
  
  const onLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }
  
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  }

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'AI Assistant', href: '#ai' },
    { name: 'Analytics', href: '#analytics' },
  ]

  const [hoveredLink, setHoveredLink] = React.useState(null)

  return (
    <div className="landing-page font-sans">
      <style>
        {`
          @media (max-width: 1024px) {
            .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; text-align: center; }
            .hero-copy { max-width: 100% !important; display: flex; flex-direction: column; align-items: center; }
            .hero-copy p { max-width: 500px !important; margin: 0 auto 44px !important; }
            .hero-visual { height: 400px !important; }
            .hero-visual > div { position: relative !important; transform: scale(0.8); top: 0 !important; left: 0 !important; margin: 0 auto; }
            .hero-nav { padding: 20px 24px !important; }
          }
          @media (max-width: 768px) {
            .hero-visual { display: none !important; }
            .hero-grid { padding: 120px 24px 80px !important; }
            .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 24px !important; }
            .grid-2 { grid-template-columns: 1fr !important; gap: 40px !important; }
            .grid-2.reverse { flex-direction: column-reverse; display: flex; }
            .feature-section { padding: 80px 0 !important; }
            .testimonials-grid { grid-template-columns: 1fr !important; }
            .workflow-steps { grid-template-columns: 1fr !important; gap: 32px !important; }
            .footer-links { grid-template-columns: repeat(2, 1fr) !important; gap: 32px !important; }
          }
          @media (max-width: 375px) {
            h1 { font-size: 38px !important; }
            .stats-grid { grid-template-columns: 1fr !important; }
            .hero-nav { padding: 16px !important; }
            .footer-links { grid-template-columns: 1fr !important; }
          }
        `}
      </style>

      {/* ── HERO: full-screen dark section ── */}
      <section style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Cinematic Sweeping Ray */}
        <style>
          {`
            @keyframes sweepHero {
              0% { transform: translateX(-150%) skewX(-20deg); opacity: 0; }
              20% { opacity: 0.35; }
              50% { opacity: 0.6; }
              80% { opacity: 0.35; }
              100% { transform: translateX(200%) skewX(-20deg); opacity: 0; }
            }
            @keyframes pulseGlow {
              0%, 100% { opacity: 1; transform: translate(-20%, -50%) scale(1); }
              50% { opacity: 0.8; transform: translate(-20%, -50%) scale(1.05); }
            }
          `}
        </style>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '60%', height: '150%',
          background: 'linear-gradient(90deg, transparent, rgba(190, 135, 85, 0.18), transparent)',
          filter: 'blur(120px)',
          animation: 'sweepHero 12s infinite ease-in-out',
          zIndex: 1,
          pointerEvents: 'none',
        }} />

        {/* Primary Amber glow orb */}
        <div style={{
          position: 'absolute',
          width: '1000px', height: '1000px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(190, 135, 85, 0.28) 0%, rgba(170, 110, 70, 0.15) 40%, transparent 75%)',
          top: '40%', left: '45%',
          transform: 'translate(-20%, -50%)',
          pointerEvents: 'none',
          filter: 'blur(50px)',
          zIndex: 0,
          animation: 'pulseGlow 10s infinite ease-in-out',
        }} />
        {/* Secondary bottom-right glow */}
        <div style={{
          position: 'absolute',
          width: '650px', height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(190, 135, 85, 0.22) 0%, transparent 70%)',
          bottom: '-5%', right: '0%',
          pointerEvents: 'none',
          filter: 'blur(80px)',
          zIndex: 0,
        }} />
        {/* Tertiary top-left glow for fuller coverage */}
        <div style={{
          position: 'absolute',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(190, 135, 85, 0.15) 0%, transparent 70%)',
          top: '5%', left: '10%',
          pointerEvents: 'none',
          filter: 'blur(100px)',
          zIndex: 0,
        }} />
        {/* Subtle dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          zIndex: 2,
        }} />

        {/* PillNav — kept white/light over dark bg */}
        <header className="hero-nav" style={{ position: 'relative', zIndex: 100, padding: '28px 48px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PillNav
              logo={logo}
              logoAlt="Planora Logo"
              brandName="planora"
              items={[
                { label: 'Features', href: '#features' },
                { label: 'AI Assistant', href: '#ai' },
                { label: 'Analytics', href: '#analytics' },
                { 
                  label: session ? 'Logout' : 'Sign up free', 
                  href: session ? '#' : '#start', 
                  className: 'cta-pill', 
                  noHover: true, 
                  onClick: session ? onLogout : onStart 
                }
              ]}
              activeHref="#home"
              baseColor="rgba(255,255,255,0.55)"
              pillColor="transparent"
              pillTextColor="rgba(255,255,255,0.55)"
              hoveredPillTextColor="rgba(255,255,255,0.9)"
              ease="easeOut"
              initialLoadAnimation={false}
            />
          </div>
        </header>

        {/* Mobile Header / Corner Logo */}
        <div className="mobile-logo-header">
          <img src={logo} alt="Logo" className="mobile-logo-img" />
          <span className="mobile-logo-text">planora</span>
        </div>

        {/* Hero content */}
        <div className="hero-grid" style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'center',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          padding: '80px 64px 80px',
          gap: '80px',
          position: 'relative', zIndex: 10,
        }}>

          {/* Left — copy */}
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '5px 13px', borderRadius: '100px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '32px',
            }}>
              <Sparkles style={{ width: '11px', height: '11px', color: 'rgba(255,255,255,0.45)' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>AI-Powered Social Media</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(44px, 5.5vw, 80px)',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              margin: '0 0 28px 0',
              fontFamily: "'Inter', sans-serif",
            }}>
              Plan social<br />
              content<br />
              <span style={{ color: 'rgba(255,255,255,0.22)' }}>effortlessly.</span>
            </h1>

            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.35)',
              lineHeight: 1.7,
              maxWidth: '380px',
              margin: '0 0 44px 0',
              fontWeight: 400,
            }}>
              Planora's AI-driven platform handles scheduling, optimization, and reporting — so you can focus on building meaningful connections.
            </p>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={session ? onGoToDashboard : onStart}
                style={{
                  height: '48px', padding: '0 28px',
                  background: '#f3a63b', color: '#0a0a0a',
                  border: '1px solid rgba(243, 166, 59, 0.3)', borderRadius: '12px',
                  fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', letterSpacing: '-0.01em',
                  transition: 'all 0.15s',
                  boxShadow: '0 4px 15px rgba(243, 166, 59, 0.3)',
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.background = '#f5b352'; 
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(243, 166, 59, 0.45)';
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.background = '#f3a63b'; 
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(243, 166, 59, 0.3)';
                }}
              >
                {session ? 'Go to Dashboard' : 'Get Started Free'}
              </button>
              {session && (
                <button
                  onClick={onGoToDashboard}
                  style={{
                    height: '48px', padding: '0 24px',
                    background: 'transparent', color: '#f3a63b',
                    border: '1px solid rgba(243, 166, 59, 0.4)', borderRadius: '12px',
                    fontSize: '14px', fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'all 0.15s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.borderColor = '#f3a63b'; 
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.background = 'rgba(243, 166, 59, 0.08)';
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.borderColor = 'rgba(243, 166, 59, 0.4)'; 
                    e.currentTarget.style.color = '#f3a63b';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Layout style={{ width: '13px', height: '13px' }} />
                  Dashboard
                </button>
              )}
            </div>

            {/* Social proof strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '52px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {[
                  { type: 'img', src: sarah },
                  { type: 'img', src: david },
                  { type: 'img', src: elena },
                  { type: 'text', val: '+2k' }
                ].map((item, i) => (
                  <div key={i} style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    border: '2px solid #020617',
                    marginLeft: i > 0 ? '-10px' : 0,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: item.type === 'text' ? '#f3a63b' : '#1e293b',
                    color: item.type === 'text' ? '#0a0a0a' : 'transparent',
                    fontSize: '10px',
                    fontWeight: 800,
                    zIndex: 4 - i,
                  }}>
                    {item.type === 'img' ? (
                      <img src={item.src} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      item.val
                    )}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                Be the one to shift to ease
              </span>
            </div>
          </motion.div>

          {/* Right — floating Planora UI cards */}
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25, ease: 'easeOut' }}
            style={{ position: 'relative', height: '560px' }}
          >
            {/* Main card — AI Post */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: '20px', left: '20px',
                width: '280px',
                background: 'white', borderRadius: '20px',
                padding: '24px', boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
                zIndex: 3,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', background: '#0a0a0a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles style={{ width: '13px', height: '13px', color: '#d4af37' }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>AI Post Generator</span>
                </div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d4af37' }} />
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                "Thread idea: Why most creators burn out by year 2 — and the 3-step system that prevents it 🧵"
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['#content', '#growth', '#creator'].map(t => (
                  <span key={t} style={{ fontSize: '10px', fontWeight: 600, color: '#6366f1', background: '#eef2ff', borderRadius: '6px', padding: '3px 8px' }}>{t}</span>
                ))}
              </div>
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Scheduled · Mon 9:00 AM</span>
                <div style={{ width: '24px', height: '24px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar style={{ width: '11px', height: '11px', color: '#64748b' }} />
                </div>
              </div>
            </motion.div>

            {/* Second card — Analytics */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              style={{
                position: 'absolute', top: '180px', right: '0px',
                width: '220px',
                background: 'white', borderRadius: '18px',
                padding: '20px', boxShadow: '0 24px 48px rgba(0,0,0,0.45)',
                zIndex: 4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>This Week</span>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d4af37' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1 }}>+42%</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, marginTop: '4px' }}>Engagement rate</div>
              </div>
              {/* Mini bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '36px' }}>
                {[60, 40, 75, 50, 90, 65, 100].map((h, i) => (
                  <div key={i} style={{
                    flex: 1, height: `${h}%`,
                    background: i === 6 ? '#0f172a' : '#e2e8f0',
                    borderRadius: '3px',
                    transition: 'height 0.3s',
                  }} />
                ))}
              </div>
            </motion.div>

            {/* Third card — Schedule queue */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              style={{
                position: 'absolute', bottom: '20px', left: '40px',
                width: '260px',
                background: 'white', borderRadius: '18px',
                padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                zIndex: 3,
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock style={{ width: '12px', height: '12px', color: '#64748b' }} />
                Posting Queue
              </div>
              {[
                { time: '9:00 AM', platform: 'Twitter / X', color: '#0f172a', dot: '#1d9bf0' },
                { time: '12:30 PM', platform: 'Instagram', color: '#64748b', dot: '#e1306c' },
                { time: '6:00 PM', platform: 'LinkedIn', color: '#64748b', dot: '#0077b5' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 0',
                  borderBottom: i < 2 ? '1px solid #f8fafc' : 'none',
                }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, minWidth: '62px' }}>{item.time}</span>
                  <span style={{ fontSize: '11px', color: item.color, fontWeight: 600 }}>{item.platform}</span>
                </div>
              ))}
            </motion.div>

            {/* Fourth small card — Platform icons */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              style={{
                position: 'absolute', top: '60px', right: '-20px',
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '14px 18px',
                zIndex: 2,
                display: 'flex', alignItems: 'center', gap: '10px',
              }}
            >
              <TrendingUp style={{ width: '14px', height: '14px', color: '#d4af37' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Reach up 2.4×</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom strip */}
        <div style={{
          position: 'relative', zIndex: 10,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '20px 64px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          maxWidth: '1280px', margin: '0 auto', width: '100%',
          flexWrap: 'wrap', gap: '12px'
        }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>our application downloads reach to 50 thousand.</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>planora.app</span>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="stats-section">
        <div className="container">
          <p className="stats-label">TRUSTED BY HIGH-OUTPUT CREATORS WORLDWIDE</p>
          <div className="stats-grid">
            <div className="stat">
              <h3>20k+</h3>
              <p>Posts Scheduled</p>
            </div>
            <div className="stat">
              <h3>5k+</h3>
              <p>Active Creators</p>
            </div>
            <div className="stat">
              <h3>98%</h3>
              <p>Customer Satisfaction</p>
            </div>
            <div className="stat">
              <h3>15+</h3>
              <p>Platform Supports</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 1: Strategy Map */}
      <section id="features" className="feature-section">
        <div className="container grid-2">
          <motion.div className="feature-preview" {...fadeInUp}>
            <div className="preview-container gray">
              <img src={stitchCalendar} alt="Calendar Map" />
            </div>
          </motion.div>
          <motion.div className="feature-text" {...fadeInUp}>
            <h2>Your Entire Strategy, Visually Mapped</h2>
            <p>Stop juggling tabs. Manage every platform from a single, intuitive interface designed for creative flow.</p>
            <div className="feature-points">
              <div className="point">
                <div className="point-icon"><Layout className="w-4 h-4" /></div>
                <div>
                  <h4>Multi-platform Scheduling</h4>
                  <p>Native previews for every social network.</p>
                </div>
              </div>
              <div className="point">
                <div className="point-icon"><TrendingUp className="w-4 h-4" /></div>
                <div>
                  <h4>Precision Analytics</h4>
                  <p>Understand what drives engagement instantly.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature 2: AI Assistant */}
      <section id="ai" className="feature-section">
        <div className="container grid-2 reverse">
          <motion.div className="feature-preview" {...fadeInUp}>
            <div className="preview-container">
              <img src={stitchAi} alt="AI Assistant" />
            </div>
          </motion.div>
          <motion.div className="feature-text" {...fadeInUp}>
            <h2>AI That Thinks Like a Strategist</h2>
            <p>Our integrated AI doesn't just write captions; it analyzes your brand voice and trends to suggest optimal posting times and content hooks.</p>
            <div className="ai-cards">
              <div className="ai-card">
                <div className="ai-card-header">
                  <Sparkles className="w-4 h-4" style={{ color: '#d4af37' }} />
                  <span>HOOK GENERATION</span>
                </div>
                <p>"Analyze this LinkedIn post. We should transition from 'problem-solve' narrative..."</p>
              </div>
              <div className="ai-card">
                <div className="ai-card-header">
                  <Clock className="w-4 h-4" style={{ color: '#d4af37' }} />
                  <span>TIMING OPTIMIZATION</span>
                </div>
                <p>Your audience is most active tomorrow at 10 AM. Schedule now?</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature 3: Data Decoded */}
      <section id="analytics" className="feature-section">
        <div className="container grid-2">
          <motion.div className="feature-preview" {...fadeInUp}>
            <div className="preview-container blue">
              <img src={stitchAnalytics} alt="Analytics Decoded" />
            </div>
          </motion.div>
          <motion.div className="feature-text" {...fadeInUp}>
            <h2>Data Decoded for Sustainable Growth</h2>
            <p>Beyond likes and follows, Planora provides deep insights into consistency, engagement velocity, and content type performance.</p>
            <div className="stats-pill-grid">
              <div className="stats-pill">
                <span>CONSISTENCY SCORE</span>
                <strong>94/100</strong>
              </div>
              <div className="stats-pill">
                <span>ENGAGEMENT VELOCITY</span>
                <strong>+22%</strong>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="workflow-section">
        <div className="container">
          <div className="section-title">
            <h2>Your Workflow, Simplified</h2>
            <p>From a rough idea to a viral post in four seamless steps.</p>
          </div>
          <div className="workflow-steps">
            <div className="step">
              <div className="step-icon"><Plus /></div>
              <h4>Create</h4>
              <p>Draft your ideas in our distraction-free editor.</p>
            </div>
            <div className="step">
              <div className="step-icon"><Calendar /></div>
              <h4>Schedule</h4>
              <p>Map out your content across the weekly grid.</p>
            </div>
            <div className="step">
              <div className="step-icon"><Zap /></div>
              <h4>Optimize</h4>
              <p>Let AI optimize hooks and metadata.</p>
            </div>
            <div className="step">
              <div className="step-icon"><TrendingUp /></div>
              <h4>Publish</h4>
              <p>Ship to all platforms with a single click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        padding: '160px 0',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 60%, #f1f5f9 100%)',
        borderTop: '1px solid #f1f5f9',
        borderBottom: '1px solid #f1f5f9',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 48px' }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '80px' }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '100px',
              background: 'white', border: '1px solid #dbeafe',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              marginBottom: '28px'
            }}>
              <Sparkles style={{ width: '13px', height: '13px', color: '#d4af37' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#b8962e', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Testimonials</span>
            </div>

            <h2 style={{
              fontSize: '38px', fontWeight: 800, color: '#0f172a',
              letterSpacing: '-0.02em', lineHeight: 1.2,
              margin: '0 0 20px 0'
            }}>
              Loved by creators and teams
            </h2>

            <p style={{
              fontSize: '18px', color: '#94a3b8', fontWeight: 400,
              lineHeight: 1.7, maxWidth: '520px', margin: '0 auto'
            }}>
              Planora helps thousands of creators plan smarter, create faster, and grow their audience.
            </p>
          </motion.div>

          {/* Cards Grid */}
          <div className="testimonials-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
            marginBottom: '96px',
            alignItems: 'stretch'
          }}>

            {/* Card 1 — Sarah Jenkins */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              style={{
                background: 'white',
                borderRadius: '28px',
                padding: '40px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 24px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'default'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #f1f5f9', flexShrink: 0 }}>
                  <img src={sarah} alt="Sarah Jenkins" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Sarah Jenkins</span>
                    <div style={{ background: '#d4af37', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                      <CheckCircle style={{ width: '10px', height: '10px', color: 'white' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>SaaS Founder</span>
                </div>
              </div>

              <p style={{
                fontSize: '16px', color: '#475569', lineHeight: 1.75,
                fontStyle: 'italic', margin: '0', flex: 1
              }}>
                "Planora literally saved me 10 hours a week. The AI hook generator is scarily accurate to my personal brand voice."
              </p>

              <div style={{
                marginTop: '32px', paddingTop: '24px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', background: '#ef4444', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Play style={{ width: '9px', height: '9px', color: 'white', fill: 'white' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>YouTube</span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>125K subs</span>
              </div>
            </motion.div>

            {/* Card 2 — David Chen */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 22 }}
              whileHover={{ y: -8 }}
              style={{
                background: 'white',
                borderRadius: '28px',
                padding: '40px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 24px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'default'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #f1f5f9', flexShrink: 0 }}>
                  <img src={david} alt="David Chen" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>David Chen</span>
                    <div style={{ background: '#d4af37', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                      <CheckCircle style={{ width: '10px', height: '10px', color: 'white' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Content Strategist</span>
                </div>
              </div>

              <p style={{
                fontSize: '16px', color: '#475569', lineHeight: 1.75,
                fontStyle: 'italic', margin: '0', flex: 1
              }}>
                "The cleanest interface I've used. No distractions, just focus. It's the 'Linear' of social media tools."
              </p>

              <div style={{
                marginTop: '32px', paddingTop: '24px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', background: '#d4af37', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '9px', color: 'white', fontWeight: 900 }}>in</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>LinkedIn</span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>80K fans</span>
              </div>
            </motion.div>

            {/* Card 3 — Elena Rodriguez */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 22 }}
              whileHover={{ y: -8 }}
              style={{
                background: 'white',
                borderRadius: '28px',
                padding: '40px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 24px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'default'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #f1f5f9', flexShrink: 0 }}>
                  <img src={elena} alt="Elena Rodriguez" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Elena Rodriguez</span>
                    <div style={{ background: '#d4af37', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                      <CheckCircle style={{ width: '10px', height: '10px', color: 'white' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Creative Director</span>
                </div>
              </div>

              <p style={{
                fontSize: '16px', color: '#475569', lineHeight: 1.75,
                fontStyle: 'italic', margin: '0', flex: 1
              }}>
                "Finally, a tool that respects my time. The batching workflow is second to none. Pure cognitive ease."
              </p>

              <div style={{
                marginTop: '32px', paddingTop: '24px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '20px', height: '20px',
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6)',
                    borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{ width: '8px', height: '8px', border: '1.5px solid white', borderRadius: '2px' }}></div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>Instagram</span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>210K fans</span>
              </div>
            </motion.div>

          </div>

          {/* Brand Logos */}
          <div style={{
            textAlign: 'center',
            paddingTop: '64px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <p style={{
              fontSize: '10px', fontWeight: 700, color: '#cbd5e1',
              textTransform: 'uppercase', letterSpacing: '0.25em',
              marginBottom: '40px'
            }}>
              Trusted by creators and teams at
            </p>
            <div style={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
              alignItems: 'center', gap: '48px',
              opacity: 0.25, filter: 'grayscale(1)'
            }}>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>ramp ↗</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ background: '#0f172a', color: 'white', borderRadius: '4px', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 900 }}>N</span>
                Notion
              </span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>loom</span>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>descript</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', fontStyle: 'italic', letterSpacing: '-0.02em' }}>Canva</span>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>HubSpot</span>
            </div>
          </div>

        </div>
      </section>



      {/* Footer */}
      <footer className="footer" style={{
        padding: '60px 0 40px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        textAlign: 'center',
        background: '#020617',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '100px',
          background: 'radial-gradient(ellipse at bottom, rgba(243, 166, 59, 0.15), transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.4)',
            margin: 0,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: "'Outfit', sans-serif"
          }}>
            <span>Designed & Developed by</span>
            <span className="cool-developer-name" style={{
              background: 'linear-gradient(135deg, #f3a63b 0%, #ff7b00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              textShadow: '0 0 20px rgba(243, 166, 59, 0.2)',
              transition: 'all 0.3s ease'
            }}>
              Deepak Dubey <Sparkles className="developer-spark" style={{ width: '14px', height: '14px', color: '#f3a63b' }} />
            </span>
          </p>
          
          <p style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.25)',
            marginTop: '12px',
            marginBottom: 0,
            letterSpacing: '0.05em'
          }}>
            © 2026 PLANORA. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>

      <style jsx="true">{`
        .landing-page {
          background: #ffffff;
          color: #0f172a;
          font-family: 'Manrope', sans-serif;
          line-height: 1.6;
          position: relative;
        }

        .cool-developer-name:hover {
          transform: translateY(-1px);
          filter: drop-shadow(0 0 8px rgba(243, 166, 59, 0.4));
          cursor: pointer;
        }
        .cool-developer-name .developer-spark {
          transition: transform 0.3s ease;
        }
        .cool-developer-name:hover .developer-spark {
          transform: rotate(20deg) scale(1.25);
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-blob {
          animation: blob 3.2s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 1.1s;
        }

        .animation-delay-4000 {
          animation-delay: 2.2s;
        }

        h1, h2, h3, h4, .logo span, .hero-title, .section-title {
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          letter-spacing: -0.03em;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Cleanup old Nav styles that are now handled by Tailwind */
        .nav-wrapper, .nav, .logo, .nav-links, .nav-actions, .btn-pill, .btn-text {
          display: none;
        }

        /* Hero */
        .hero { 
          padding: 180px 0 120px;
          background-color: #020617;
          background-image: 
            radial-gradient(at 50% 100%, #cbd5e1 0%, transparent 60%),
            radial-gradient(at 0% 0%, rgba(79, 70, 229, 0.1) 0%, transparent 40%),
            radial-gradient(at 100% 0%, rgba(147, 51, 234, 0.1) 0%, transparent 40%);
          color: white;
        }
        .hero-title {
          font-size: 72px;
          line-height: 1.05;
          margin-bottom: 24px;
          color: white;
          letter-spacing: -0.04em;
        }
        .hero-subtitle {
          font-size: 16px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 40px;
          max-width: 540px;
          font-weight: 400;
        }
        .hero-title span {
          color: #818cf8;
          opacity: 1;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 80px;
          align-items: center;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(12px);
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 800;
          color: white;
          margin-bottom: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          letter-spacing: 0.1em;
          box-shadow: 
            0 0 20px rgba(129, 140, 248, 0.15),
            inset 0 0 12px rgba(129, 140, 248, 0.1);
          position: relative;
          overflow: hidden;
        }

        .badge :global(svg) {
          color: #818cf8;
          filter: drop-shadow(0 0 8px rgba(129, 140, 248, 0.8));
          animation: pulse-glow 2s infinite alternate;
        }

        @keyframes pulse-glow {
          from { opacity: 0.8; filter: drop-shadow(0 0 4px rgba(129, 140, 248, 0.5)); }
          to { opacity: 1; filter: drop-shadow(0 0 12px rgba(129, 140, 248, 1)); }
        }

        .badge::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(66, 133, 244, 0.1) 25%, 
            rgba(155, 114, 203, 0.1) 50%, 
            rgba(217, 101, 112, 0.1) 75%, 
            transparent 100%
          );
          background-size: 200% 100%;
          animation: gemini-flow 4s linear infinite;
        }

        @keyframes gemini-flow {
          0% { background-position: 100% 0%; }
          100% { background-position: -100% 0%; }
        }
        .hero-title {
          font-size: 72px;
          line-height: 1.05;
          font-weight: 600;
          margin-bottom: 24px;
          color: white;
          letter-spacing: -0.04em;
        }
        .hero-subtitle {
          font-family: 'Manrope', sans-serif;
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 40px;
          max-width: 540px;
          font-weight: 400;
        }
        .hero-content h1 span {
          color: #94a3b8;
          font-style: italic;
          font-weight: 500;
        }
        .hero-content p {
          margin-bottom: 40px;
          max-width: 480px;
        }
        .hero-btns { display: flex; gap: 16px; }

        .hero-visual {
          position: relative;
        }
        .dashboard-frame {
          background: #cbd5e1; /* Light blue/gray base */
          padding: 40px;
          border-radius: 24px;
          position: relative;
        }
        .dashboard-frame img {
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .testimonial-overlay {
          position: absolute;
          bottom: -20px;
          right: -20px;
          background: white;
          padding: 20px;
          border-radius: 16px;
          width: 280px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .overlay-header { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
        .avatar { 
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          background: #818cf8; 
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: 700;
        }
        .name { 
          font-size: 12px; 
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .role { font-size: 10px; color: #64748b; }
        .testimonial-overlay p { font-size: 12px; color: #475569; font-style: italic; margin: 0; }

        /* Stats */
        .stats-section { padding: 60px 0; border-bottom: 1px solid #f1f5f9; text-align: center; }
        .stats-label { font-size: 11px; font-weight: 600; color: #94a3b8; letter-spacing: 0.1em; margin-bottom: 48px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
        .stat h3 { font-size: 32px; margin-bottom: 8px; }
        .stat p { font-size: 13px; color: #64748b; font-weight: 500; }

        /* Features */
        .feature-section { 
          padding: 120px 0; 
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
          box-shadow: inset 0 20px 40px -20px rgba(0,0,0,0.02), inset 0 -20px 40px -20px rgba(0,0,0,0.02);
          position: relative;
          z-index: 1;
        }
        .grid-2 { display: grid; grid-template-columns: 1.2fr 1fr; gap: 100px; align-items: center; }
        .grid-2.reverse { grid-template-columns: 1fr 1.2fr; }
        .grid-2.reverse .feature-preview { order: 2; }
        .grid-2.reverse .feature-text { order: 1; }
        
        .preview-container {
          background: #f1f5f9;
          padding: 60px;
          border-radius: 24px;
          overflow: hidden;
        }
        .preview-container.gray { background: #f1f5f9; }
        .preview-container.blue { background: #e0f2fe; }
        .preview-container img { width: 100%; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }

        .feature-text h2 { font-size: 32px; margin-bottom: 24px; }
        .feature-text p { font-size: 16px; color: #64748b; margin-bottom: 40px; }
        
        .feature-points { display: grid; gap: 32px; }
        .point { display: flex; gap: 16px; }
        .point-icon { width: 32px; height: 32px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .point h4 { font-size: 15px; margin-bottom: 4px; }
        .point p { font-size: 13px; color: #64748b; margin: 0; }

        .ai-cards { display: grid; gap: 20px; }
        .ai-card { background: white; border: 1px solid #f1f5f9; padding: 20px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .ai-card-header { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: #3b82f6; margin-bottom: 12px; }
        .ai-card p { font-size: 13px; font-style: italic; margin: 0; color: #475569; }

        .stats-pill-grid { display: flex; gap: 20px; }
        .stats-pill { background: #f8fafc; padding: 20px 32px; border-radius: 16px; border: 1px solid #f1f5f9; }
        .stats-pill span { display: block; font-size: 10px; font-weight: 600; color: #94a3b8; margin-bottom: 8px; }
        .stats-pill strong { font-size: 24px; color: #0f172a; }

        /* Workflow */
        .workflow-section { padding: 120px 0; background: #fafafa; text-align: center; }
        .section-title { max-width: 600px; margin: 0 auto 80px; }
        .section-title h2 { font-size: 32px; margin-bottom: 16px; }
        .section-title p { color: #64748b; }
        .workflow-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
        .step { position: relative; }
        .step-icon { width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .step h4 { margin-bottom: 12px; font-size: 16px; }
        .step p { font-size: 13px; color: #64748b; }

        /* Testimonials Cleaned - Now using Tailwind */
        .testimonials-section {
          position: relative;
          overflow: hidden;
        }



        /* CTA */
        .cta-section { padding: 120px 0; }
        .cta-box { background: #0f172a; padding: 100px; border-radius: 40px; text-align: center; color: white; }
        .cta-box h2 { font-size: 40px; margin-bottom: 24px; color: white; }
        .cta-box p { color: #94a3b8; margin-bottom: 48px; max-width: 600px; margin-left: auto; margin-right: auto; }
        .cta-actions { display: flex; justify-content: center; gap: 16px; }

        /* Buttons */
        .btn-dark { background: #334155; color: white; padding: 14px 28px; border-radius: 10px; font-weight: 600; border: none; cursor: pointer; transition: 0.2s; }
        .btn-dark:hover { background: #1e293b; }
        .btn-dark-small { background: #334155; color: white; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; }
        .btn-dark-full { width: 100%; background: #334155; color: white; padding: 14px; border-radius: 10px; font-weight: 600; border: none; cursor: pointer; }
        .btn-outline { background: white; border: 1px solid #e2e8f0; color: #475569; padding: 14px 28px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .btn-outline-full { width: 100%; background: white; border: 1px solid #e2e8f0; color: #475569; padding: 14px; border-radius: 10px; font-weight: 600; cursor: pointer; }
        .btn-text { background: none; border: none; color: #64748b; font-weight: 600; font-size: 14px; cursor: pointer; }
        .btn-gradient { 
          background: #f3a63b; 
          color: #0c0c0c; 
          padding: 16px 32px; 
          border-radius: 12px; 
          font-weight: 700; 
          border: 1px solid rgba(243, 166, 59, 0.3); 
          cursor: pointer; 
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(243, 166, 59, 0.25);
        }
        .btn-gradient:hover { 
          background: #f5b352; 
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(243, 166, 59, 0.4);
        }
        .btn-outline-white { 
          background: transparent; 
          border: 1px solid rgba(243, 166, 59, 0.4); 
          color: #f3a63b; 
          padding: 16px 32px; 
          border-radius: 12px; 
          font-weight: 700; 
          cursor: pointer; 
          transition: all 0.2s ease;
        }
        .btn-outline-white:hover {
          background: rgba(243, 166, 59, 0.08);
          border-color: #f3a63b;
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(243, 166, 59, 0.15);
        }

        /* Footer */
        .footer { padding: 100px 0 40px; border-top: 1px solid #f1f5f9; }
        .footer-grid { display: grid; grid-template-columns: 1.5fr 2fr; gap: 100px; margin-bottom: 80px; }
        .footer-brand p { margin-top: 24px; font-size: 13px; color: #64748b; max-width: 320px; }
        .footer-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .link-col h5 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 24px; }
        .link-col a { display: block; text-decoration: none; color: #475569; font-size: 13px; margin-bottom: 12px; }
        .footer-bottom { border-top: 1px solid #f1f5f9; padding-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; }

        @media (max-width: 968px) {
          .hero-grid, .grid-2 { grid-template-columns: 1fr !important; text-align: center; gap: 60px; }
          .hero-content h1 { font-size: 40px; }
          .nav-links { display: none; }
          .stats-grid, .workflow-steps, .testimonial-grid, .pricing-grid { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr; }
          .hero-btns { justify-content: center; }
        }

        .mobile-logo-header {
          display: none;
        }

        @media (max-width: 768px) {
          .hero-nav {
            display: none !important;
          }
          .mobile-logo-header {
            display: flex;
            align-items: center;
            gap: 8px;
            position: absolute;
            top: 24px;
            left: 24px;
            z-index: 100;
          }
          .mobile-logo-img {
            width: 32px;
            height: 32px;
            object-fit: contain;
            display: block;
          }
          .mobile-logo-text {
            font-size: 22px;
            font-weight: 700;
            color: rgba(255, 255, 255, 0.95);
            letter-spacing: -0.04em;
            font-family: 'Outfit', sans-serif;
            line-height: 1;
            transform: translateY(-0.5px);
          }
        }
      `}</style>
    </div>
  )
}

export default Landing
