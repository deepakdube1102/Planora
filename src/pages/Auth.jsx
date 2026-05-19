import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Layers, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../assets/logo_golden.png'
import logoWithText from '../assets/logo_with_text.png'

const Auth = ({ mode = 'login' }) => {
  const navigate = useNavigate()
  const isLogin = mode === 'login'
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showAccountSelector, setShowAccountSelector] = useState(false)
  const [pendingGoogleAuth, setPendingGoogleAuth] = useState(null)

  useEffect(() => {
    setError(null); setSuccess(null)
    setEmail(''); setPassword(''); setFullName('')
  }, [mode])

  // Check if returning from Google OAuth callback
  useEffect(() => {
    const checkSession = async (currentSession) => {
      try {
        const session = currentSession || (await supabase.auth.getSession()).data.session
        
        if (session?.user) {
          const isGoogleAuth = session.user.app_metadata?.provider === 'google' || 
                               session.user.identities?.some(i => i.provider === 'google');
          
          if (isLogin || !isGoogleAuth) {
            // Logging in or non-Google: always bypass modal and go straight to dashboard
            navigate('/dashboard', { state: { loginSuccess: true } })
          } else {
            // Google Signup: Check if new user or returning user by comparing server-side timestamps
            // (completely skew-free, as both are generated synchronously by the Supabase auth server)
            const isNewUser = session.user.last_sign_in_at && session.user.created_at
              ? Math.abs(new Date(session.user.last_sign_in_at).getTime() - new Date(session.user.created_at).getTime()) < 10000
              : true
            
            if (isNewUser) {
              // Extract Google profile data for onboarding
              const googleProfile = {
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                email: session.user.email || '',
                avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
                providerEmail: session.user.identities?.find(i => i.provider === 'google')?.identity_data?.email || session.user.email
              }

              setPendingGoogleAuth(googleProfile)
              setShowAccountSelector(true)
            } else {
              // Returning user: go straight to dashboard
              navigate('/dashboard', { state: { loginSuccess: true } })
            }
          }
        }
      } catch (err) {
        console.error('OAuth callback error:', err)
      }
    }

    // Check session on mount
    checkSession()

    // Subscribe to changes to capture the session immediately when URL hash parsing resolves asynchronously
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkSession(session)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate, isLogin])

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/dashboard', { state: { loginSuccess: true } })
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
        if (error) throw error
        setSuccess('Check your email for a confirmation link.')
      }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google', 
        options: { 
          redirectTo: window.location.origin + window.location.pathname,
          queryParams: {
            prompt: 'select_account'
          }
        } 
      })
      if (error) throw error
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleConfirmGoogleProfile = async () => {
    if (!pendingGoogleAuth) return
    
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) throw new Error('Not authenticated')

      // Save Google profile to database
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: pendingGoogleAuth.name,
          email: pendingGoogleAuth.email,
          avatar_url: pendingGoogleAuth.avatar,
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      // Create default user settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: session.user.id,
          workspace_name: `${pendingGoogleAuth.name}'s Workspace`,
          workspace_url: `${pendingGoogleAuth.name.toLowerCase().replace(/\s+/g, '-')}.planora.com`
        }, { onConflict: 'user_id' })

      if (settingsError) throw settingsError

      // Insert default social accounts
      const platforms = ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'YouTube']
      for (const platform of platforms) {
        await supabase
          .from('social_accounts')
          .upsert({
            user_id: session.user.id,
            platform: platform,
            handle: `@${pendingGoogleAuth.name.toLowerCase().replace(/\s+/g, '_')}`,
            connected: false
          }, { onConflict: 'user_id,platform' })
      }

      setShowAccountSelector(false)
      setPendingGoogleAuth(null)
      navigate('/dashboard', { state: { loginSuccess: true } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRejectGoogleProfile = async () => {
    try {
      await supabase.auth.signOut()
      setShowAccountSelector(false)
      setPendingGoogleAuth(null)
      setError(null)
      // Stay on login page, user can try again
    } catch (err) {
      setError('Failed to sign out. Please refresh the page.')
    }
  }

  const I = { style: { position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', color:'rgba(243, 166, 59, 0.4)', pointerEvents:'none', transition: 'color 0.2s' } }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .auth-root { 
          min-height: 100vh; 
          display: grid; 
          grid-template-columns: 1fr 1.2fr; 
          font-family: 'Inter', sans-serif; 
          background: #030303; 
          position: relative;
          overflow: hidden;
        }

        /* Cinematic Ambient Flow (Right Side Only - Rays) */
        .ambient-glow-base {
          position: absolute;
          inset: -50%;
          background: radial-gradient(ellipse at 30% 60%, rgba(230, 190, 160, 0.15) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
          transform: rotate(-15deg);
          animation: sweepRay 20s infinite alternate ease-in-out;
        }

        .ambient-gold-1 {
          position: absolute;
          width: 200%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(230, 190, 160, 0.08), transparent);
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
          transform: rotate(-30deg);
          top: -10%; left: -50%;
          animation: sweepRay2 25s infinite alternate ease-in-out;
        }
        
        .ambient-gold-2 {
          display: none;
        }

        @keyframes sweepRay {
          0% { transform: rotate(-20deg) translateY(10%) scale(0.9); opacity: 0.6; }
          100% { transform: rotate(-5deg) translateY(-5%) scale(1.1); opacity: 1; }
        }
        @keyframes sweepRay2 {
          0% { transform: rotate(-35deg) translateX(-15%); opacity: 0.5; }
          100% { transform: rotate(-20deg) translateX(15%); opacity: 0.9; }
        }

        /* Logo Header */
        .auth-right-logo-header {
          position: absolute;
          top: 48px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          z-index: 20;
        }

        /* Center Dash UI connections */
        .dash-logo-container {
          display: flex;
          align-items: center;
        }
        .dash-logo-wrapper {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
        }
        .dash-connect-line {
          width: 64px;
          height: 1px;
          background: rgba(255,255,255,0.06);
          position: relative;
        }
        .dash-connect-circle {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translate(50%, -50%);
          width: 24px;
          height: 24px;
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.05);
        }
        .dash-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* ══ Mobile Layout (max-width: 900px) ══ */
        .auth-mobile-root {
          display: none;
          min-height: 100vh;
          background: #09090b;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          justify-content: center;
          align-items: center;
          padding: 16px;
          z-index: 1;
        }

        .mobile-curves-wrapper {
          position: absolute;
          bottom: 0;
          right: 0;
          left: 0;
          top: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }
        .mobile-curve-1 {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          border: 1.5px solid rgba(243, 166, 59, 0.45);
          bottom: -250px;
          right: -200px;
        }
        .mobile-curve-2 {
          position: absolute;
          width: 650px;
          height: 650px;
          border-radius: 50%;
          border: 1px solid rgba(243, 166, 59, 0.3);
          bottom: -320px;
          right: -280px;
        }
        .mobile-glow-1 {
          position: absolute;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(243, 166, 59, 0.35) 0%, rgba(243, 166, 59, 0.1) 50%, transparent 80%);
          top: 55%;
          left: 50%;
          transform: translate(-50%, -50%);
          filter: blur(60px);
          pointer-events: none;
        }

        .mobile-auth-container {
          width: 100%;
          max-width: 360px;
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Logo Header */
        .mobile-logo-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          cursor: pointer;
        }
        .mobile-logo-img {
          width: 38px;
          height: 38px;
          object-fit: contain;
        }
        .mobile-logo-text {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.04em;
          font-family: 'Outfit', sans-serif;
          transform: translateY(-2px);
        }

        /* Titles */
        .mobile-welcome-title {
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 2px;
          text-align: center;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.02em;
        }
        .mobile-welcome-title .gold-text {
          color: #f3a63b;
        }
        .mobile-welcome-subtitle {
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          margin-bottom: 16px;
          line-height: 1.4;
          font-weight: 400;
          max-width: 290px;
        }

        /* Card Container */
        .mobile-card-container {
          width: 100%;
          background: rgba(20, 20, 23, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 20px;
          padding: 20px 16px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
          margin-bottom: 12px;
        }

        /* Social Google Button */
        .mobile-social-google {
          width: 100%;
          height: 40px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #f3a63b;
          border-radius: 10px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(243, 166, 59, 0.15);
        }
        .mobile-social-google:hover {
          background: rgba(243, 166, 59, 0.08);
          box-shadow: 0 4px 15px rgba(243, 166, 59, 0.3);
        }
        .mobile-social-google:active {
          transform: scale(0.98);
        }

        /* Divider */
        .mobile-divider {
          display: flex;
          align-items: center;
          margin: 12px 0;
          gap: 10px;
        }
        .mobile-divider .line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
        }
        .mobile-divider .text {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.3);
          text-transform: lowercase;
        }

        /* Form */
        .mobile-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Inputs */
        .mobile-input-group {
          position: relative;
          width: 100%;
        }
        .mobile-input-group .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          transition: color 0.2s;
        }
        .mobile-input-group .gold-icon {
          color: #f3a63b;
        }
        .mobile-input {
          width: 100%;
          height: 40px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(243, 166, 59, 0.2);
          border-radius: 10px;
          padding: 0 14px 0 40px;
          font-size: 13px;
          color: #ffffff;
          outline: none;
          transition: all 0.2s;
        }
        .mobile-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        .mobile-input:focus {
          border-color: #f3a63b;
          background: rgba(255, 255, 255, 0.03);
          box-shadow: 0 0 8px rgba(243, 166, 59, 0.2);
        }

        .mobile-eye-toggle-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.4);
          padding: 0;
          display: flex;
          align-items: center;
        }

        /* Remember Me & Forgot Password Row */
        .mobile-options-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          margin-top: 2px;
        }
        .mobile-remember-checkbox {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
        }
        .mobile-remember-checkbox input[type="checkbox"] {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          appearance: none;
          cursor: pointer;
          position: relative;
          outline: none;
          transition: all 0.2s;
        }
        .mobile-remember-checkbox input[type="checkbox"]:checked {
          background: #f3a63b;
          border-color: #f3a63b;
        }
        .mobile-remember-checkbox input[type="checkbox"]:checked::after {
          content: '✔';
          position: absolute;
          color: #000000;
          font-size: 9px;
          font-weight: 700;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        .mobile-forgot-link {
          color: #f3a63b;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .mobile-forgot-link:hover {
          opacity: 0.8;
        }

        /* Error message */
        .mobile-error-msg {
          color: #f87171;
          font-size: 12px;
          text-align: center;
          margin-top: 2px;
        }

        /* Submit Button */
        .mobile-submit-btn {
          width: 100%;
          height: 40px;
          background: #f3a63b;
          color: #000000;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.1s;
          margin-top: 4px;
        }
        .mobile-submit-btn:hover:not(:disabled) {
          background: #e29b47;
        }
        .mobile-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Footer Nav */
        .mobile-footer-nav {
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
          margin-top: 4px;
        }
        .mobile-toggle-link {
          background: none;
          border: none;
          color: #f3a63b;
          cursor: pointer;
          font-weight: 700;
          font-size: 12.5px;
          padding: 0;
          margin-left: 4px;
          transition: color 0.2s;
        }
        .mobile-toggle-link:hover {
          opacity: 0.8;
        }

        @media (max-width: 900px) {
          .auth-desktop-wrapper {
            display: none !important;
          }
          .auth-mobile-root {
            display: flex;
          }
        }

        /* ── Left ── */
        .auth-left { 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          padding: 64px 80px; 
          position: relative; 
          max-width: 580px;
          margin: 0 auto;
          width: 100%;
          z-index: 10;
        }

        /* Form inputs */
        .a-input { 
          width: 100%; 
          height: 48px; 
          background: rgba(255,255,255,0.015); 
          border: 1px solid rgba(243, 166, 59, 0.2); 
          border-radius: 12px; 
          padding: 0 16px 0 48px; 
          font-size: 14px; 
          color: rgba(255,255,255,0.9); 
          outline: none; 
          font-family: 'Inter', sans-serif; 
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; 
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }
        .a-input::placeholder { color: rgba(255,255,255,0.25); font-weight: 400; }
        .a-input:focus { 
          border-color: #f3a63b; 
          background: rgba(255,255,255,0.03); 
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 0 8px rgba(243, 166, 59, 0.2);
        }

        /* Buttons */
        .a-social { 
          height: 48px; 
          border-radius: 12px; 
          background: rgba(255, 255, 255, 0.02); 
          border: 1px solid #f3a63b; 
          color: #ffffff; 
          font-size: 14px; 
          font-weight: 600; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 10px; 
          transition: all 0.2s ease; 
          font-family: 'Inter', sans-serif; 
          box-shadow: 0 4px 12px rgba(243, 166, 59, 0.15);
        }
        .a-social:hover { 
          background: rgba(243, 166, 59, 0.08); 
          border-color: #f3a63b; 
          color: #ffffff; 
          box-shadow: 0 4px 20px rgba(243, 166, 59, 0.35);
        }
        
        .a-submit { 
          width: 100%; 
          height: 48px; 
          background: #f3a63b; 
          color: #000000; 
          border: none; 
          border-radius: 12px; 
          font-size: 14px; 
          font-weight: 700; 
          cursor: pointer; 
          transition: all 0.2s ease; 
          font-family: 'Inter', sans-serif; 
          margin-top: 16px;
          box-shadow: 0 4px 14px rgba(243, 166, 59, 0.25);
        }
        .a-submit:hover:not(:disabled) { 
          background: #e29b47; 
          color: #000000; 
          box-shadow: 0 4px 20px rgba(243, 166, 59, 0.4);
        }
        .a-submit:disabled { background: rgba(243, 166, 59, 0.2); color: rgba(0, 0, 0, 0.4); cursor: not-allowed; border-color: transparent; box-shadow: none; }

        /* ── Right ── */
        .auth-right-panel {
          padding: 32px 32px 32px 0;
          display: flex;
          z-index: 10;
        }
        .auth-right-card {
          flex: 1;
          background: rgba(14, 15, 18, 0.2);
          backdrop-filter: blur(60px);
          -webkit-backdrop-filter: blur(60px);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 32px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: inset 1px 1px 0 rgba(255,255,255,0.03), 0 24px 64px rgba(0,0,0,0.5);
        }

        /* Abstract bottom curves - Gold tinted */
        .curve-bg {
          position: absolute;
          bottom: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 150%;
          height: 80%;
          pointer-events: none;
        }
        .curve-bg div {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(200, 150, 100, 0.04);
          left: 50%;
          bottom: 0;
          transform: translate(-50%, 50%);
          box-shadow: inset 0 0 80px rgba(200, 150, 100, 0.02);
        }

        /* Dashboard UI */
        .dash-container {
          margin-top: auto;
          margin-bottom: auto;
          background: rgba(20, 20, 24, 0.5);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          padding: 32px;
          display: flex;
          align-items: center;
          gap: 32px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6);
          backdrop-filter: blur(20px);
          z-index: 10;
          position: relative;
        }
        
        /* Subtle lighting behind dash */
        .dash-glow {
          position: absolute;
          inset: -40px;
          background: radial-gradient(circle at 50% 50%, rgba(200, 150, 100, 0.08), transparent 60%);
          z-index: -1;
          filter: blur(40px);
          pointer-events: none;
        }

        .dash-card { 
          background: rgba(255,255,255,0.02); 
          border: 1px solid rgba(255,255,255,0.04); 
          border-radius: 12px; 
          padding: 16px;
          width: 220px;
          transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
          position: relative;
          overflow: hidden;
        }
        /* Subtle ambient reflection on cards */
        .dash-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(150% 150% at 0% 0%, rgba(200, 150, 100, 0.05) 0%, transparent 100%);
          pointer-events: none;
        }
        .dash-card:hover {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.3);
        }
        
        /* Checkbox */
        .a-checkbox-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .a-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.15);
          background: transparent;
          appearance: none;
          cursor: pointer;
          position: relative;
          outline: none;
          transition: all 0.2s;
        }
        .a-checkbox:checked {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.4);
        }
        .a-checkbox:checked::after {
          content: '✔';
          position: absolute;
          color: rgba(255, 255, 255, 0.9);
          font-size: 10px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
      `}</style>

      <div className="auth-root auth-desktop-wrapper">
        
        {/* ══ LEFT PANEL ══ */}
        <div className="auth-left">
          
          {/* Logo / Home Link (Top Left) */}
          <button className="auth-logo-btn" onClick={() => navigate('/')} style={{ position: 'absolute', top: '48px', left: '48px', background:'none', border:'none', cursor:'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
            <img src={logo} alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.04em', fontFamily:"'Outfit', sans-serif", transform: 'translateY(-1.5px)' }}>planora</span>
          </button>

          {/* Social */}
          <div style={{ display:'flex', flexDirection:'column', gap:'16px', marginBottom:'40px', marginTop: '40px' }}>
            <button className="a-social" onClick={handleGoogle}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'40px' }}>
            <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.03)' }}/>
            <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.2)', fontWeight:400, letterSpacing:'0.02em' }}>or continue with email</span>
            <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.03)' }}/>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {!isLogin && (
              <div style={{ position:'relative' }}>
                <svg {...I} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input className="a-input" type="text" placeholder="Full name" required value={fullName} onChange={e=>setFullName(e.target.value)}/>
              </div>
            )}

            <div style={{ position:'relative' }}>
              <Mail {...I} size={16}/>
              <input className="a-input" type="email" placeholder="Email address" required value={email} onChange={e=>setEmail(e.target.value)}/>
            </div>

            <div style={{ position:'relative' }}>
              <Lock {...I} size={16}/>
              <input className="a-input" type={showPassword?'text':'password'} placeholder="Password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} style={{ paddingRight:'44px' }}/>
              <button type="button" onClick={()=>setShowPassword(!showPassword)} style={{ position:'absolute', right:'16px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.2)', padding:0 }}>
                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>

            {/* Removed Stay signed in checkbox to enforce session-based auth */}

            {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ fontSize:'13px', color:'#f87171' }}>{error}</motion.div>}

            <button type="submit" className="a-submit" disabled={loading}>
              {loading ? 'Processing…' : 'Continue'}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <button onClick={()=>navigate(isLogin?'/signup':'/login')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', fontSize:'13.5px', fontFamily:"'Inter',sans-serif", transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.6)'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.3)'}>
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="auth-right-panel">
          <div className="auth-right-card">
            
            {/* Cinematic background elements restricted to right card */}
            <div className="ambient-glow-base" />
            <div className="ambient-gold-1" />
            <div className="ambient-gold-2" />

            {/* Logo Header */}
            <div className="auth-right-logo-header">
              <img src={logo} alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.04em', fontFamily: "'Outfit', sans-serif", transform: 'translateY(-1.2px)' }}>planora</span>
            </div>

            {/* Background Curves */}
            <div className="curve-bg">
              <div style={{ width: '800px', height: '800px', opacity: 0.15 }} />
              <div style={{ width: '1000px', height: '1000px', opacity: 0.1 }} />
              <div style={{ width: '1200px', height: '1200px', opacity: 0.05 }} />
              <div style={{ width: '1400px', height: '1400px', opacity: 0.03 }} />
              <div style={{ width: '1600px', height: '1600px', opacity: 0.01 }} />
            </div>

            {/* Center Dash UI */}
            <div className="dash-container">
              <div className="dash-glow" />
              
              {/* Left Logo Box */}
              <div className="dash-logo-container">
                <div className="dash-logo-wrapper">
                  <img src={logo} alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                </div>
                {/* Connecting Line */}
                <div className="dash-connect-line">
                  <div className="dash-connect-circle" />
                </div>
              </div>

              {/* Grid of 4 Cards */}
              <div className="dash-cards-grid">
                
                {/* Card 1 */}
                <div className="dash-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Total posts available</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>⋮</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '26px', color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>2,745</span>
                    <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 500 }}>↓ 140</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>From last 276 posts added (7 days)</div>
                </div>

                {/* Card 2 */}
                <div className="dash-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Total engagement</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>⋮</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '26px', color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>482k</span>
                    <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 500 }}>↑ 25k</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>From last 16 posts (7 days)</div>
                </div>

                {/* Card 3 */}
                <div className="dash-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Reach success rate</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>⋮</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '26px', color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>96.72<span style={{fontSize:'16px'}}>%</span></span>
                    <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 500 }}>↑ 0.27%</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>From last 0.31% (7 days)</div>
                </div>

                {/* Card 4 */}
                <div className="dash-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Revenue generated</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>⋮</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '26px', color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>$ 245k</span>
                    <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 500 }}>↑ $36k</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>From last $36k revenue (7 days)</div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ══ MOBILE PANEL (MOCKUP DESIGN) ══ */}
      <div className="auth-mobile-root auth-mobile-wrapper">
        {/* Curved lines in the background to match layout design */}
        <div className="mobile-curves-wrapper">
          <div className="mobile-curve-1" />
          <div className="mobile-curve-2" />
          <div className="mobile-glow-1" />
        </div>

        <div className="mobile-auth-container">
          {/* Logo Header */}
          <div className="mobile-logo-header" onClick={() => navigate('/')}>
            <img src={logo} alt="Logo" className="mobile-logo-img" />
            <span className="mobile-logo-text">planora</span>
          </div>

          {/* Welcome Heading */}
          <h1 className="mobile-welcome-title">
            {isLogin ? (
              <>Welcome <span className="gold-text">back!</span></>
            ) : (
              <>Create <span className="gold-text">account!</span></>
            )}
          </h1>
          <p className="mobile-welcome-subtitle">
            {isLogin ? "Login to your account and continue growing with Planora." : "Sign up for an account and start planning with Planora."}
          </p>

          {/* Translucent Card Container */}
          <div className="mobile-card-container">
            {/* Social Google Login */}
            <button className="mobile-social-google" onClick={handleGoogle}>
              <svg width="20" height="20" viewBox="0 0 24 24" className="google-icon" style={{ marginRight: '2px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="mobile-divider">
              <div className="line" />
              <span className="text">or</span>
              <div className="line" />
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="mobile-form">
              {!isLogin && (
                <div className="mobile-input-group">
                  <svg style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#f3a63b', pointerEvents:'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input className="mobile-input" type="text" placeholder="Full name" required value={fullName} onChange={e=>setFullName(e.target.value)}/>
                </div>
              )}

              <div className="mobile-input-group">
                <Mail style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#f3a63b', pointerEvents:'none' }} size={16} />
                <input className="mobile-input" type="email" placeholder="Email address" required value={email} onChange={e=>setEmail(e.target.value)}/>
              </div>

              <div className="mobile-input-group">
                <Lock style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#f3a63b', pointerEvents:'none' }} size={16} />
                <input className="mobile-input" type={showPassword?'text':'password'} placeholder="Password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} style={{ paddingRight: '44px' }} />
                <button type="button" onClick={()=>setShowPassword(!showPassword)} className="mobile-eye-toggle-btn">
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>

              {/* Options Row: Remember Me & Forgot Password */}
              <div className="mobile-options-row">
                <label className="mobile-remember-checkbox">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span>Remember me</span>
                </label>
                {isLogin && <a href="#" className="mobile-forgot-link" onClick={(e) => e.preventDefault()}>Forgot password?</a>}
              </div>

              {error && <div className="mobile-error-msg">{error}</div>}
              {success && <div style={{ color: '#10b981', fontSize: '13px', textAlign: 'center', marginTop: '4px' }}>{success}</div>}

              <button type="submit" className="mobile-submit-btn" disabled={loading}>
                {loading ? 'Processing…' : 'Continue'}
              </button>
            </form>
          </div>

          {/* Switch Mode Footer */}
          <div className="mobile-footer-nav">
            <span>{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
            <button onClick={()=>navigate(isLogin?'/signup':'/login')} className="mobile-toggle-link">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>

      {/* ══ ACCOUNT SELECTOR MODAL ══ */}
      <AnimatePresence>
        {showAccountSelector && pendingGoogleAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => !loading && handleRejectGoogleProfile()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(20, 20, 24, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '40px',
                maxWidth: '420px',
                width: '90%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)' }}>
                  Confirm Your Account
                </h2>
                <button
                  onClick={handleRejectGoogleProfile}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    color: 'rgba(255, 255, 255, 0.3)',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Google Account Card */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                >
                  {pendingGoogleAuth.avatar ? (
                    <img
                      src={pendingGoogleAuth.avatar}
                      alt={pendingGoogleAuth.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '24px', fontWeight: 700, color: 'white' }}>
                      {pendingGoogleAuth.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.95)', marginBottom: '4px' }}>
                    {pendingGoogleAuth.name}
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
                    {pendingGoogleAuth.email}
                  </div>
                </div>
              </div>

              {/* Info Text */}
              <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.6' }}>
                We'll use this Google account information to set up your Planora profile.
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <button
                  onClick={handleConfirmGoogleProfile}
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '48px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.12)'
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</span>
                      Setting up...
                    </>
                  ) : (
                    'Continue with this account'
                  )}
                </button>

                <button
                  onClick={handleRejectGoogleProfile}
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '48px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.3 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.color = 'rgba(255, 255, 255, 0.9)'
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.color = 'rgba(255, 255, 255, 0.6)'
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                >
                  Use different account
                </button>
              </div>

              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Auth
