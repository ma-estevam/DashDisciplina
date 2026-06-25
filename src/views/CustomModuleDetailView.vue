<script setup>
import { computed, ref } from 'vue'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import CustomRecordForm from '../components/CustomRecordForm.vue'
import { useCustomModulesStore } from '../stores/customModulesStore'

const route = useRoute()
const router = useRouter()
const customStore = useCustomModulesStore()
customStore.initialize()

const moduleId = computed(() => route.params.moduleId)
const currentModule = computed(() => customStore.moduleById(moduleId.value))
const editorOpen = ref(false)
const editingRecord = ref(null)
const selectedDate = ref('')
const message = ref('')

const records = computed(() => {
  const allRecords = currentModule.value?.records || []
  if (!selectedDate.value) return allRecords
  return allRecords.filter((record) => record.recordDate === selectedDate.value)
})

function notify(text) {
  message.value = text
  window.setTimeout(() => {
    if (message.value === text) message.value = ''
  }, 3500)
}

function openNewRecord() {
  editingRecord.value = null
  editorOpen.value = true
}

function openEdit(record) {
  editingRecord.value = record
  editorOpen.value = true
}

async function saveRecord(data) {
  if (!currentModule.value) return
  if (editingRecord.value) {
    await customStore.updateRecord(currentModule.value.id, editingRecord.value.id, data)
    notify('Registro atualizado.')
  } else {
    await customStore.createRecord(currentModule.value.id, data)
    notify('Registro adicionado.')
  }
  editorOpen.value = false
  editingRecord.value = null
}

async function deleteRecord(record) {
  if (!currentModule.value || !record || !window.confirm('Excluir este registro?')) return
  await customStore.deleteRecord(currentModule.value.id, record.id)
  notify('Registro removido.')
}

function formatDate(date) {
  if (!date) return 'Sem data'
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')
}

function fieldValue(field, record) {
  const value = record.values?.[field.fieldKey]
  if (value === true) return 'Sim'
  if (value === false) return 'Não'
  if (value === undefined || value === null || value === '') return '-'
  return value
}
</script>

<template>
  <section class="page-section tracker-page custom-module-detail-page">
    <div class="page-title page-title-with-action">
      <div>
        <button class="btn-ghost back-button" type="button" @click="router.push('/modulos')">
          <ArrowLeft class="button-icon" aria-hidden="true" />
          Voltar
        </button>
        <span class="eyebrow">Módulo personalizado</span>
        <h2>{{ currentModule?.name || 'Módulo não encontrado' }}</h2>
        <p>{{ currentModule?.description || 'Adicione registros para acompanhar este módulo.' }}</p>
      </div>
      <button v-if="currentModule" class="btn-primary" type="button" @click="openNewRecord">
        <Plus class="button-icon" aria-hidden="true" />
        Novo registro
      </button>
    </div>

    <p v-if="message" class="feedback-message">{{ message }}</p>

    <div v-if="!currentModule" class="panel empty-state">
      <h3>Módulo não encontrado</h3>
      <p>Volte para a lista e escolha um módulo personalizado existente.</p>
    </div>

    <template v-else>
      <div class="stats-grid report-stats">
        <article class="stat-card stat-card-primary">
          <span>Total de registros</span>
          <strong>{{ currentModule.records?.length || 0 }}</strong>
          <p>{{ currentModule.trackingType || 'livre' }}</p>
        </article>
        <article class="stat-card">
          <span>Meta</span>
          <strong>{{ currentModule.goal || '-' }}</strong>
          <p>{{ currentModule.unit || 'sem unidade' }}</p>
        </article>
        <article class="stat-card">
          <span>Último registro</span>
          <strong>{{ formatDate(currentModule.records?.[0]?.recordDate) }}</strong>
          <p>{{ currentModule.showOnDashboard ? 'visível no Dashboard' : 'oculto do Dashboard' }}</p>
        </article>
      </div>

      <article v-if="editorOpen" class="panel editor-panel">
        <CustomRecordForm :module="currentModule" :record="editingRecord" @save="saveRecord" @cancel="editorOpen = false" />
      </article>

      <article class="panel">
        <div class="section-header">
          <div>
            <span class="eyebrow">Histórico</span>
            <h3>Registros do módulo</h3>
          </div>
          <div class="date-control">
            <label for="custom-filter-date">Filtrar por data</label>
            <input id="custom-filter-date" v-model="selectedDate" type="date" />
          </div>
        </div>

        <div v-if="records.length" class="custom-record-list">
          <article v-for="record in records" :key="record.id" class="custom-record-card">
            <div class="custom-record-header">
              <strong>{{ formatDate(record.recordDate) }}</strong>
              <div class="item-actions">
                <button type="button" @click="openEdit(record)">
                  <Pencil class="button-icon" aria-hidden="true" />
                  Editar
                </button>
                <button class="danger-link" type="button" @click="deleteRecord(record)">
                  <Trash2 class="button-icon" aria-hidden="true" />
                  Excluir
                </button>
              </div>
            </div>

            <dl class="custom-record-values">
              <template v-for="field in currentModule.fields" :key="field.fieldKey">
                <dt>{{ field.label }}</dt>
                <dd>
                  <img
                    v-if="field.fieldType === 'image' && record.values?.[field.fieldKey]"
                    :src="record.values[field.fieldKey]"
                    :alt="field.label"
                    loading="lazy"
                  />
                  <span v-else>{{ fieldValue(field, record) }}</span>
                </dd>
              </template>
            </dl>

            <img v-if="record.evidenceUrl" class="custom-record-evidence" :src="record.evidenceUrl" alt="Evidência do registro" loading="lazy" />
            <p v-if="record.notes">{{ record.notes }}</p>
          </article>
        </div>

        <div v-else class="empty-state compact-empty">
          <h3>Nenhum registro encontrado</h3>
          <p>Adicione um registro ou limpe o filtro de data.</p>
        </div>
      </article>
    </template>
  </section>
</template>
