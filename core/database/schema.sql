-- MUNDERO v1.1 Database Schema
-- Capitalizing existing Firebase + Supabase hybrid auth

-- User profiles (public profiles with username URLs)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  title TEXT,
  bio TEXT,
  location TEXT,
  username TEXT UNIQUE,
  skills TEXT[],
  public_profile BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apps registered in the ecosystem
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  identifier TEXT UNIQUE NOT NULL,  -- e.g., 'legality360'
  description TEXT,
  icon_url TEXT,
  app_url TEXT,
  roles TEXT[] DEFAULT '{}',        -- valid roles for the app
  api_key_hash TEXT,                -- hash of the API KEY assigned by core
  version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles per app
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'approved',   -- pending|approved|revoked
  assigned_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, app_id)
);

-- Posts for the professional feed
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App access logs for auditing
CREATE TABLE IF NOT EXISTS app_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS user_profiles_username_idx ON user_profiles(username);
CREATE INDEX IF NOT EXISTS user_profiles_public_idx ON user_profiles(public_profile) WHERE public_profile = true;
CREATE INDEX IF NOT EXISTS apps_identifier_idx ON apps(identifier);
CREATE INDEX IF NOT EXISTS user_roles_user_idx ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS user_roles_app_idx ON user_roles(app_id);
CREATE INDEX IF NOT EXISTS posts_user_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_created_idx ON posts(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- User profiles: public read, own edit
CREATE POLICY "allow_read_public_profiles" ON user_profiles FOR SELECT USING (public_profile = true);
CREATE POLICY "allow_edit_own_profile" ON user_profiles FOR ALL TO authenticated USING (auth.uid() = id);

-- Apps: public read for registered apps
CREATE POLICY "allow_read_apps" ON apps FOR SELECT USING (true);
CREATE POLICY "allow_admin_manage_apps" ON apps FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN apps a ON ur.app_id = a.id 
    WHERE ur.user_id = auth.uid() 
    AND a.identifier = 'mundero' 
    AND ur.role = 'admin'
  )
);

-- User roles: users can see their own roles, admins can manage
CREATE POLICY "allow_read_own_roles" ON user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "allow_admin_manage_roles" ON user_roles FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN apps a ON ur.app_id = a.id 
    WHERE ur.user_id = auth.uid() 
    AND a.identifier = 'mundero' 
    AND ur.role = 'admin'
  )
);

-- Posts: public read, authenticated create/edit own
CREATE POLICY "allow_read_posts" ON posts FOR SELECT USING (true);
CREATE POLICY "allow_create_posts" ON posts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "allow_edit_own_posts" ON posts FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- App logs: admin read only
CREATE POLICY "allow_admin_read_logs" ON app_logs FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN apps a ON ur.app_id = a.id 
    WHERE ur.user_id = auth.uid() 
    AND a.identifier = 'mundero' 
    AND ur.role = 'admin'
  )
);