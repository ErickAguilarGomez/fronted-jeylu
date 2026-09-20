<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  toast: { type: Object, required: true }
})

const { removeToast } = useToast()

// Progress bar
const progress = ref(100)
let interval = null

onMounted(() => {
  if (props.toast.duration > 0) {
    const step = 100 / (props.toast.duration / 50)
    interval = setInterval(() => {
      progress.value -= step
      if (progress.value <= 0) {
        clearInterval(interval)
      }
    }, 50)
  }
})

const colorConfig = {
  success: {
    accent: '#067d62',
    iconColor: '#067d62',
    iconPath: `<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>`
  },
  error: {
    accent: '#ba0933',
    iconColor: '#ba0933',
    iconPath: `<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>`
  },
  warning: {
    accent: '#c45500',
    iconColor: '#c45500',
    iconPath: `<path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>`
  },
  info: {
    accent: '#007185',
    iconColor: '#007185',
    iconPath: `<path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>`
  }
}

const config = colorConfig[props.toast.type] || colorConfig.info
</script>

<template>
  <div
    class="amazon-toast-card"
    :style="{ '--accent': config.accent }"
    role="alert"
  >
    <div class="amazon-toast-content">
      <!-- Icon -->
      <div class="amazon-toast-icon" :style="{ color: config.iconColor }">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" v-html="config.iconPath"></svg>
      </div>

      <!-- Text Container -->
      <div class="amazon-toast-text flex-grow-1">
        <div class="amazon-toast-title">
          {{ toast.title }}
        </div>
        <div class="amazon-toast-message">
          <ul v-if="toast.messages.length > 1" class="amazon-toast-list">
            <li v-for="(m, i) in toast.messages" :key="i">{{ m }}</li>
          </ul>
          <p v-else class="m-0">{{ toast.messages[0] }}</p>
        </div>
      </div>

      <!-- Close Button -->
      <button 
        class="amazon-toast-close" 
        @click="removeToast(toast.id)" 
        aria-label="Cerrar notificación"
        title="Cerrar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
        </svg>
      </button>
    </div>

    <!-- Duration progress bar -->
    <div v-if="toast.duration > 0" class="amazon-toast-progress-track">
      <div class="amazon-toast-progress-fill" :style="{ width: progress + '%', backgroundColor: config.accent }"></div>
    </div>
  </div>
</template>

<style scoped>
.amazon-toast-card {
  position: relative;
  min-width: 330px;
  max-width: 440px;
  background-color: #ffffff;
  border: 1px solid #d5d9d9;
  border-left: 5px solid var(--accent);
  border-radius: 8px;
  box-shadow: 0 4px 18px rgba(15, 17, 17, 0.16);
  color: #0f1111;
  overflow: hidden;
  animation: amazon-toast-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes amazon-toast-slide-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.amazon-toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
}

.amazon-toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-top: 1px;
}

.amazon-toast-text {
  overflow: hidden;
}

.amazon-toast-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #0f1111;
  line-height: 1.3;
  margin-bottom: 3px;
}

.amazon-toast-message {
  font-size: 0.86rem;
  color: #333333;
  line-height: 1.45;
}

.amazon-toast-list {
  margin: 0;
  padding-left: 18px;
}

.amazon-toast-close {
  background: none;
  border: none;
  color: #565959;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.amazon-toast-close:hover {
  background-color: #f0f2f2;
  color: #0f1111;
}

.amazon-toast-progress-track {
  height: 3px;
  background-color: #f0f2f2;
  width: 100%;
}

.amazon-toast-progress-fill {
  height: 100%;
  transition: width 0.05s linear;
}
</style>
