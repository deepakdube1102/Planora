import { supabase } from './supabase'

const useProxy = import.meta.env.VITE_USE_AI_PROXY === 'true'

export function isAiProxyEnabled() {
  return useProxy
}

/**
 * Generate caption/ideas/hashtags via Supabase Edge Function (keeps Gemini key off the client).
 */
export async function generateContentViaProxy(prompt, type = 'caption') {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Sign in required for AI generation')
  }

  const base = import.meta.env.VITE_SUPABASE_URL
  const res = await fetch(`${base}/functions/v1/planora-gemini`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ prompt, type }),
  })

  const payload = await res.json()
  if (!res.ok) throw new Error(payload.error || 'AI proxy request failed')
  return payload.text
}
