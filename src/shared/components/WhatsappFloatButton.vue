<script setup>
import { ref } from 'vue'
import WhatsappSelector from '@/shared/components/WhatsappSelector.vue'

const whatsappSelectorRef = ref(null)

const openWhatsapp = () => {
  whatsappSelectorRef.value?.open()
}
</script>

<template>
  <div class="wa-float-wrapper">
    <!-- Tooltip -->
    <span class="wa-tooltip">¡Escríbenos!</span>

    <!-- Button -->
    <button class="wa-float-btn" @click="openWhatsapp" aria-label="Contactar por WhatsApp">
      <span class="wa-pulse"></span>
      <!-- Bootstrap Icons bi-whatsapp — same SVG used in WhatsappSelector.vue -->
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" viewBox="0 0 16 16">
        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.907h.004c4.368 0 7.926-3.558 7.93-7.93a7.897 7.897 0 0 0-2.327-5.644zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.69-4.86c-.2-.1-1.185-.588-1.369-.653-.184-.066-.318-.1-.452.1-.134.2-.52.653-.637.786-.118.133-.235.148-.435.05-.2-.1-.843-.311-1.607-.99-.595-.53-1.002-1.185-1.119-1.386-.118-.2-.012-.307.088-.407.09-.09.2-.234.3-.35.1-.117.133-.198.2-.33.067-.133.034-.25-.017-.35-.05-.1-.452-1.09-.618-1.492-.161-.39-.327-.336-.452-.336-.118-.004-.254-.004-.39-.004-.137 0-.36.052-.55.258-.19.206-.723.708-.723 1.727 0 1.02.742 2.004.846 2.148.104.14 1.46 2.23 3.537 3.125.495.213.882.34 1.185.437.498.158.951.135 1.31.083.4-.058 1.185-.484 1.353-.95.168-.466.168-.867.118-.95-.05-.083-.184-.132-.383-.233z"/>
      </svg>
    </button>
  </div>

  <WhatsappSelector ref="whatsappSelectorRef" />
</template>

<style scoped>
.wa-float-wrapper {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 1050;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.wa-float-btn {
  all: unset; /* reset all browser/Bootstrap styles */
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  width: 62px;
  height: 62px;
  border-radius: 50% !important;
  background-color: #25D366;
  border: 3px solid #000 !important;
  box-shadow: 4px 4px 0px 0px #000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  outline: none;
}

.wa-float-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px 0px #000;
  background-color: #1ebe5d;
}

.wa-float-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px 0px #000;
}

.wa-float-btn svg {
  display: block;
  position: relative;
  z-index: 2;
  pointer-events: none;
  flex-shrink: 0;
}

/* Pulsing ring animation */
.wa-pulse {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 3px solid #25D366;
  opacity: 0.8;
  animation: wa-ring 2s ease-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes wa-ring {
  0%   { opacity: 0.8; transform: scale(1); }
  70%  { opacity: 0;   transform: scale(1.45); }
  100% { opacity: 0;   transform: scale(1.45); }
}

/* Tooltip label */
.wa-tooltip {
  background: #000;
  color: #fff;
  font-weight: 900;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 6px 12px;
  border-radius: 4px;
  border: 2px solid #000;
  box-shadow: 2px 2px 0px 0px #25D366;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(8px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
  user-select: none;
}

.wa-float-wrapper:hover .wa-tooltip {
  opacity: 1;
  transform: translateX(0);
}
</style>
