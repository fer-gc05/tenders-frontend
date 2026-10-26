<script setup lang="ts">
/**
 * Componente de badge de estado de oferta.
 *
 * Muestra el estado de una oferta (Borrador, Publicada, Cerrada) con colores diferenciados.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import { computed } from 'vue'

import type { TenderStatus } from '../types/tender'

const props = defineProps<{
  status: TenderStatus
}>()

const statusLabel = computed(() => {
  const labels: Record<TenderStatus, string> = {
    draft: 'Borrador',
    published: 'Publicada',
    closed: 'Cerrada',
  }

  return labels[props.status]
})
</script>

<template>
  <span
    class="status-badge"
    :class="`status-${status}`"
  >
    {{ statusLabel }}
  </span>
</template>
