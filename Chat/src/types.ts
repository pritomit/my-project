export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  createdAt: number;
  lastSeen: number;
  isOnline: boolean;
  avatarUrl?: string;
  role: UserRole;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: number;
  reaction?: string;
  isRead: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'file';
  fileName?: string;
}

export interface ChatThread {
  id: string;
  userId: string;
  username: string;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadAdminCount: number;
  unreadUserCount: number;
  userOnline: boolean;
  lastSeen: number;
  isTyping?: boolean;
  createdAt: number;
}

export interface SystemInfo {
  appVersion: string;
  onlineUsersCount: number;
  totalThreadsCount: number;
  totalMessagesCount: number;
}
