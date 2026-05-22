import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { supabase } from './supabase'
import { isNativeApp, NATIVE_OAUTH_REDIRECT } from './native'

let listenerHandle = null

function parseAuthCodeFromUrl(url) {
  try {
    const withHost = url.includes('://') ? url.replace(/^[^:]+:\/\//, 'https://x/') : url
    const parsed = new URL(withHost.startsWith('http') ? withHost : `https://x/${withHost}`)
    return parsed.searchParams.get('code')
  } catch {
    const match = url.match(/[?&]code=([^&]+)/)
    return match ? decodeURIComponent(match[1]) : null
  }
}

function parseAuthErrorFromUrl(url) {
  try {
    const withHost = url.includes('://') ? url.replace(/^[^:]+:\/\//, 'https://x/') : url
    const parsed = new URL(withHost.startsWith('http') ? withHost : `https://x/${withHost}`)
    return parsed.searchParams.get('error_description') || parsed.searchParams.get('error')
  } catch {
    return null
  }
}

async function handleOAuthCallbackUrl(url) {
  if (!url || !url.startsWith(NATIVE_OAUTH_REDIRECT)) return

  try {
    await Browser.close()
  } catch {
    /* already closed */
  }

  const authError = parseAuthErrorFromUrl(url)
  if (authError) {
    console.error('OAuth error:', authError)
    return
  }

  const code = parseAuthCodeFromUrl(url)
  if (!code) {
    console.warn('OAuth callback missing code')
    return
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) console.error('exchangeCodeForSession:', error.message)
}

/** Call once at app startup on native. */
export function initNativeOAuthListener() {
  if (!isNativeApp || listenerHandle) return

  App.addListener('appUrlOpen', ({ url }) => {
    void handleOAuthCallbackUrl(url)
  }).then((handle) => {
    listenerHandle = handle
  })
}

export async function signInWithGoogleNative() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: NATIVE_OAUTH_REDIRECT,
      skipBrowserRedirect: true,
      queryParams: { prompt: 'select_account' },
    },
  })

  if (error) throw error
  if (!data?.url) throw new Error('No OAuth URL returned from Supabase')

  await Browser.open({ url: data.url, presentationStyle: 'fullscreen' })
}
