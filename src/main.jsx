import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext'

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
