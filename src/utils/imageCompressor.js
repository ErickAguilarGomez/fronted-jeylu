/**
 * Compresor de Imágenes HTML5 Canvas en el cliente (Browser)
 * Reduce dimensiones a un máximo permitido y comprime la calidad a formato WebP o JPEG
 * antes de enviar el archivo al servidor mediante FormData.
 */
export async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file
  }

  // Si la imagen es un GIF animado, no la comprimimos con canvas para preservar la animación
  if (file.type === 'image/gif') {
    return file
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Redimensionamiento proporcional
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Exportar a WebP comprimido
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp"
            const compressedFile = new File([blob], newFileName, {
              type: 'image/webp',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          },
          'image/webp',
          quality
        )
      }
      img.onerror = () => resolve(file)
    }
    reader.onerror = () => resolve(file)
  })
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
