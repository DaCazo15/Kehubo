import type { UserGender } from '../types'

export const maleAvatars: string[] = [
  new URL('../assets/perfil-user/male/1.png', import.meta.url).href,
  new URL('../assets/perfil-user/male/2.png', import.meta.url).href,
  new URL('../assets/perfil-user/male/3.png', import.meta.url).href,
  new URL('../assets/perfil-user/male/4.png', import.meta.url).href,
  new URL('../assets/perfil-user/male/5.png', import.meta.url).href,
]

export const femaleAvatars: string[] = [
  new URL('../assets/perfil-user/female/7.png', import.meta.url).href,
  new URL('../assets/perfil-user/female/8.png', import.meta.url).href,
  new URL('../assets/perfil-user/female/9.png', import.meta.url).href,
  new URL('../assets/perfil-user/female/10.png', import.meta.url).href,
  new URL('../assets/perfil-user/female/11.png', import.meta.url).href,
]

export interface SystemAvatar {
  id: string
  gender: UserGender
  src: string
}

export const allSystemAvatars: SystemAvatar[] = [
  ...maleAvatars.map((src, i) => ({ id: `male-${i + 1}`, gender: 'hombre' as UserGender, src })),
  ...femaleAvatars.map((src, i) => ({ id: `female-${i + 7}`, gender: 'mujer' as UserGender, src })),
]

export function getDefaultAvatarByGender(gender: string = 'hombre'): string {
  if (gender === 'mujer') {
    return femaleAvatars[0]
  }
  return maleAvatars[0]
}
