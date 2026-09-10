<p align="center">
  <img src="src/assets/logo/isologo.png" alt="Kehubo Logo" width="220px" />
</p>

# Kehubo — Plataforma de Juego de Memoria Táctica en Tiempo Real

> Videojuego web de emparejamiento táctico de cartas con partidas multijugador en tiempo real por salas privadas, leaderboard dinámico, sistema de ranking global, perfiles personalizables, arquitectura modular, compresión binaria de medios (AVIF) y motor de audio en streaming.

**Demo en vivo:** [https://kehubo.vercel.app/](https://kehubo.vercel.app/)

---

## Gameplay en Vivo

<p align="center">
  <img src="src/assets/gif/gameplay.gif" alt="Kehubo Gameplay en Vivo" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</p>

---

## Stack Técnico

### Frontend
- **Vue 3** (Composition API, `<script setup>`, Reactividad Nativa)
- **Vite** (Bundler y entorno de desarrollo de ultra-alto rendimiento)
- **TypeScript** (Tipado estricto en tipos de dominio, componentes y composables)
- **Pinia** (Gestión de estado global centralizado para autenticación, usuario y notificaciones)
- **Vue Router** (Enrutamiento SPA con rutas dinámicas nombradas y guardias de navegación)
- **Tailwind CSS 4** (Diseño moderno, dark mode, glassmorphism y micro-animaciones)
- **Anime.js & GSAP** (Animaciones tácticas de cartas, conteo regresivo y efectos de portal)
- **Bootstrap Icons** (Iconografía vectorial optimizada)

### Backend, Base de Datos y Servicios
- **Firebase Authentication** (Autenticación segura vía Email/Password y Google OAuth)
- **Cloud Firestore** (Base de datos NoSQL reactiva para estado de salas y sincronización en tiempo real)
- **Firebase Storage** (Almacenamiento en la nube de avatares de usuario)
- **Firebase Cloud Functions (2nd Gen)** (Generación server-side del mazo y verificación criptográfica de cartas)
- **Node.js & Express** (Servidor backend dedicado para procesamiento y compresión de medios)
- **Sharp** (Pipeline de manipulación y compresión de imágenes en memoria a formato AVIF)
- **Helmet & Express Rate Limit** (Seguridad de cabeceras HTTP y protección contra abuso y DoS)
- **Vercel** (Despliegue de frontend y backend serverless)

### Testing & Calidad de Código
- **Vitest** (Test runner de pruebas unitarias y de integración rápida)
- **@vue/test-utils & JSDOM** (Pruebas de componentes y composables reactivos)
- **Vue Component Modularizer Skill** (Arquitectura desacoplada basada en orquestadores y subcomponentes)

---

## Características Principales

- **Arquitectura de Componentes Modular**: Estructura desacoplada con orquestadores limpios y subcomponentes atómicos (`navbar`, `hero`, `features`, `footer`, `profile`, `multiplayer`, `ranking`) respaldados por un Design System unificado (`BaseButton`, `BaseModal`).
- **Autenticación y Perfiles**: Registro e inicio de sesión con validación en dos columnas, persistencia de sesión, selección de género y nacionalidad con banderas dinámicas.
- **Optimización de Activos a AVIF con Sharp**: Procesamiento binario en servidor para avatares y pre-optimización en build-time de 40 cartas ilustradas de animales a formato `.avif` de ultra-bajo peso (reducción superior al 94%, bajando de ~200 KB a sólo 5–14 KB por activo).
- **Mazos Temáticos Personalizables**: Selección de tipo de mazo entre **Números**, **Letras** y **Animales Ilustrados**, configurable tanto en partidas individuales/rápidas como en salas multijugador sincronizadas en tiempo real.
- **Motor de Audio Ligero y Streaming**: Sistema de música ambiental aleatoria seleccionada entre 4 pistas con streaming nativo HTML5 (`preload="metadata"`), cero saturación de RAM/CPU, inicio sincronizado al finalizar el conteo regresivo de 5s y rotación continua automática al terminar cada pista.
- **Modo Contrarreloj (Un Jugador) & Modo Rápido**: 4 dificultades tácticas (16, 24, 32 y 40 cartas), cálculo de puntuación dinámica, cartas viradas opcionales y modal de pausa táctica.
- **Motor Responsive Móvil con Adaptación a `visualViewport`**: Cálculo dinámico de altura neta que descuenta los contenedores superiores (logo y puntaje) y divide el espacio restante entre el número de filas (6 u 8 filas), garantizando cartas simétricas 3:4 sin desbordes.
- **Multijugador en Tiempo Real por Salas Privadas**: Creación de salas de hasta 4 jugadores con código alfanumérico único (`KH-XXXX`) o enlace directo.
- **Leaderboard Dinámico en Vivo**: Barra lateral interactiva que reordena automáticamente a los jugadores en tiempo real de mayor a menor puntuación y pares encontrados durante la partida.
- **Sistema de Temporadas y Clasificación Global**: Banners flotantes con conteo regresivo de temporada y tabla de ranking competitivo persistida en Firestore.
- **Sistema Social y Notificaciones**: Envío y recepción de solicitudes de amistad en tiempo real con aceptación/rechazo y listas de amigos sincronizadas.

---

## Galería de la Interfaz

<p align="center">
  <img src="src/assets/screenshot/home.png" alt="Landing Page y Hero Section" width="100%" style="border-radius: 8px; margin-bottom: 12px;" />
</p>

<p align="center">
  <img src="src/assets/screenshot/rank.png" alt="Tabla de Ranking Global" width="49%" style="border-radius: 8px;" />
  <img src="src/assets/screenshot/profile.png" alt="Perfil de Usuario" width="49%" style="border-radius: 8px;" />
</p>

---

## Estructura del Proyecto y Modularización

El proyecto sigue una arquitectura desacoplada donde cada vista principal o sección compleja actúa como un **Orquestador**, delegando responsabilidades a subcomponentes especializados:

```
src/
├── assets/
│   ├── animales/           # Colección de 40 cartas de animales optimizadas en formato .avif
│   ├── logo/               # Identidad visual e isologos
│   ├── sounds/             # Pistas de música ambiental (1.mp3, 2.mp3, 3.mp3, 4.mp3)
│   └── screenshot/         # Capturas de la interfaz y demostración
├── components/
│   ├── common/             # Componentes base del Design System (BaseButton, BaseModal)
│   ├── game/               # CountdownOverlay, GameConfigModal, GamePauseModal, etc.
│   ├── landing/            # Landing page modular (navbar, hero, features, footer)
│   ├── multiplayer/        # LiveLeaderboard, RoomHeader, RoomPodiumModal, RoomWaitingLobby, etc.
│   ├── notifications/      # NotificationBell, NotificationItemCard, NotificationToast
│   ├── profile/            # ProfileHeader, ProfileStatsCard, ProfileMatchHistory, FriendsList, etc.
│   └── ranking/            # RankingPodium, RankingTable, SeasonFloatingBanner
├── composables/            # Lógica reactiva reutilizable
│   ├── useCardDeck.ts               # Generación y barajado de mazos (números, letras, animales)
│   ├── useCountdown.ts              # Temporizador de preparación de 5 segundos
│   ├── useCronometo.ts              # Cronómetro de partida con pausas
│   ├── useDynamicBoardHeight.ts     # Orquestación de dimensiones de tablero
│   ├── useGame.ts                   # Lógica central del modo un jugador y modo rápido
│   ├── useGameAudio.ts              # Motor de audio con streaming y reproducción continua
│   ├── useMobileBoardResponsive.ts  # Adaptación responsive pixel-perfect para móviles
│   ├── useMultiplayerRoom.ts        # Sincronización en tiempo real de salas multijugador
│   └── useSecurity.ts               # Protección contra fuerza bruta
├── helpers/                # Utilidades puras (animales.ts, sounds.ts, imageCompressor.ts)
├── stores/                 # Stores de Pinia (auth, notifications)
└── views/                  # Vistas SPA de Vue Router (Home, Game, Profile, Ranking, Multiplayer)
```

---

## 🏛️ Arquitectura del Sistema

<p align="center">
  <img src="docs/architecture.svg" alt="Arquitectura del Sistema Kehubo" width="100%" style="border-radius: 12px; box-shadow: 0 12px 36px rgba(0,0,0,0.6);" />
</p>

<p align="center">
  <a href="docs/architecture.html" target="_blank">
    <img src="https://img.shields.io/badge/🔍_Explorar_Diagrama_Interactivo-Archify_Showcase-6366f1?style=for-the-badge&logo=html5&logoColor=white" alt="Explorar Diagrama Interactivo" />
  </a>
</p>

> 💡 **Visor Interactivo:** Puedes abrir directamente [`docs/architecture.html`](docs/architecture.html) en tu navegador para inspeccionar cada nodo en detalle, activar el **Modo Presentación**, alternar temas (**Dark/Light**), aplicar **Zoom / Pan táctil** o filtrar por rutas guiadas.

### Desglose de Componentes Principales del Flujo

- **Capa de Presentación y Cliente Web (Vue 3 SPA)**:
  - **Vue 3 + Pinia + Tailwind CSS 4**: Experiencia reactiva ultra-rápida con orquestación modular de vistas y diseño glassmorphism.
  - **Motor Responsive Móvil (`useMobileBoardResponsive`)**: Cálculo dinámico en tiempo real basado en el `visualViewport`, adaptando el tablero sin desbordamientos.
  - **Motor de Audio Streaming (`useGameAudio`)**: Reproducción y rotación continua de pistas sin sobrecargar la memoria RAM ni bloquear el hilo principal.
- **Distribución en el Edge (Vercel Global CDN)**:
  - Enrutamiento estático de alto rendimiento y entrega de bundles optimizados a nivel mundial.
- **Ecosistema Firebase Serverless (Baja Latencia & Tiempo Real)**:
  - **Firebase Authentication**: Gestión de sesiones e identidad segura mediante Google OAuth y Email/Password con tokens JWT.
  - **Cloud Firestore**: Base de datos NoSQL con listeners reactivos `onSnapshot` para sincronización instantánea de salas, marcadores y solicitudes de amistad.
  - **Cloud Functions (2nd Gen — Anti-Cheat)**: Generación segura del mazo en `secret/deck` y RPC server-side `flipCard` para validar jugadas sin exponer valores en el cliente.
  - **Firebase Storage**: Repositorio en la nube para persistencia de avatares optimizados.
- **Backend Dedicado de Procesamiento Binario (Node.js & Express)**:
  - **Gateway de Seguridad**: Protección perimetral con cabeceras seguras (**Helmet**), CORS restringido y **Rate Limiting** estratificado.
  - **Motor de Compresión Sharp**: Pipeline nativo de transformación de imágenes a formato **AVIF** de alta fidelidad con más del 90% de reducción de peso.

---

## Medidas de Seguridad e Integridad

La seguridad del sistema está estructurada en múltiples capas defensivas:

- **Mazo Protegido en Servidor (Anti-Cheat)**:
  - Los valores reales de las cartas se generan en Cloud Functions y se almacenan en `rooms/{roomId}/secret/deck`, bloqueada por reglas de Firestore. El documento público de la sala únicamente expone cartas con `valor: null`, evitando la lectura anticipada en DevTools.
- **Rate Limiting Estratificado**:
  - *Límite Global*: 100 peticiones por ventana de 15 minutos por IP para proteger endpoints generales.
  - *Límite de Compresión Estricto*: 20 conversiones por minuto por IP en `/api/compress-avatar` para mitigar ataques de Denegación de Servicio (DoS) por sobrecarga de CPU.
- **Protección de Cabeceras y CORS con Allowlist**:
  - Integración de **Helmet** con políticas `cross-origin` y `same-origin-allow-popups` compatibles con Firebase Auth.
  - Middleware de **CORS restrictivo** que valida orígenes contra la variable de entorno `ALLOWED_ORIGIN`, impidiendo llamadas no autorizadas desde dominios externos.
- **Reglas de Seguridad Granulares en Firestore (`firestore.rules`)**:
  - *Propiedad Estricta*: Los documentos de `users/{userId}` y `scores/{scoreId}` solo pueden ser creados, modificados o eliminados si `request.auth.uid == userId` o `resource.data.uid == request.auth.uid`.
  - *Integridad de Puntuaciones y Pares*: En salas multijugador, las reglas de `players/{playerId}` rechazan escrituras donde `score` o `pairsFound` decrezcan arbitrariamente, y validan que `pairsFound` no exceda físicamente `config.cardCount / 2`.
  - *Control de Salas*: La creación exige estructura válida (`code`, `status: 'waiting'`, `maxPlayers <= 4`) y la gestión de ciclo de vida queda reservada al `hostId`.
- **Sistema Anti-Fuerza Bruta**:
  - Mecanismo de limitación que bloquea intentos sucesivos tras 5 fallos durante 60 segundos, validado mediante pruebas unitarias.

---

## Testing y Calidad

El proyecto cuenta con una suite automatizada de pruebas con **Vitest** cubriendo los componentes críticos de la lógica de negocio y seguridad:

```bash
✓ tests/unit/useCountdown.test.js      # Temporizador, pausas e invocación de callbacks
✓ tests/unit/useCardDeck.test.js       # Generación de mazo, Fisher-Yates shuffle y tipos de carta
✓ tests/binary/imageCompression.test.js # Pipelines de compresión binaria de imagen
✓ tests/unit/security.test.js          # Guard anti-fuerza bruta y sanitización de inputs
✓ tests/unit/useGameTurn.test.js       # Lógica de emparejamiento, turnos y puntuación

Test Files  5 passed (5)
Tests       16 passed (16)
```

Para ejecutar las pruebas:
```bash
npm test
```

---

## Cómo Ejecutar el Proyecto Localmente

### Prerrequisitos
- Node.js (v18 o superior)
- NPM (v9 o superior)

### Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/DaCazo15/Kehubo.git
cd Kehubo
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` o `.env.local` basado en `.env.example`:
```env
ALLOWED_ORIGIN=http://localhost:5173
PORT=3001
```

4. Iniciar el entorno completo de desarrollo:
```bash
# Inicia concurrentemente el cliente Vite, el backend Express y el watcher de tests
npm start
```

### Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo frontend en `http://localhost:5173` |
| `npm run server` | Inicia el backend de compresión Express en `http://localhost:3001` |
| `npm run dev:all` / `npm start` | Ejecuta frontend, backend y tests de forma concurrente |
| `npm test` | Ejecuta la suite de pruebas unitarias una sola vez |
| `npm run test:watch` | Ejecuta Vitest en modo interactivo/watcher |
| `npm run build` | Compila y optimiza la aplicación para producción |
| `npm run preview` | Previsualiza el bundle compilado de producción localmente |
