import React, { useEffect, useState, lazy, Suspense } from 'react'
import { 
  createBrowserRouter,
  createHashRouter,
  RouterProvider, 
  Navigate,
} from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { hardNavigate, isPublicAuthRoute } from './lib/native'
import { motion } from 'framer-motion'
import { supabase } from './lib/supabase'

// Layouts
import AppLayout from './layout/AppLayout'

// Lazy-loaded Pages (code-split for performance)
const Landing = lazy(() => import('./pages/Landing'))
const Auth = lazy(() => import('./pages/Auth'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CalendarView = lazy(() => import('./pages/Calendar'))
const AIAssistant = lazy(() => import('./pages/AIAssistant'))
const Analytics = lazy(() => import('./pages/Analytics'))
const ContentLibrary = lazy(() => import('./pages/Content'))
const Campaigns = lazy(() => import('./pages/Campaigns'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))

// Assets
import logo from './assets/logo_golden.png'

import { useAppStore } from './store/useAppStore'
import { useChatStore } from './store/useChatStore'

const ProtectedRoute = ({ children }) => {
  const { session, setSession } = useAppStore()
  const [checking, setChecking] = useState(!session)

  useEffect(() => {
    if (!session) {
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        if (currentSession) {
          setSession(currentSession)
        }
        setChecking(false)
      })
    } else {
      setChecking(false)
    }
  }, [session, setSession])

  if (checking) return <LoadingScreen />
  if (!session) return <Navigate to="/login" replace />

  return children
}

const LoadingScreen = () => (
  <div style={{
    height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', background: '#FFFFFF'
  }}>
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      <img src={logo} alt="Planora Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} className="animate-pulse" />
      <span style={{ 
        fontSize: '42px', 
        fontWeight: 700, 
        color: 'var(--text-main)', 
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '-0.04em',
        transform: 'translateY(-2px)'
      }}>planora</span>
    </motion.div>
    <style>{`
      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.95); }
      }
    `}</style>
  </div>
)

const routeConfig = [
  {
    path: '/',
    element: <Suspense fallback={<LoadingScreen />}><Landing /></Suspense>,
  },
  {
    path: '/login',
    element: <Suspense fallback={<LoadingScreen />}><Auth mode="login" /></Suspense>,
  },
  {
    path: '/signup',
    element: <Suspense fallback={<LoadingScreen />}><Auth mode="signup" /></Suspense>,
  },
  {
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: '/dashboard', element: <Suspense fallback={<LoadingScreen />}><Dashboard /></Suspense> },
      { path: '/calendar', element: <Suspense fallback={<LoadingScreen />}><CalendarView /></Suspense> },
      { path: '/content', element: <Suspense fallback={<LoadingScreen />}><ContentLibrary /></Suspense> },
      { path: '/analytics', element: <Suspense fallback={<LoadingScreen />}><Analytics /></Suspense> },
      { path: '/ai-assistant', element: <Suspense fallback={<LoadingScreen />}><AIAssistant /></Suspense> },
      { path: '/campaigns', element: <Suspense fallback={<LoadingScreen />}><Campaigns /></Suspense> },
      { path: '/profile', element: <Suspense fallback={<LoadingScreen />}><Profile /></Suspense> },
      { path: '/settings', element: <Suspense fallback={<LoadingScreen />}><Settings /></Suspense> },
      { path: '/settings/:section', element: <Suspense fallback={<LoadingScreen />}><Settings /></Suspense> },
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]

const router = Capacitor.isNativePlatform()
  ? createHashRouter(routeConfig)
  : createBrowserRouter(routeConfig)

function App() {
  const { session, setSession, syncUserProfile } = useAppStore()

  // Inactivity Timer Logic
  useEffect(() => {
    if (!session) return;

    let timeoutId;
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

    const logout = () => {
      supabase.auth.signOut();
      hardNavigate('/login');
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(logout, INACTIVITY_LIMIT);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [session]);

  // Load complete user data from Supabase
  const loadUserData = async (userId, authUser) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      const { data: socials, error: socialsError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', userId)

      // Build user data with fallbacks for 404 errors
      const userData = {
        name: profile?.full_name || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || 'User',
        email: profile?.email || authUser?.email || '',
        avatar: profile?.avatar_url || authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || '',
        role: profile?.role || 'creator',
        location: profile?.location || '',
        website: profile?.website || 'creator',
        bio: profile?.bio || '',
        themeColor: profile?.theme_color || '#BE8755',
        ...(settings && {
          aiPosting: settings.ai_posting,
          weeklyReports: settings.weekly_reports,
          emailNotifications: settings.email_notifications,
          pushNotifications: settings.push_notifications,
          smsNotifications: settings.sms_notifications,
          newsletter: settings.newsletter,
          announcements: settings.announcements,
          theme: settings.theme,
          reducedMotion: settings.reduced_motion,
          highContrast: settings.high_contrast,
          twoFactor: settings.two_factor,
          language: settings.language,
          timezone: settings.timezone,
          workspaceName: settings.workspace_name,
          workspaceUrl: settings.workspace_url,
        }),
        socialAccounts: socials?.map(s => ({
          id: s.id,
          platform: s.platform,
          handle: s.handle,
          connected: s.connected
        })) || [
          { id: 1, platform: 'Instagram', handle: '@user', connected: false },
          { id: 2, platform: 'Twitter', handle: '@user', connected: false },
          { id: 3, platform: 'LinkedIn', handle: 'user', connected: false }
        ]
      }

      syncUserProfile(userData)
      
      // Parallel, scoped fetching of user-specific database records & AI assistant chats
      useAppStore.getState().fetchPostsFromSupabase(userId)
      useAppStore.getState().fetchCampaignsFromSupabase(userId)
      useChatStore.getState().loadUserChats(userId)
    } catch (error) {
      console.warn('Error loading user data from Supabase (tables may not exist yet):', error)
      // Fallback to basic auth user data
      syncUserProfile({
        name: authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || 'User',
        email: authUser?.email || '',
        avatar: authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || '',
        role: 'creator',
        location: '',
        website: 'creator',
        socialAccounts: [
          { id: 1, platform: 'Instagram', handle: '@user', connected: false },
          { id: 2, platform: 'Twitter', handle: '@user', connected: false },
          { id: 3, platform: 'LinkedIn', handle: 'user', connected: false }
        ]
      })

      // Attempt to load remaining user components
      useAppStore.getState().fetchPostsFromSupabase(userId)
      useAppStore.getState().fetchCampaignsFromSupabase(userId)
      useChatStore.getState().loadUserChats(userId)
    }
  }

  // Auth State Management
  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        loadUserData(session.user.id, session.user)
      } else {
        // Safe reset if no session is active on startup
        useAppStore.getState().resetStore()
        useChatStore.getState().loadUserChats(null)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      
      if (session?.user) {
        loadUserData(session.user.id, session.user)
      } else {
        // Safe reset on explicit sign-out or session expiration
        useAppStore.getState().resetStore()
        useChatStore.getState().loadUserChats(null)
      }
      
      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        // Handle explicit sign out or session expiration
        if (!session && !isPublicAuthRoute()) {
          hardNavigate('/login');
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [setSession, syncUserProfile])

  return <RouterProvider router={router} />
}

export default App
