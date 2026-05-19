import { reactive } from 'vue'

const state = reactive({
  toasts: []
})

let nextId = 1

/**
 * Add a toast notification.
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {string} title
 * @param {string|string[]} message - can be a single message or list (for validation errors)
 * @param {number} duration - ms before auto-dismiss (0 = never)
 */
function addToast(type, title, message, duration = 5000) {
  const id = nextId++
  const messages = Array.isArray(message) ? message : [message]
  state.toasts.push({ id, type, title, messages, duration })

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
}

function removeToast(id) {
  const idx = state.toasts.findIndex(t => t.id === id)
  if (idx !== -1) state.toasts.splice(idx, 1)
}

/**
 * Parse Laravel validation errors (422) or generic API errors into readable strings.
 */
function parseApiError(e) {
  const data = e?.response?.data

  if (!data) return ['Error de conexión con el servidor.']

  // Laravel validation errors: { errors: { field: [msg, ...] } }
  if (data.errors && typeof data.errors === 'object') {
    const msgs = []
    for (const field in data.errors) {
      if (Array.isArray(data.errors[field])) {
        data.errors[field].forEach(m => msgs.push(m))
      }
    }
    return msgs.length > 0 ? msgs : [data.message || 'Error de validación.']
  }

  // Generic message
  if (data.message) return [data.message]

  return ['Ha ocurrido un error inesperado.']
}

export function useToast() {
  return {
    toasts: state.toasts,
    removeToast,

    success(message, title = '¡Operación exitosa!', duration = 4000) {
      addToast('success', title, message, duration)
    },

    error(messageOrError, title = 'Error', duration = 7000) {
      if (messageOrError instanceof Error || messageOrError?.response) {
        const msgs = parseApiError(messageOrError)
        addToast('error', title, msgs, duration)
      } else {
        addToast('error', title, messageOrError, duration)
      }
    },

    warning(message, title = 'Atención', duration = 5000) {
      addToast('warning', title, message, duration)
    },

    info(message, title = 'Información', duration = 4000) {
      addToast('info', title, message, duration)
    }
  }
}
