import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext'
import { initNativeOAuthListener } from './lib/oauthNative'
import { initNativePush } from './lib/pushNative'

async function initCapacitorNative() {
  if (!Capacitor.isNativePlatform()) return
  document.documentElement.classList.add('capacitor-native')
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await StatusBar.setStyle({ style: Style.Light })
    await SplashScreen.hide()
  } catch (err) {
    console.warn('Native shell init:', err)
  }
}

void initCapacitorNative()
initNativeOAuthListener()
void initNativePush()

// ══ CLOCK SKEW RESILIENCY PATCH ══
// Compensates for client device clock being slightly behind the Supabase Auth server.
// Adds a safe +15s offset to Date and Date.now() so OAuth sessions are never rejected as "issued in the future".
const SKEW_OFFSET = 15000;
const originalDateNow = Date.now;
const OriginalDate = Date;

Date.now = function() {
  return originalDateNow() + SKEW_OFFSET;
};

const PatchedDate = new Proxy(OriginalDate, {
  construct(target, args) {
    if (args.length === 0) {
      return new target(originalDateNow() + SKEW_OFFSET);
    }
    return new target(...args);
  },
  apply(target, thisArg, args) {
    if (args.length === 0) {
      return new target(originalDateNow() + SKEW_OFFSET).toString();
    }
    return target.apply(thisArg, args);
  }
});

window.Date = PatchedDate;
// ═════════════════════════════════

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
