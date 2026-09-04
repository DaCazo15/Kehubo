export interface FooterNavLink {
  name: string
  to: { name: string }
  icon: string
}

export interface FooterContactLink {
  label: string
  href: string
  icon: string
  isExternal: boolean
}

export type LegalDocType = 'privacy' | 'terms' | 'presskit' | 'imprint'

export interface FooterLegalLink {
  id: LegalDocType
  label: string
  icon: string
}

export const FOOTER_NAV_LINKS: FooterNavLink[] = [
  { name: 'Inicio', to: { name: 'home' }, icon: 'bi-house-door-fill' },
  { name: 'Salas Competitivas', to: { name: 'multiplayer-lobby' }, icon: 'bi-people-fill' },
  { name: 'Juego Rápido', to: { name: 'game-rapido' }, icon: 'bi-play-circle-fill' },
  { name: 'Ranking Global', to: { name: 'ranking' }, icon: 'bi-trophy-fill' },
  { name: 'Acerca de Kehubo', to: { name: 'about' }, icon: 'bi-info-circle-fill' }
]

export const FOOTER_CONTACT_LINKS: FooterContactLink[] = [
  { label: '+58 414 819 7912', href: 'tel:+584148197912', icon: 'bi-telephone-fill', isExternal: true },
  { label: 'dcazorla.0190@gmail.com', href: 'mailto:dcazorla.0190@gmail.com', icon: 'bi-envelope-fill', isExternal: true },
  { label: 'Portafolio Web', href: 'https://dacazo15.netlify.app/', icon: 'bi-globe2', isExternal: true },
  { label: 'GitHub', href: 'https://github.com/DaCazo15', icon: 'bi-github', isExternal: true },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/danielcp5150190/', icon: 'bi-linkedin', isExternal: true }
]

export const FOOTER_LEGAL_LINKS: FooterLegalLink[] = [
  { id: 'privacy', label: 'Políticas de Privacidad', icon: 'bi-shield-check' },
  { id: 'terms', label: 'Términos y Condiciones', icon: 'bi-file-earmark-text' },
  { id: 'presskit', label: 'Press Kit', icon: 'bi-megaphone-fill' },
  { id: 'imprint', label: 'Imprint', icon: 'bi-journal-bookmark-fill' }
]
