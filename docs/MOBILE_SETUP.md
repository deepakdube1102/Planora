# Planora Android — OAuth, Push, and AI proxy

## 1. Supabase Auth (Google on Android)

In [Supabase Dashboard](https://supabase.com/dashboard) → **Authentication** → **URL configuration**, add:

| Type | URL |
|------|-----|
| Redirect URL | `com.planora.app://oauth/callback` |

Keep your existing web redirect URLs (e.g. production site and `http://localhost:5173` for Vite dev).

Google sign-in on device opens the system browser, then returns to the app via that deep link (PKCE).

## 2. Firebase Cloud Messaging (push)

1. Create a Firebase project and add an **Android** app with package name `com.planora.app`.
2. Download `google-services.json` and place it at:

   `android/app/google-services.json`

3. Rebuild:

   ```bash
   nvm use 22
   npm run build:mobile
   npm run android:open
   ```

4. Run the SQL migration on your Supabase project (SQL editor or CLI):

   `supabase/migrations/20250522000000_push_device_token.sql`

Push registration runs when the user enables **Push Notifications** in Settings (native only). Tokens are stored in `user_settings.push_device_token`.

Sending notifications requires a backend job or Supabase Edge Function that calls FCM with the stored token (not included yet).

## 3. Gemini via Edge Function (no API key in the APK)

Deploy the function and set secrets:

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_key
supabase functions deploy planora-gemini
```

In `.env` for **production mobile builds**, prefer:

```env
VITE_USE_AI_PROXY=true
# Do not ship VITE_GEMINI_KEY in mobile release builds
```

- **useAI** hooks (caption/ideas/hashtags) use the proxy on native automatically, or when `VITE_USE_AI_PROXY=true`.
- **AI Assistant** streaming (`src/services/gemini.js`) still uses the client key until a streaming edge endpoint is added.
