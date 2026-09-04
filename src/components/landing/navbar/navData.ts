export interface NavLinkItem {
  label: string
  mobileLabel?: string
  to: { name: string; params?: Record<string, any> }
  icon?: string
  ping?: boolean
}

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Inicio', to: { name: 'home' } },
  { label: 'Ranking', to: { name: 'ranking' }, ping: true },
  { label: 'Salas', mobileLabel: 'Salas Competitivas', to: { name: 'multiplayer-lobby' }, icon: 'bi bi-people-fill' },
  { label: 'About', to: { name: 'about' } }
]
