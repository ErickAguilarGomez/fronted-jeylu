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

const iconMap = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>`
}

const colorMap = {
  success: { bg: '#00b341', border: '#000', text: '#fff', bar: '#fff' },
  error:   { bg: '#e00', border: '#000', text: '#fff', bar: '#fff' },
  warning: { bg: '#ffc107', border: '#000', text: '#000', bar: '#000' },
  info:    { bg: '#0d6efd', border: '#000', text: '#fff', bar: '#fff' }
}

const colors = colorMap[props.toast.type] || colorMap.info
</script>

<template>
  <div
    class="toast-item"
    :style="{ '--bg': colors.bg, '--border': colors.border, '--text': colors.text, '--bar': colors.bar }"
    role="alert"
  >
    <div class="toast-header">
      <span class="toast-icon" v-html="iconMap[toast.type]"></span>
      <span class="toast-title">{{ toast.title }}</span>
      <button class="toast-close" @click="removeToast(toast.id)" aria-label="Cerrar">✕</button>
    </div>
    <div class="toast-body">
      <ul v-if="toast.messages.length > 1" class="toast-list">
        <li v-for="(m, i) in toast.messages" :key="i">{{ m }}</li>
      </ul>
      <p v-else class="toast-msg">{{ toast.messages[0] }}</p>
    </div>
    <div v-if="toast.duration > 0" class="toast-progress">
      <div class="toast-progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
  </div>
</template>

<style scoped>
.toast-item {
  position: relative;
  min-width: 320px;
  max-width: 440px;
  background: var(--bg);
  border: 3px solid var(--border);
  color: var(--text);
  box-shadow: 6px 6px 0 #000;
  overflow: hidden;
  animation: toast-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes toast-in {
  from { opacity: 0; transform: translateX(80px) scale(0.9); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}

.toast-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px 8px;
  border-bottom: 2px solid rgba(0,0,0,0.2);
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
}

.toast-title {
  font-weight: 900;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex: 1;
}

.toast-close {
  background: none;
  border: 2px solid currentColor;
  color: inherit;
  font-weight: 900;
  font-size: 0.8rem;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
  transition: background 0.15s;
}
.toast-close:hover {
  background: rgba(0,0,0,0.15);
}

.toast-body {
  padding: 8px 14px 12px;
}

.toast-msg {
  margin: 0;
  font-weight: 700;
  font-size: 0.92rem;
  line-height: 1.5;
}

.toast-list {
  margin: 0;
  padding-left: 18px;
  font-weight: 700;
  font-size: 0.9rem;
  line-height: 1.7;
}

.toast-progress {
  height: 5px;
  background: rgba(0,0,0,0.2);
}
.toast-progress-bar {
  height: 100%;
  background: var(--bar);
  transition: width 0.05s linear;
}
</style>
