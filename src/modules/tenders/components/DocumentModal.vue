<script setup lang="ts">
/**
 * Modal para agregar documentos a una oferta.
 *
 * Renderiza un formulario modal con validación de título, descripción, fecha, datos extra y archivo (PDF o ZIP, máximo 10 MB). Emite el evento add cuando el usuario confirma un documento válido.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import { Modal } from 'bootstrap'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, useTemplateRef, watch } from 'vue'

import type { DocumentFormValues } from '../types/tender'
import { isDocumentValid, validateDocument, type DocumentErrors, type DocumentField } from '../validation/documentValidation'

// Controla la visibilidad del modal desde el componente padre
const props = defineProps<{
  show: boolean
}>()

// Eventos que emite el modal al padre: agregar documento o cerrar
const emit = defineEmits<{
  add: [document: DocumentFormValues]
  close: []
}>()

// Referencia al elemento DOM del modal para inicializar la instancia de Bootstrap
const modalElement = useTemplateRef<HTMLElement>('modalElement')

// Instancia del modal de Bootstrap, creada bajo demanda
let modal: Modal | null = null

// Devuelve un objeto vacío de valores para reiniciar el formulario
const emptyValues = (): DocumentFormValues => ({
  title: '',
  description: '',
  document_date: '',
  extra_data: '',
  file: null,
})

// Valores reactivos del formulario del modal
const values = reactive<DocumentFormValues>(emptyValues())

// Campos que el usuario ya ha tocado
const touchedFields = reactive<Set<DocumentField>>(new Set())

// Indica si el usuario intentó confirmar el documento
const submitAttempted = reactive({ value: false })

// Errores de validación calculados para los valores actuales
const validationErrors = computed(() => validateDocument(values))

// Indica si todo el formulario del modal es válido
const isValid = computed(() => isDocumentValid(values))

// Errores que deben mostrarse al usuario según los campos tocados o el intento de envío
const visibleErrors = computed<DocumentErrors>(() => {
  const errors: DocumentErrors = {}

  for (const [field, message] of Object.entries(validationErrors.value)) {
    const documentField = field as DocumentField
    if (submitAttempted.value || touchedFields.has(documentField)) {
      errors[documentField] = message
    }
  }

  return errors
})

// Limpia el formulario y el estado de validación del modal
function resetForm(): void {
  Object.assign(values, emptyValues())
  modalElement.value?.querySelector<HTMLFormElement>('form')?.reset()
  touchedFields.clear()
  submitAttempted.value = false
}

// Marca un campo como tocado para mostrar su error de validación
function touch(field: DocumentField): void {
  touchedFields.add(field)
}

// Captura el archivo seleccionado por el usuario
function handleFile(event: Event): void {
  const input = event.target as HTMLInputElement
  values.file = input.files?.[0] ?? null
  touch('file')
}

// Emite el cierre del modal al padre
function handleClose(): void {
  emit('close')
}

// Valida el formulario y emite el documento si es válido
function handleAdd(): void {
  submitAttempted.value = true

  if (!isValid.value) {
    return
  }

  emit('add', {
    title: values.title.trim(),
    description: values.description.trim(),
    document_date: values.document_date,
    extra_data: values.extra_data.trim(),
    file: values.file,
  })
}

// Crea la instancia del modal y escucha el evento de cierre de Bootstrap
onMounted(() => {
  if (!modalElement.value) {
    return
  }

  modal = Modal.getOrCreateInstance(modalElement.value, {
    backdrop: 'static',
    keyboard: true,
  })
  modalElement.value.addEventListener('hidden.bs.modal', handleClose)
})

// Muestra u oculta el modal según cambie la propiedad show del padre
watch(
  () => props.show,
  async (show) => {
    await nextTick()

    if (!modalElement.value) {
      return
    }

    modal ??= Modal.getOrCreateInstance(modalElement.value, {
      backdrop: 'static',
      keyboard: true,
    })

    if (show) {
      resetForm()
      modal.show()
    } else {
      modal.hide()
    }
  },
)

// Libera recursos del modal y remueve el listener al desmontar el componente
onBeforeUnmount(() => {
  modalElement.value?.removeEventListener('hidden.bs.modal', handleClose)
  modal?.dispose()
  modal = null
})
</script>

<template>
  <div
    ref="modalElement"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="document-modal-title"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <form
          novalidate
          @submit.prevent="handleAdd"
        >
          <div class="modal-header">
            <h2
              id="document-modal-title"
              class="modal-title fs-5"
            >
              Agregar documento
            </h2>
            <button
              type="button"
              class="btn-close"
              aria-label="Cerrar"
              @click="emit('close')"
            />
          </div>

          <div class="modal-body">
            <div class="row g-3">
              <div class="col-12">
                <label
                  for="document-title"
                  class="form-label"
                >Título <span aria-hidden="true">*</span></label>
                <input
                  id="document-title"
                  v-model="values.title"
                  class="form-control"
                  :class="{ 'is-invalid': visibleErrors.title }"
                  type="text"
                  maxlength="100"
                  required
                  :aria-invalid="Boolean(visibleErrors.title)"
                  :aria-describedby="visibleErrors.title ? 'document-title-error' : undefined"
                  @blur="touch('title')"
                >
                <div
                  v-if="visibleErrors.title"
                  id="document-title-error"
                  class="invalid-feedback d-block"
                  role="alert"
                >
                  {{ visibleErrors.title }}
                </div>
              </div>

              <div class="col-12">
                <label
                  for="document-description"
                  class="form-label"
                >Descripción <span aria-hidden="true">*</span></label>
                <textarea
                  id="document-description"
                  v-model="values.description"
                  class="form-control"
                  :class="{ 'is-invalid': visibleErrors.description }"
                  rows="3"
                  maxlength="400"
                  required
                  :aria-invalid="Boolean(visibleErrors.description)"
                  :aria-describedby="visibleErrors.description ? 'document-description-error' : undefined"
                  @blur="touch('description')"
                />
                <div
                  v-if="visibleErrors.description"
                  id="document-description-error"
                  class="invalid-feedback d-block"
                  role="alert"
                >
                  {{ visibleErrors.description }}
                </div>
              </div>

              <div class="col-md-6">
                <label
                  for="document-date"
                  class="form-label"
                >Fecha del documento</label>
                <input
                  id="document-date"
                  v-model="values.document_date"
                  class="form-control"
                  :class="{ 'is-invalid': visibleErrors.document_date }"
                  type="date"
                  :aria-invalid="Boolean(visibleErrors.document_date)"
                  :aria-describedby="visibleErrors.document_date ? 'document-date-error' : undefined"
                  @blur="touch('document_date')"
                >
                <div
                  v-if="visibleErrors.document_date"
                  id="document-date-error"
                  class="invalid-feedback d-block"
                  role="alert"
                >
                  {{ visibleErrors.document_date }}
                </div>
              </div>

              <div class="col-md-6">
                <label
                  for="document-extra"
                  class="form-label"
                >Datos extra</label>
                <input
                  id="document-extra"
                  v-model="values.extra_data"
                  class="form-control"
                  :class="{ 'is-invalid': visibleErrors.extra_data }"
                  type="text"
                  maxlength="255"
                  :aria-invalid="Boolean(visibleErrors.extra_data)"
                  :aria-describedby="visibleErrors.extra_data ? 'document-extra-error' : undefined"
                  @blur="touch('extra_data')"
                >
                <div
                  v-if="visibleErrors.extra_data"
                  id="document-extra-error"
                  class="invalid-feedback d-block"
                  role="alert"
                >
                  {{ visibleErrors.extra_data }}
                </div>
              </div>

              <div class="col-12">
                <label
                  for="document-file"
                  class="form-label"
                >Archivo <span aria-hidden="true">*</span></label>
                <input
                  id="document-file"
                  class="form-control"
                  :class="{ 'is-invalid': visibleErrors.file }"
                  type="file"
                  accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
                  required
                  :aria-invalid="Boolean(visibleErrors.file)"
                  :aria-describedby="visibleErrors.file ? 'document-file-error' : 'document-file-hint'"
                  @change="handleFile"
                >
                <div
                  id="document-file-hint"
                  class="form-text"
                >
                  PDF o ZIP, máximo 10 MB.
                </div>
                <div
                  v-if="visibleErrors.file"
                  id="document-file-error"
                  class="invalid-feedback d-block"
                  role="alert"
                >
                  {{ visibleErrors.file }}
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="emit('close')"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!isValid"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
