export interface User {
  id: string
  username: string
  email: string
  profileImageUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Collectible {
  id: string
  name: string
  source: string // Filme/Série/Desenho
  year: string
  condition: 'novo' | 'usado'
  isForTrade: boolean
  imageUrls: string[]
  ownerId: string
  ownerUsername: string
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  senderId: string
  senderUsername: string
  receiverId: string
  receiverUsername: string
  text: string
  isRead: boolean
  createdAt: Date
}

export interface Conversation {
  id: string
  participants: string[]
  collectibleId?: string
  collectibleName?: string
  collectibleImageUrl?: string
  lastMessage?: ChatMessage
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

export interface SearchFilters {
  trade: 'todos' | 'sim' | 'nao'
  condition: 'todos' | 'novo' | 'usado'
  year?: string
  source?: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
  profileImage?: File
}

export interface UpdateProfileData {
  username?: string
  email?: string
  profileImage?: File
}

export interface CreateCollectibleData {
  name: string
  source: string
  year: string
  condition: 'novo' | 'usado'
  isForTrade: boolean
  images: File[]
}

export interface UpdateCollectibleData extends Partial<CreateCollectibleData> {
  id: string
}
