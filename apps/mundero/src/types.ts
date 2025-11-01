// User and Profile types
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  username: string;
  title?: string;
  bio?: string;
  location?: string;
  skills: string[];
  public_profile: boolean;
  created_at: string;
  updated_at: string;
}

// Application types
export interface App {
  id: string;
  name: string;
  identifier: string;
  description: string;
  icon_url?: string;
  app_url: string;
  roles: string[];
  version: string;
  created_at: string;
}

// Chat types
export interface Chat {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: any;
  createdAt: any;
  updatedAt: any;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: any;
}

// Auth types
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
