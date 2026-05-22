-- Store FCM device tokens for native push (Android/iOS)
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS push_device_token TEXT,
  ADD COLUMN IF NOT EXISTS push_platform TEXT;
