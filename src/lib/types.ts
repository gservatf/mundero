export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: string;
  rol: string; // Adding this to match the expected interface
  emailVerified: boolean;
  provider?: string;
  empresa: {
    id: string;
    nombre: string;
    ruc: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  photo_url: string;
  role: string;
  emailVerified: boolean;
  empresa: {
    id: string;
    nombre: string;
    ruc: string;
  };
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  chatId: string;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: number;
}

export interface Story {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  timestamp: number;
  expiresAt: number;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  timestamp: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface Company {
  id: string;
  nombre: string;
  ruc: string;
  description?: string;
  logo?: string;
}

export interface Commission {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: number;
}

export interface Settings {
  appName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  allowRegistration: boolean;
  maintenanceMode: boolean;
}