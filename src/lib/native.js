import { Capacitor } from '@capacitor/core'

export const isNativeApp = Capacitor.isNativePlatform()

/** Deep link registered in AndroidManifest + Supabase Auth redirect allow list */
export const NATIVE_OAUTH_REDIRECT = 'com.planora.app://oauth/callback'

/** Full page navigation (e.g. after sign-out). Hash routes on Capacitor WebView. */
export function hardNavigate(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (isNativeApp) {
    window.location.hash = `#${normalized}`
    return
  }
  window.location.assign(normalized)
}

export function getAuthRedirectUrl() {
  if (isNativeApp) {
    return NATIVE_OAUTH_REDIRECT
  }
  return window.location.origin + window.location.pathname
}

export function isPublicAuthRoute() {
  if (isNativeApp) {
    const hash = window.location.hash.replace(/^#/, '') || '/'
    const path = hash.split('?')[0]
    return path === '/' || path === '/login' || path === '/signup'
  }
  const path = window.location.pathname
  return path === '/' || path === '/login' || path === '/signup'
}
