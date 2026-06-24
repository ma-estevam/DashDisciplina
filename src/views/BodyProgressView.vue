<script setup>
import { ref } from 'vue'
import BodyProgressCard from '../components/BodyProgressCard.vue'
import BodyProgressForm from '../components/BodyProgressForm.vue'
import StatCard from '../components/StatCard.vue'
import { useBodyProgressStore } from '../stores/bodyProgressStore'

const bodyStore = useBodyProgressStore()
bodyStore.initialize()

const editorOpen = ref(false)
const editingRecord = ref(null)
const message = ref('')
const messageType = ref('success')

function notify(text, type = 'success') {
  message.value = text
  messageType.value = type
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
  if (editingRecord.value) {
    await bodyStore.updateRecord(editingRecord.value.id, data)
    notify('Registro físico atualizado.')
  } else {
    await bodyStore.createRecord(data)
    notify('Registro físico adicionado.')
  }
  editorOpen.value = false
  editingRecord.value = null
}

async function deleteRecord(record) {
  if (!record || !window.confirm('Excluir este registro de evolução física?')) return
  await bodyStore.deleteRecord(record.id)
  notify('Registro removido.')
}

function formatDate(date) {
  if (!date) return 'sem registro'
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')
}
</script>

<template>
  <section class="page-section tracker-page">
    <div class="page-title page-title-with-action">
      <div>
        <span class="eyebrow">Evolução Física</span>
        <h2>Acompanhe massa corporal e medidas.</h2>
        <p>Registre peso, altura, objetivo, medidas e fotos para acompanhar sua evolução pessoal.</p>
      </div>
      <button class="btn-primary" type="button" @click="openNewRecord">Novo registro</button>
    </div>

    <p v-if="message" :class="['feedback-message', `feedback-${messageType}`]">{{ message }}</p>

    <div class="stats-grid tracker-stats">
      <StatCard title="Peso atual" :value="`${bodyStore.currentWeight || 0} kg`" subtitle="último registro" type="primary" />
      <StatCard title="Peso inicial" :value="`${bodyStore.initialWeight || 0} kg`" subtitle="primeiro registro" />
      <StatCard
        title="Diferença"
        :value="`${bodyStore.weightDifference > 0 ? '+' : ''}${bodyStore.weightDifference} kg`"
        subtitle="variação registrada"
      />
      <StatCard title="Objetivo atual" :value="bodyStore.currentGoal" :subtitle="formatDate(bodyStore.latestRecord?.recordDate)" />
    </div>

    <article v-if="editorOpen" class="panel editor-panel">
      <BodyProgressForm :record="editingRecord" @save="saveRecord" @cancel="editorOpen = false" />
    </article>

    <p v-if="bodyStore.usingLocalFallback" class="feedback-message feedback-warning">
      Salvando temporariamente no navegador até as tabelas do Supabase estarem disponíveis.
    </p>

    <div v-if="bodyStore.sortedRecords.length" class="tracker-grid">
      <BodyProgressCard
        v-for="record in bodyStore.sortedRecords"
        :key="record.id"
        :record="record"
        @edit="openEdit"
        @delete="deleteRecord"
      />
    </div>

    <div v-else class="panel empty-state">
      <h3>Sem registros físicos ainda</h3>
      <p>Adicione o primeiro registro para visualizar seu histórico de evolução.</p>
      <button class="btn-primary empty-action" type="button" @click="openNewRecord">Adicionar primeiro registro</button>
    </div>
  </section>
</template>
