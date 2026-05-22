import { PushNotifications } from '@capacitor/push-notifications'
import { supabase } from './supabase'
import { isNativeApp } from './native'

let listenersReady = false

async function savePushToken(token) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: user.id,
        push_device_token: token,
        push_platform: token ? 'android' : null,
      },
      { onConflict: 'user_id' },
    )

  if (error) {
    console.warn('Could not save push token (run supabase migration?):', error.message)
  }
}

async function ensurePushListeners() {
  if (!isNativeApp || listenersReady) return
  listenersReady = true

  await PushNotifications.addListener('registration', (ev) => {
    void savePushToken(ev.value)
  })

  await PushNotifications.addListener('registrationError', (err) => {
    console.warn('Push registration error:', err)
  })
}

/**
 * Request permission and register for FCM when user enables push (native only).
 * @returns {Promise<boolean>} true if registration was attempted and permission granted
 */
export async function syncPushRegistration(enabled) {
  if (!isNativeApp) return false

  await ensurePushListeners()

  if (!enabled) {
    await savePushToken(null)
    return true
  }

  let perm = await PushNotifications.checkPermissions()
  if (perm.receive === 'prompt') {
    perm = await PushNotifications.requestPermissions()
  }
  if (perm.receive !== 'granted') {
    return false
  }

  await PushNotifications.register()
  return true
}

/** Attach listeners; re-register if user already opted in. */
export async function initNativePush() {
  if (!isNativeApp) return
  await ensurePushListeners()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return

  const { data: settings } = await supabase
    .from('user_settings')
    .select('push_notifications')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (settings?.push_notifications !== false) {
    await syncPushRegistration(true)
  }
}
