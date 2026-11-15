/**
 * Compresor de Imágenes HTML5 Canvas en el cliente (Browser)
 * Reduce dimensiones a un máximo permitido y comprime la calidad a formato WebP o JPEG
 * antes de enviar el archivo al servidor mediante FormData.
 */
export const SUPPORTED_UPLOAD_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp'
]

export async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  if (!file) {
    return file
  }

  const fileName = file.name || ''
  const isKnownImageExtension = /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i.test(fileName)
  if (!file.type?.startsWith('image/') && !isKnownImageExtension) {
    return file
  }

  // Si la imagen es un GIF animado, no la comprimimos con canvas para preservar la animación
  if (file.type === 'image/gif' || /\.gif$/i.test(fileName)) {
    return file
  }

  let source
  let cleanup = () => {}

  try {
    if (typeof createImageBitmap === 'function') {
      try {
        source = await createImageBitmap(file)
        cleanup = () => source.close?.()
      } catch {
        // Safari and some phone formats need the HTMLImageElement fallback.
      }
    }

    if (!source) {
      const objectUrl = URL.createObjectURL(file)
      cleanup = () => URL.revokeObjectURL(objectUrl)
      source = await new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('No se pudo abrir la imagen'))
        image.src = objectUrl
      })
    }

    let width = source.width || source.naturalWidth
    let height = source.height || source.naturalHeight
    if (!width || !height) return file

    // Redimensionamiento proporcional
    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(maxWidth / width, maxHeight / height)
      width = Math.max(1, Math.round(width * scale))
      height = Math.max(1, Math.round(height * scale))
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(source, 0, 0, width, height)

    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/webp', quality)
    })
    if (!blob) return file

    // Some browsers fall back to PNG/JPEG when WebP encoding is unavailable.
    // Preserve the MIME type reported by the actual encoded bytes.
    const outputType = blob.type
    const extension = ({
      'image/webp': 'webp',
      'image/png': 'png',
      'image/jpeg': 'jpg'
    })[outputType]
    if (!extension) return file
    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'imagen'

    return new File([blob], `${baseName}.${extension}`, {
      type: outputType,
      lastModified: Date.now()
    })
  } catch {
    // Let the caller show a clear format/size message instead of crashing the form.
    return file
  } finally {
    cleanup()
  }
}

/**
 * Convierte un tamaño en bytes a un formato legible por el usuario (KB, MB).
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
