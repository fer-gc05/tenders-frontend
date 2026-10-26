<script setup lang="ts">
// Componente raíz de la aplicación: solo renderiza el diseño principal con el contenido de la ruta actual
import { RouterView } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'
</script>

<template>
  <MainLayout>
    <!-- Renderiza la vista asociada a la ruta activa -->
    <RouterView />
  </MainLayout>
</template>
