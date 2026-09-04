import express from 'express'
import cors from 'cors'
import multer from 'multer'
import sharp from 'sharp'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

const app = express()
const PORT = process.env.PORT || 3001

// 1. Seguridad de cabeceras HTTP con Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}))

// 2. CORS con orígenes controlados y seguros
const allowedOriginEnv = process.env.ALLOWED_ORIGIN || 'http://localhost:5173'
const allowedOrigins = allowedOriginEnv === '*' 
  ? '*' 
  : allowedOriginEnv.split(',').map(o => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins === '*') {
      return callback(null, true)
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error(`Bloqueado por CORS: El origen ${origin} no está autorizado.`))
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.use(express.json({ limit: '100kb' })) // Prevenir ataques por payload gigantes

// 3. Rate Limiter Global (100 peticiones cada 15 min por IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiadas peticiones desde esta dirección IP. Inténtalo de nuevo más tarde.'
  }
})
app.use(globalLimiter)

// 4. Rate Limiter Estricto para el endpoint de compresión (20 imágenes por minuto por IP)
// Previene ataques de denegación de servicio (DoS) por sobrecarga de CPU en Sharp
const compressionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Límite de compresión de imágenes alcanzado. Espera un minuto antes de reintentar.'
  }
})

// Configuración de Multer para almacenar en memoria RAM con validación estricta
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024, // Máximo 8MB de entrada
    files: 1 // Solo 1 archivo a la vez
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo tipos MIME de imágenes válidas
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Formato de archivo inválido. Solo se admiten imágenes JPG, PNG, WEBP, AVIF y GIF.'))
    }
  }
})

// Ruta de comprobación de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Kehubo Secure AVIF Compression Backend',
    security: {
      rateLimiting: 'active',
      helmet: 'active',
      antiBruteForce: 'active'
    }
  })
})

/**
 * Endpoint para comprimir y convertir imágenes a formato AVIF
 * Protegido con Rate Limiting y validación binaria
 */
app.post('/api/compress-avatar', compressionLimiter, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No se recibió ningún archivo de imagen para procesar.' })
    }

    const originalSizeKb = (req.file.size / 1024).toFixed(2)

    // Procesamiento con Sharp:
    // 1. Redimensionar a 400x400 (óptimo para avatares en pantallas Retina/alta resolución)
    // 2. Convertir a formato AVIF con compresión de alta calidad
    const compressedBuffer = await sharp(req.file.buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .toFormat('avif', {
        quality: 75,
        effort: 4,
        chromaSubsampling: '4:2:0'
      })
      .toBuffer()

    const compressedSizeKb = (compressedBuffer.length / 1024).toFixed(2)
    const reductionPercent = (((req.file.size - compressedBuffer.length) / req.file.size) * 100).toFixed(1)

    console.log(`🔒 [Security Guard] Imagen procesada y convertida a AVIF: ${originalSizeKb} KB ➔ ${compressedSizeKb} KB (${reductionPercent}% reducido)`)

    // Establecer cabeceras de respuesta seguras
    res.set({
      'Content-Type': 'image/avif',
      'Content-Disposition': 'inline; filename="avatar.avif"',
      'Content-Length': compressedBuffer.length,
      'X-Original-Size-KB': originalSizeKb,
      'X-Compressed-Size-KB': compressedSizeKb,
      'Cache-Control': 'public, max-age=86400, immutable'
    })

    return res.send(compressedBuffer)
  } catch (error) {
    console.error('❌ Error al procesar imagen con Sharp:', error)
    return res.status(500).json({
      error: 'Ocurrió un error al comprimir y convertir la imagen a formato AVIF.',
      details: error.message
    })
  }
})

// Iniciar servidor en modo local / standalone
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🛡️ Backend de Compresión Segura iniciado en http://localhost:${PORT}`)
  })
}

export default app
