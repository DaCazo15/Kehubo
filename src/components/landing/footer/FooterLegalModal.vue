<script setup lang="ts">
import { ref, watch } from 'vue'
import { FOOTER_LEGAL_LINKS, type LegalDocType } from './footerData'
import { img } from '../../../helpers/imagenes'

const props = defineProps<{
  initialDoc?: LegalDocType
}>()

defineEmits<{
  (e: 'close'): void
}>()

const activeTab = ref<LegalDocType>(props.initialDoc || 'privacy')

watch(() => props.initialDoc, (newVal) => {
  if (newVal) {
    activeTab.value = newVal
  }
})

const copiedColor = ref<string | null>(null)
function copyColor(hex: string) {
  navigator.clipboard.writeText(hex)
  copiedColor.value = hex
  setTimeout(() => {
    copiedColor.value = null
  }, 2000)
}
</script>

<template>
  <div class="space-y-6 max-h-[80vh] overflow-y-auto pr-1 text-slate-200">
    <!-- Barra de Pestañas / Selector de Documento -->
    <div class="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
      <button
        v-for="tab in FOOTER_LEGAL_LINKS"
        :key="tab.id"
        type="button"
        @click="activeTab = tab.id"
        class="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        :class="activeTab === tab.id 
          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20' 
          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'"
      >
        <i :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- 1. POLÍTICAS DE PRIVACIDAD -->
    <div v-if="activeTab === 'privacy'" class="space-y-6 text-xs sm:text-sm leading-relaxed">
      <div class="border-b border-slate-800 pb-4">
        <h3 class="text-xl font-black text-amber-300 uppercase tracking-wide">
          Políticas de Privacidad
        </h3>
        <p class="text-xs text-slate-500 mt-1">Última actualización: Enero 2026</p>
      </div>

      <div class="space-y-4 text-slate-300">
        <section class="space-y-2">
          <h4 class="font-bold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-2">
            <i class="bi bi-shield-lock-fill text-amber-400"></i>
            <span>1. Recopilación de Información</span>
          </h4>
          <p class="text-slate-400">
            En <strong>Kehubo</strong> respetamos tu privacidad. Solo recopilamos los datos estrictamente necesarios para brindarte una experiencia competitiva de juego de cartas en tiempo real:
          </p>
          <ul class="list-disc list-inside space-y-1 pl-2 text-slate-400">
            <li><strong>Datos de perfil público:</strong> Nombre de usuario (o alias de guerrero), foto de perfil y país de procedencia.</li>
            <li><strong>Estadísticas de juego:</strong> Puntuaciones, tiempos de resolución, historial de partidas y posición en rankings globales/locales.</li>
            <li><strong>Datos de autenticación:</strong> Correo electrónico e identificador único gestionado a través de Google Firebase Authentication.</li>
          </ul>
        </section>

        <section class="space-y-2">
          <h4 class="font-bold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-2">
            <i class="bi bi-database-fill-check text-pink-400"></i>
            <span>2. Uso de la Información</span>
          </h4>
          <p class="text-slate-400">
            Los datos se utilizan exclusivamente para sincronizar tus partidas multijugador, registrar tus mejores tiempos en las tablas de clasificación, gestionar solicitudes de amistad y mejorar la estabilidad del servidor. <strong>Nunca vendemos ni compartimos tu información personal con terceros para fines publicitarios.</strong>
          </p>
        </section>

        <section class="space-y-2">
          <h4 class="font-bold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-2">
            <i class="bi bi-hdd-network-fill text-amber-400"></i>
            <span>3. Cookies y Almacenamiento Local</span>
          </h4>
          <p class="text-slate-400">
            Utilizamos tecnologías de almacenamiento local en el navegador (<code class="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">localStorage</code> y <code class="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">sessionStorage</code>) únicamente para mantener tu sesión activa, preferencias de sonido y evitar recargas innecesarias durante las partidas.
          </p>
        </section>

        <section class="space-y-2">
          <h4 class="font-bold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-2">
            <i class="bi bi-person-x-fill text-pink-400"></i>
            <span>4. Derechos del Usuario y Eliminación de Datos</span>
          </h4>
          <p class="text-slate-400">
            Puedes editar tus datos de perfil en cualquier momento desde los ajustes de tu cuenta. Si deseas solicitar la eliminación completa y definitiva de tu perfil y puntuaciones, contáctanos en <a href="mailto:dcazorla.0190@gmail.com" class="text-amber-400 hover:underline">dcazorla.0190@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>

    <!-- 2. TÉRMINOS Y CONDICIONES -->
    <div v-else-if="activeTab === 'terms'" class="space-y-6 text-xs sm:text-sm leading-relaxed">
      <div class="border-b border-slate-800 pb-4">
        <h3 class="text-xl font-black text-pink-300 uppercase tracking-wide">
          Términos y Condiciones de Uso
        </h3>
        <p class="text-xs text-slate-500 mt-1">Condiciones del servicio y juego limpio</p>
      </div>

      <div class="space-y-4 text-slate-300">
        <section class="space-y-2">
          <h4 class="font-bold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-2">
            <i class="bi bi-check-circle-fill text-amber-400"></i>
            <span>1. Aceptación de los Términos</span>
          </h4>
          <p class="text-slate-400">
            Al acceder, registrarte o jugar en <strong>Kehubo</strong>, aceptas cumplir con los presentes Términos y Condiciones. Si no estás de acuerdo con alguna disposición, te solicitamos no utilizar la plataforma.
          </p>
        </section>

        <section class="space-y-2">
          <h4 class="font-bold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-2">
            <i class="bi bi-award-fill text-pink-400"></i>
            <span>2. Juego Limpio y Conducta en la Arena</span>
          </h4>
          <p class="text-slate-400">
            Kehubo es un juego de destreza mental y memoria táctica. Queda expresamente prohibido:
          </p>
          <ul class="list-disc list-inside space-y-1 pl-2 text-slate-400">
            <li>El uso de bots, scripts o extensiones automáticas para resolver tableros o manipular tiempos.</li>
            <li>La explotación deliberada de bugs para inflar posiciones en el Ranking Global o Local.</li>
            <li>Nombres de usuario, salas o mensajes que contengan lenguaje de odio, acoso o discriminación.</li>
          </ul>
        </section>

        <section class="space-y-2">
          <h4 class="font-bold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-2">
            <i class="bi bi-c-circle-fill text-amber-400"></i>
            <span>3. Propiedad Intelectual</span>
          </h4>
          <p class="text-slate-400">
            Todo el código fuente, diseño gráfico, ilustraciones de cartas, efectos visuales y marcas asociadas a <strong>Kehubo</strong> son propiedad exclusiva de sus creadores y desarrolladores. No se permite su reproducción no autorizada con fines comerciales.
          </p>
        </section>

        <section class="space-y-2">
          <h4 class="font-bold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-2">
            <i class="bi bi-exclamation-triangle-fill text-pink-400"></i>
            <span>4. Disponibilidad del Servicio</span>
          </h4>
          <p class="text-slate-400">
            Nos esforzamos por ofrecer un servicio continuo y de baja latencia; sin embargo, no nos responsabilizamos por interrupciones ocasionadas por mantenimiento de servidores o fallas en proveedores de infraestructura en la nube.
          </p>
        </section>
      </div>
    </div>

    <!-- 3. PRESS KIT (KIT DE PRENSA) -->
    <div v-else-if="activeTab === 'presskit'" class="space-y-6 text-xs sm:text-sm leading-relaxed">
      <div class="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 class="text-xl font-black text-amber-300 uppercase tracking-wide">
            Press Kit & Media Kit
          </h3>
          <p class="text-xs text-slate-500 mt-1">Recursos oficiales para prensa, creadores de contenido y colaboradores</p>
        </div>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold w-fit">
          <i class="bi bi-broadcast-pin"></i> Media Ready
        </span>
      </div>

      <div class="space-y-6">
        <!-- Pitch & Descripción -->
        <div class="game-card-portal p-5 rounded-2xl border border-amber-500/20 space-y-3">
          <h4 class="font-black text-slate-100 uppercase text-xs flex items-center gap-2">
            <i class="bi bi-chat-quote-fill text-amber-400"></i>
            <span>Descripción del Producto (Pitch)</span>
          </h4>
          <div class="space-y-2 text-slate-300">
            <p class="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs italic">
              <strong>Versión Corta:</strong> «Kehubo es una plataforma competitiva de juego de memoria táctica en tiempo real, diseñada para desafiar los reflejos y la retención mental con salas privadas multijugador, rankings globales y un estilo visual cyber-gaming de alto impacto.»
            </p>
            <p class="text-slate-400 text-xs leading-relaxed">
              <strong>Versión Extendida:</strong> Desarrollado para transformar el clásico juego de memorizar parejas en una auténtica batalla de velocidad mental. Ofrece modos de juego individual rápido, emparejamiento competitivo con código de sala privada, temporizadores de alta precisión y un sistema de medallas y progresión para jugadores de todos los niveles.
            </p>
          </div>
        </div>

        <!-- Ficha Técnica (Fact Sheet) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="game-card-portal p-4 rounded-2xl border border-slate-800 space-y-2">
            <h5 class="text-[11px] font-black uppercase text-amber-400">Ficha Técnica</h5>
            <ul class="text-xs text-slate-300 space-y-1.5">
              <li><strong>Desarrollador:</strong> Daniel Cazorla (@DaCazo15)</li>
              <li><strong>Año de Lanzamiento:</strong> 2026</li>
              <li><strong>Plataformas:</strong> Web, Móvil (PWA Responsive)</li>
              <li><strong>Género:</strong> Memoria táctica / Cartas / Competitivo</li>
            </ul>
          </div>
          <div class="game-card-portal p-4 rounded-2xl border border-slate-800 space-y-2">
            <h5 class="text-[11px] font-black uppercase text-pink-400">Stack Tecnológico</h5>
            <ul class="text-xs text-slate-300 space-y-1.5">
              <li><strong>Frontend:</strong> Vue 3, TypeScript, Tailwind CSS, Vite</li>
              <li><strong>Backend en Tiempo Real:</strong> Firebase Firestore & Auth</li>
              <li><strong>Infraestructura:</strong> Google Cloud / Netlify</li>
              <li><strong>Iconografía:</strong> Bootstrap Icons</li>
            </ul>
          </div>
        </div>

        <!-- Paleta de Colores Oficial -->
        <div class="game-card-portal p-5 rounded-2xl border border-slate-800 space-y-3">
          <h4 class="font-black text-slate-100 uppercase text-xs flex items-center justify-between">
            <span class="flex items-center gap-2">
              <i class="bi bi-palette-fill text-pink-400"></i>
              <span>Paleta de Colores de Marca</span>
            </span>
            <span v-if="copiedColor" class="text-emerald-400 text-[10px] font-bold">
              ¡Copiado {{ copiedColor }}!
            </span>
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              @click="copyColor('#F59E0B')"
              class="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition text-left space-y-1 cursor-pointer group"
            >
              <div class="h-6 w-full rounded-lg bg-amber-500 shadow-sm"></div>
              <p class="font-black text-[11px] text-amber-400 group-hover:underline">Kehubo Gold</p>
              <p class="text-[10px] font-mono text-slate-500">#F59E0B</p>
            </button>

            <button
              type="button"
              @click="copyColor('#EC4899')"
              class="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 transition text-left space-y-1 cursor-pointer group"
            >
              <div class="h-6 w-full rounded-lg bg-pink-500 shadow-sm"></div>
              <p class="font-black text-[11px] text-pink-400 group-hover:underline">Neon Pink</p>
              <p class="text-[10px] font-mono text-slate-500">#EC4899</p>
            </button>

            <button
              type="button"
              @click="copyColor('#070A12')"
              class="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 transition text-left space-y-1 cursor-pointer group"
            >
              <div class="h-6 w-full rounded-lg bg-[#070A12] border border-slate-700"></div>
              <p class="font-black text-[11px] text-slate-300 group-hover:underline">Abyss Dark</p>
              <p class="text-[10px] font-mono text-slate-500">#070A12</p>
            </button>

            <button
              type="button"
              @click="copyColor('#10B981')"
              class="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition text-left space-y-1 cursor-pointer group"
            >
              <div class="h-6 w-full rounded-lg bg-emerald-500 shadow-sm"></div>
              <p class="font-black text-[11px] text-emerald-400 group-hover:underline">Success Green</p>
              <p class="text-[10px] font-mono text-slate-500">#10B981</p>
            </button>
          </div>
        </div>

        <!-- Logotipos y Recursos Oficiales -->
        <div class="game-card-portal p-5 rounded-2xl border border-slate-800 space-y-3">
          <h4 class="font-black text-slate-100 uppercase text-xs flex items-center gap-2">
            <i class="bi bi-images text-amber-400"></i>
            <span>Logos Oficiales (PNG / SVG)</span>
          </h4>
          <div class="flex flex-wrap items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 justify-around">
            <div class="text-center space-y-2">
              <img :src="img.isologo" alt="Kehubo Isologo" class="h-14 w-auto mx-auto object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <p class="text-[10px] text-slate-400 font-semibold">Isotipo Oficial</p>
            </div>
            <div class="text-center space-y-2">
              <img :src="img.logo" alt="Kehubo Logo" class="h-14 w-auto mx-auto object-contain" />
              <p class="text-[10px] text-slate-400 font-semibold">Logotipo Principal</p>
            </div>
          </div>
        </div>

        <!-- Contacto de Prensa -->
        <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div class="space-y-0.5">
            <p class="text-xs font-black uppercase text-amber-300">Contacto Directo de Prensa & Media</p>
            <p class="text-xs text-slate-400">Para entrevistas, colaboraciones, notas de prensa y materiales adicionales:</p>
          </div>
          <a
            href="mailto:dcazorla.0190@gmail.com?subject=Kehubo%20Press%20Kit%20Inquiry"
            class="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition shadow-lg shadow-amber-500/20 inline-flex items-center gap-2 shrink-0"
          >
            <i class="bi bi-envelope-fill"></i>
            <span>Contactar Prensa</span>
          </a>
        </div>
      </div>
    </div>

    <!-- 4. IMPRINT (IMPRESSUM / AVISO LEGAL) -->
    <div v-else-if="activeTab === 'imprint'" class="space-y-6 text-xs sm:text-sm leading-relaxed">
      <div class="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 class="text-xl font-black text-amber-300 uppercase tracking-wide">
            Imprint (Impressum / Aviso Legal)
          </h3>
          <p class="text-xs text-slate-500 mt-1">Declaración de titularidad, autoría y responsabilidad legal editorial</p>
        </div>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold w-fit">
          <i class="bi bi-shield-shaded"></i> Aviso Legal
        </span>
      </div>

      <div class="space-y-5 text-slate-300">
        <!-- Titularidad de la plataforma -->
        <div class="game-card-portal p-5 rounded-2xl border border-slate-800 space-y-3">
          <h4 class="font-bold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-2">
            <i class="bi bi-building text-amber-400"></i>
            <span>Información del Titular y Responsable Legal</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400 pt-1">
            <div class="space-y-1">
              <p class="text-slate-200 font-semibold">Titular / Autor:</p>
              <p>Daniel Cazorla (DaCazo15)</p>
              <p class="text-slate-200 font-semibold mt-2">Denominación del Proyecto:</p>
              <p>Kehubo Game Platform</p>
            </div>
            <div class="space-y-1">
              <p class="text-slate-200 font-semibold">Ubicación / Domicilio Legal:</p>
              <p>Barcelona, Estado Anzoátegui, Venezuela</p>
              <p class="text-slate-200 font-semibold mt-2">Contacto Directo:</p>
              <p>Tel: <a href="tel:+584148197912" class="text-amber-400 hover:underline">+58 414 819 7912</a></p>
              <p>Email: <a href="mailto:dcazorla.0190@gmail.com" class="text-amber-400 hover:underline">dcazorla.0190@gmail.com</a></p>
            </div>
          </div>
        </div>

        <!-- Responsabilidad por Contenidos -->
        <section class="space-y-2">
          <h4 class="font-bold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-2">
            <i class="bi bi-file-earmark-lock-fill text-pink-400"></i>
            <span>Responsabilidad por Contenidos (Haftung für Inhalte)</span>
          </h4>
          <p class="text-slate-400">
            Como creadores del servicio, somos responsables de los contenidos propios publicados en esta plataforma conforme a las disposiciones generales de la ley. Sin embargo, no estamos obligados a supervisar de forma activa la información de terceros transmitida o almacenada, ni a investigar circunstancias que indiquen una actividad ilícita antes de recibir una notificación expresa.
          </p>
        </section>

        <!-- Responsabilidad por Enlaces -->
        <section class="space-y-2">
          <h4 class="font-bold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-2">
            <i class="bi bi-link-45deg text-amber-400"></i>
            <span>Responsabilidad por Enlaces Externos (Haftung für Links)</span>
          </h4>
          <p class="text-slate-400">
            Esta plataforma puede contener enlaces a páginas web de terceros (redes sociales, servicios de analítica, perfiles de desarrollador). No tenemos control sobre el contenido de dichos sitios externos y, por lo tanto, no podemos asumir responsabilidad alguna por su contenido o políticas de tratamiento de datos.
          </p>
        </section>

        <!-- Propiedad Intelectual y Derechos de Autor -->
        <section class="space-y-2">
          <h4 class="font-bold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-2">
            <i class="bi bi-shield-check text-pink-400"></i>
            <span>Derechos de Autor (Urheberrecht)</span>
          </h4>
          <p class="text-slate-400">
            Los contenidos, arquitectura de software, diseños visuales y obras creadas por los autores en estas páginas están protegidos por las leyes internacionales de derechos de autor y propiedad intelectual. La reproducción, edición o difusión fuera de los límites de la ley de derechos de autor requiere el consentimiento previo y por escrito del autor.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
