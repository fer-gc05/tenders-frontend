/**
 * Componente de gestión de documentos de oferta.
 *
 * Muestra los documentos existentes y nuevos de una oferta, permite descargar, eliminar documentos existentes y agregar nuevos documentos mediante un modal.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

<script setup lang="ts">
import { computed, ref } from 'vue'

import { resolveDownloadUrl } from '../services/tenders'
import type { DocumentFormValues, TenderDocument } from '../types/tender'
import DocumentModal from './DocumentModal.vue'

const props = defineProps<{
  documents: TenderDocument[]
  required?: boolean
}>()

const emit = defineEmits<{
  'delete-document': [documentId: number]
}>()

function deleteDocument(documentId: number): void {
  emit('delete-document', documentId)
}

const newDocuments = defineModel<DocumentFormValues[]>('newDocuments', {
  default: () => [],
})

const showModal = ref(false)

const hasDocuments = computed(
  () => props.documents.length > 0 || newDocuments.value.length > 0,
)

function addDocument(document: DocumentFormValues): void {
  newDocuments.value = [...newDocuments.value, document]
  showModal.value = false
}

function removeNewDocument(index: number): void {
  newDocuments.value = newDocuments.value.filter((_, currentIndex) => currentIndex !== index)
}

function formatSize(size?: number | null): string {
  if (typeof size !== 'number' || size < 0) {
    return 'Tamaño no disponible'
  }

  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value?: string | null): string {
  if (!value) {
    return ''
  }

  return value.slice(0, 10)
}
</script>

<template>
  <section
    class="content-card"
    aria-labelledby="documents-heading"
  >
    <div class="content-card-header d-flex flex-column flex-sm-row justify-content-between gap-3">
      <div>
        <h2
          id="documents-heading"
          class="section-title"
        >
          <span
            class="form-section-number"
            aria-hidden="true"
          >3</span>
          Documentos
        </h2>
        <p class="mb-0 mt-1 text-secondary">
          {{ props.required ? 'Se requiere al menos un documento para guardar.' : 'Agrega documentos opcionales.' }}
        </p>
      </div>

      <button
        type="button"
        class="btn btn-primary align-self-sm-center"
        @click="showModal = true"
      >
        Agregar documento
      </button>
    </div>

    <div class="content-card-body">
      <div
        v-if="hasDocuments"
        class="document-list"
      >
        <article
          v-for="document in documents"
          :key="`existing-${document.id}`"
          class="document-item"
        >
          <div
            class="document-icon"
            aria-hidden="true"
          >
            DOC
          </div>
          <div>
            <h3 class="document-title">
              {{ document.title }}
            </h3>
            <p
              v-if="document.description"
              class="document-meta"
            >
              {{ document.description }}
            </p>
            <p class="document-meta">
              {{ formatSize(document.size) }}
              <span v-if="document.extension"> · {{ document.extension.toUpperCase() }}</span>
              <span v-if="formatDate(document.document_date || document.created_at)">
                · {{ formatDate(document.document_date || document.created_at) }}
              </span>
              <span v-if="document.extra_data"> · {{ document.extra_data }}</span>
            </p>
          </div>
          <div class="document-actions">
            <a
              class="btn btn-outline-primary btn-sm"
              :href="resolveDownloadUrl(document.download_url)"
              download
            >Descargar</a>
            <button
              type="button"
              class="btn btn-outline-danger btn-sm"
              @click="deleteDocument(document.id)"
            >
              Eliminar
            </button>
          </div>
        </article>

        <article
          v-for="(document, index) in newDocuments"
          :key="`new-${document.file?.name}-${index}`"
          class="document-item"
        >
          <div
            class="document-icon"
            aria-hidden="true"
          >
            NEW
          </div>
          <div>
            <h3 class="document-title">
              {{ document.title }}
            </h3>
            <p class="document-meta">
              {{ document.description }}
            </p>
            <p class="document-meta">
              {{ document.file?.name }}
              <span v-if="document.file"> · {{ formatSize(document.file.size) }}</span>
              <span v-if="document.document_date"> · {{ document.document_date }}</span>
              <span v-if="document.extra_data"> · {{ document.extra_data }}</span>
            </p>
          </div>
          <button
            type="button"
            class="btn btn-outline-danger btn-sm"
            @click="removeNewDocument(index)"
          >
            Quitar
          </button>
        </article>
      </div>

      <div
        v-else
        class="empty-state"
      >
        <div
          class="empty-state-icon"
          aria-hidden="true"
        >
          +
        </div>
        <h3 class="h5">
          No hay documentos registrados
        </h3>
        <p class="text-secondary mb-0">
          Agrega el primer documento de la oferta.
        </p>
      </div>
    </div>
  </section>

  <DocumentModal
    :show="showModal"
    @add="addDocument"
    @close="showModal = false"
  />
</template>
