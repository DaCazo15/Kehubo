import { describe, it, expect } from 'vitest'
import sharp from 'sharp'

describe('Pruebas Binarias: Compresión y Conversión AVIF con Sharp', () => {
  it('debe convertir un buffer de imagen a formato binario AVIF válido', async () => {
    // 1. Crear una imagen binaria sintética (400x400 px, fondo ámbar) con Sharp directamente
    const inputBuffer = await sharp({
      create: {
        width: 400,
        height: 400,
        channels: 4,
        background: { r: 245, g: 158, b: 11, alpha: 1 }
      }
    })
    .png()
    .toBuffer()

    expect(Buffer.isBuffer(inputBuffer)).toBe(true)

    // 2. Procesar con Sharp (redimensionar a 256x256 y convertir a AVIF)
    const avifBuffer = await sharp(inputBuffer)
      .resize(256, 256, { fit: 'cover' })
      .toFormat('avif', { quality: 75, effort: 3 })
      .toBuffer()

    expect(Buffer.isBuffer(avifBuffer)).toBe(true)
    expect(avifBuffer.length).toBeGreaterThan(0)

    // 3. Inspeccionar metadatos de la imagen binaria resultante (AVIF pertenece al contenedor HEIF)
    const metadata = await sharp(avifBuffer).metadata()
    expect(['avif', 'heif']).toContain(metadata.format)
    expect(metadata.width).toBe(256)
    expect(metadata.height).toBe(256)
  }, 10000)

  it('debe reducir significativamente el peso binario de la imagen', async () => {
    // Generar buffer PNG de 500x500
    const pngBuffer = await sharp({
      create: {
        width: 500,
        height: 500,
        channels: 4,
        background: { r: 236, g: 72, b: 153, alpha: 1 }
      }
    })
    .png({ compressionLevel: 1 })
    .toBuffer()

    // Convertir a AVIF optimizado
    const avifBuffer = await sharp(pngBuffer)
      .resize(300, 300)
      .toFormat('avif', { quality: 70, effort: 3 })
      .toBuffer()

    // El buffer AVIF debe ser más ligero que el PNG
    expect(avifBuffer.length).toBeLessThan(pngBuffer.length)
  }, 10000)
})
