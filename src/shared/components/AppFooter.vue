<script setup>
import { onMounted } from 'vue'
import { socialMediaStore } from '@/modules/settings/stores/socialMediaStore.js'

onMounted(() => {
  socialMediaStore.fetchActiveSocialMedia()
})
</script>

<template>
  <footer class="border-top border-black border-4 py-5 mt-auto bg-black text-white text-center">
    <div class="container">
      <h2 class="fw-black m-0 text-uppercase" style="letter-spacing: 2px;">JEILU VIRTUAL STORE</h2>
      
      <!-- Social Media Icons -->
      <div v-if="socialMediaStore.socialMedia.length > 0" class="d-flex justify-content-center gap-3 my-4">
        <a 
          v-for="item in socialMediaStore.socialMedia" 
          :key="item.id" 
          v-show="(item.type === 'whatsapp' && item.phone) || (item.type !== 'whatsapp' && item.url)"
          :href="item.type === 'whatsapp' ? `https://wa.me/${item.phone}` : item.url" 
          target="_blank" 
          class="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center border-2 text-white" 
          style="width: 44px; height: 44px; transition: transform 0.15s, background-color 0.15s;"
          :title="item.type.toUpperCase()"
        >
          <i :class="['bi', `bi-${item.icon || item.type}`, 'fs-5']"></i>
        </a>
      </div>

      <p class="fw-bold m-0 mt-3 text-secondary opacity-75">SISTEMA POS Y CATÁLOGO VIRTUAL © 2026</p>
    </div>
  </footer>
</template>

<style scoped>
a:hover {
  transform: scale(1.15) rotate(5deg);
  background-color: #ffde59 !important;
  color: #000 !important;
  border-color: #ffde59 !important;
}
</style>
