import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Lock } from 'lucide-react'
import { Github, Facebook } from './ui/BrandIcons'

const Login = ({ onAuthSuccess, onSignupClick, onBack }) => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      onAuthSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side: Form */}
        <div className="auth-form-section">
          <div className="form-content">
            <header className="form-header">
              <div className="logo" onClick={onBack}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 4L4 28H28L16 4Z" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round"/>
                  <path d="M16 12L10 24H22L16 12Z" fill="#0f172a"/>
                </svg>
                <span>Planora</span>
              </div>
              <h1>Sign in</h1>
            </header>

            <form onSubmit={handleLogin} className="auth-form">
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input 
                    type="email" 
                    placeholder="johndoe@gmail.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-pw">Forgot Password</a>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Sign in'}
              </button>
            </form>

            <div className="form-footer">
              <p>
                Don't have an account? 
                <span onClick={onSignupClick} className="toggle-link"> Sign up</span>
              </p>

              <div className="social-login">
                <button className="social-icon google">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </button>
                <button className="social-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </button>
                <button className="social-icon facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Visual */}
        <div className="auth-visual-section">
          <div className="visual-overlay"></div>
          <div className="visual-content">
            <div className="large-logo">
               <svg width="240" height="240" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-20">
                  <path d="M16 4L4 28H28L16 4Z" stroke="white" strokeWidth="1" strokeLinejoin="round"/>
                  <path d="M16 12L10 24H22L16 12Z" fill="white" fillOpacity="0.1"/>
                </svg>
            </div>
            
            <div className="visual-text">
              <span className="brand-label">Planora</span>
              <h2>Welcome to Planora</h2>
              <p>Planora helps creators build organized and well coded dashboards full of beautiful and rich modules. Join us and start building your application today.</p>
              <span className="join-stat">More than 17k people joined us, it's your turn</span>
            </div>

            <div className="visual-card">
              <h3>Maximize your reach and impact with AI now</h3>
              <p>Be among the first founders to experience the easiest way to start and grow a business.</p>
              <div className="card-footer">
                <div className="avatar-group">
                  <div className="av"></div>
                  <div className="av"></div>
                  <div className="av"></div>
                  <div className="av-plus">+2</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        @import url('https://fonts.cdnfonts.com/css/clash-display');
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');

        .auth-page {
          min-height: 100vh;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Manrope', sans-serif;
        }

        .auth-container {
          width: 100%;
          max-width: 1200px;
          height: 800px;
          background: white;
          border-radius: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.15);
        }

        .auth-form-section {
          padding: 60px 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .form-content {
          max-width: 380px;
          width: 100%;
          margin: 0 auto;
        }

        .form-header {
          margin-bottom: 48px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
          cursor: pointer;
        }

        .logo span {
          font-family: 'Clash Display', sans-serif;
          font-weight: 700;
          font-size: 20px;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .form-header h1 {
          font-family: 'Clash Display', sans-serif;
          font-size: 36px;
          font-weight: 600;
          color: #0f172a;
          letter-spacing: -0.03em;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .input-group label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .input-wrapper input {
          width: 100%;
          height: 52px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0 16px 0 48px;
          font-size: 14px;
          color: #0f172a;
          transition: all 0.2s;
        }

        .input-wrapper input:focus {
          border-color: #0f172a;
          outline: none;
          box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.05);
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: -8px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
        }

        .remember-me input {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid #cbd5e1;
          cursor: pointer;
        }

        .forgot-pw {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-decoration: none;
        }

        .submit-btn {
          width: 100%;
          height: 52px;
          background: #0f172a;
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          border: none;
          cursor: pointer;
          margin-top: 12px;
          transition: all 0.2s;
        }

        .submit-btn:hover {
          background: #1e293b;
          transform: translateY(-1px);
        }

        .form-footer {
          margin-top: 32px;
          text-align: center;
        }

        .form-footer p {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 48px;
        }

        .toggle-link {
          color: #0f172a;
          font-weight: 700;
          cursor: pointer;
        }

        .social-login {
          display: flex;
          justify-content: center;
          gap: 24px;
        }

        .social-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: white;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .social-icon:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
          transform: translateY(-2px);
        }

        .auth-visual-section {
          background: #020617;
          position: relative;
          padding: 80px;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .visual-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 100% 0%, rgba(129, 140, 248, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 0% 100%, rgba(129, 140, 248, 0.1) 0%, transparent 50%);
        }

        .visual-content {
          position: relative;
          z-index: 10;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .large-logo {
          margin-bottom: 80px;
          display: flex;
          justify-content: center;
        }

        .visual-text {
          max-width: 440px;
        }

        .brand-label {
          display: block;
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 18px;
          margin-bottom: 24px;
          opacity: 0.9;
        }

        .visual-text h2 {
          font-family: 'Clash Display', sans-serif;
          font-size: 48px;
          font-weight: 600;
          margin-bottom: 24px;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .visual-text p {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 32px;
        }

        .join-stat {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .visual-card {
          margin-top: auto;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          padding: 40px;
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          max-width: 440px;
        }

        .visual-card h3 {
          font-family: 'Clash Display', sans-serif;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .visual-card p {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 24px;
        }

        .avatar-group {
          display: flex;
          align-items: center;
        }

        .av {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #1e293b;
          background: #475569;
          margin-right: -10px;
        }

        .av:nth-child(1) { background: #818cf8; }
        .av:nth-child(2) { background: #f472b6; }
        .av:nth-child(3) { background: #34d399; }

        .av-plus {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #1e293b;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: white;
          margin-left: 5px;
        }

        .error-msg {
          color: #fb7185;
          font-size: 13px;
          background: rgba(251, 113, 133, 0.1);
          padding: 12px;
          border-radius: 8px;
          text-align: center;
        }

        @media (max-width: 1024px) {
          .auth-container {
            grid-template-columns: 1fr;
            height: auto;
            max-width: 540px;
          }
          .auth-visual-section {
            display: none;
          }
          .auth-form-section {
            padding: 60px 40px;
          }
        }
      `}</style>
    </div>
  )
}

export default Login
