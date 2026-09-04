/**
 * Definiciones de Tipos de Dominio para Kehubo Game
 */

export interface Card {
  id: number
  valor: number | null
  revelada: boolean
  encontrada: boolean
}

export interface RoomConfig {
  cardCount: number
  cartasVisibles: boolean
  deck?: Card[]
}

export type RoomStatus = 'waiting' | 'starting' | 'playing' | 'finished'

export interface Room {
  id: string
  code: string
  hostId: string
  status: RoomStatus
  maxPlayers: number
  config: RoomConfig
  round?: number
  restartTrigger?: number
  createdAt?: any
  startedAt?: any
}

export type MultiplayerRoom = Room

export interface RoomPlayer {
  id?: string
  uid: string
  displayName: string
  photoURL?: string
  country?: string
  isHost: boolean
  score: number
  pairsFound: number
  status: 'ready' | 'playing' | 'finished'
  finishTime?: string | null
  finishSeconds?: number | null
  joinedAt?: any
}

export interface ScoreRecord {
  id?: string
  userId?: string
  uid?: string
  name?: string
  displayName: string
  photoURL?: string
  country?: string
  score: number
  time?: string
  seconds?: number
  difficulty?: number
  cartasVisibles?: boolean
  rank?: number
  pairsFound?: number
  dificultad?: number
  timeFormatted?: string
  timeSeconds?: number
  createdAt?: any
}

export type UserGender = 'hombre' | 'mujer'

export interface UserProfile {
  uid: string
  email?: string
  displayName: string
  photoURL?: string | null
  genero?: UserGender | string
  country?: string
  googlePhotoURL?: string | null
  authProvider?: 'google' | 'password' | string
  bestTime?: string
  bestSeconds?: number | null
  friendsCount?: number
  avatarStoragePath?: string | null
  totalScore?: number
  gamesPlayed?: number
  createdAt?: any
  updatedAt?: any
}

export interface FriendItem {
  id?: string
  uid: string
  displayName: string
  photoURL?: string
  country?: string
  createdAt?: any
  since?: any
}

export type NotificationType = 
  | 'friend_request' 
  | 'friend_accepted' 
  | 'record_beaten' 
  | 'game_invite' 
  | 'rank_beat' 
  | string

export interface NotificationItem {
  id: string
  targetUserId?: string
  senderUserId?: string
  senderName?: string
  senderAvatar?: string
  senderCountry?: string
  type?: NotificationType
  title?: string
  message?: string
  score?: number
  time?: string
  seconds?: number
  difficulty?: number
  read: boolean
  status?: 'pending' | 'accepted' | 'rejected' | string
  createdAt?: any
  timestamp?: any
  metadata?: Record<string, any>
}

export interface CountryInfo {
  code: string
  name: string
  flag: string
}
