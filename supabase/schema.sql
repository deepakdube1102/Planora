-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT,
  location TEXT,
  website TEXT,
  bio TEXT,
  theme_color TEXT DEFAULT '#BE8755',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_settings table for persistent settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  -- Notification Settings
  ai_posting BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  newsletter BOOLEAN DEFAULT true,
  announcements BOOLEAN DEFAULT false,
  -- Appearance Settings
  theme TEXT DEFAULT 'Light',
  reduced_motion BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  -- General Settings
  language TEXT DEFAULT 'English',
  timezone TEXT DEFAULT '(GMT+05:30) Mumbai, Kolkata, New Delhi',
  workspace_name TEXT,
  workspace_url TEXT,
  -- Security
  two_factor BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create social_accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  handle TEXT,
  connected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, platform)
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  objective TEXT,
  color TEXT DEFAULT '#BE8755',
  posts_count INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  media_url TEXT,
  platform TEXT NOT NULL, -- 'instagram', 'twitter', 'linkedin', 'facebook'
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'published'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create queue_settings table for automated scheduling
CREATE TABLE IF NOT EXISTS queue_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sun, 6=Sat (nullable for specific_date)
  specific_date DATE, -- For one-time slots
  posting_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT slot_type_check CHECK (
    (day_of_week IS NOT NULL AND specific_date IS NULL) OR 
    (day_of_week IS NULL AND specific_date IS NOT NULL)
  )
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User settings policies
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Social accounts policies
CREATE POLICY "Users can view their own social accounts" ON social_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own social accounts" ON social_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social accounts" ON social_accounts
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social accounts" ON social_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Users can view their own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Queue settings policies
CREATE POLICY "Users can manage their own queue settings" ON queue_settings
  FOR ALL USING (auth.uid() = user_id);

-- Campaigns policies
CREATE POLICY "Users can view their own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role, website, location)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url', 'creator', 'creator', '');
  
  -- Create default user settings
  INSERT INTO public.user_settings (user_id, workspace_name, workspace_url)
  VALUES (new.id, (new.raw_user_meta_data->>'full_name') || '''s Workspace', lower(replace(new.raw_user_meta_data->>'full_name', ' ', '-')) || '.planora.com');
  
  -- Insert default social accounts
  INSERT INTO public.social_accounts (user_id, platform, handle, connected) VALUES
    (new.id, 'Instagram', '@' || lower(replace(new.raw_user_meta_data->>'full_name', ' ', '_')), false),
    (new.id, 'Twitter', '@' || lower(replace(new.raw_user_meta_data->>'full_name', ' ', '_')), false),
    (new.id, 'LinkedIn', new.raw_user_meta_data->>'full_name', false),
    (new.id, 'Facebook', new.raw_user_meta_data->>'full_name', false),
    (new.id, 'YouTube', new.raw_user_meta_data->>'full_name', false);
  
  -- Insert some default queue slots for new users
  INSERT INTO public.queue_settings (user_id, day_of_week, posting_time)
  VALUES 
    (new.id, 1, '10:00:00'), -- Mon 10 AM
    (new.id, 3, '18:00:00'), -- Wed 6 PM
    (new.id, 5, '14:00:00'); -- Fri 2 PM
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
