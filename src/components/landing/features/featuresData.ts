export interface FeatureItem {
  icon: string
  title: string
  desc: string
  tag: string
  color: 'amber' | 'pink'
}

export const FEATURES_DATA: FeatureItem[] = [
  {
    icon: 'bi-lightning-charge-fill',
    title: 'Velocidad Mental',
    desc: 'Pon a prueba tus reflejos en partidas contrarreloj donde cada milisegundo cuenta para tu puntuación final.',
    tag: 'Desafío',
    color: 'amber'
  },
  {
    icon: 'bi-stars',
    title: 'Mecánicas Místicas',
    desc: '12 pares de cartas distribuidas aleatoriamente en cada inicio. Ninguna partida es igual a la anterior.',
    tag: 'Estrategia',
    color: 'pink'
  },
  {
    icon: 'bi-trophy-fill',
    title: 'Ranking de Campeones',
    desc: 'Compite contra jugadores de todo el mundo. Sincroniza tus mejores tiempos directamente con Firebase.',
    tag: 'Competitivo',
    color: 'amber'
  },
  {
    icon: 'bi-shield-shaded',
    title: 'Perfil de Guerrero',
    desc: 'Inicia sesión con un solo clic a través de Google o correo para guardar tus récords y desbloquear logros.',
    tag: 'Progresión',
    color: 'pink'
  }
]
