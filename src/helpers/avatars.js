export const maleAvatars = [
  new URL('../assets/perfil-user/male/1.png', import.meta.url).href,
  new URL('../assets/perfil-user/male/2.png', import.meta.url).href,
  new URL('../assets/perfil-user/male/3.png', import.meta.url).href,
  new URL('../assets/perfil-user/male/4.png', import.meta.url).href,
  new URL('../assets/perfil-user/male/5.png', import.meta.url).href,
  new URL('../assets/perfil-user/male/6.png', import.meta.url).href,
]

export const femaleAvatars = [
  new URL('../assets/perfil-user/female/7.png', import.meta.url).href,
  new URL('../assets/perfil-user/female/8.png', import.meta.url).href,
  new URL('../assets/perfil-user/female/9.png', import.meta.url).href,
  new URL('../assets/perfil-user/female/10.png', import.meta.url).href,
  new URL('../assets/perfil-user/female/11.png', import.meta.url).href,
]

export const allSystemAvatars = [
  ...maleAvatars.map((src, i) => ({ id: `male-${i + 1}`, gender: 'hombre', src })),
  ...femaleAvatars.map((src, i) => ({ id: `female-${i + 7}`, gender: 'mujer', src })),
]

export function getDefaultAvatarByGender(gender = 'hombre') {
  if (gender === 'mujer') {
    return femaleAvatars[0]
  }
  return maleAvatars[0]
}
