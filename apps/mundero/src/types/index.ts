export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  title?: string
  bio?: string
  location?: string
  username: string
  skills: string[]
  public_profile: boolean
  created_at: string
  updated_at: string
}

export interface App {
  id: string
  name: string
  identifier: string
  description: string
  icon_url?: string
  app_url: string
  roles: string[]
  version: string
  created_at: string
}

export interface UserRole {
  id: string
  user_id: string
  app_id: string
  role: string
  status: 'pending' | 'approved' | 'revoked'
  assigned_by?: string
  created_at: string
}