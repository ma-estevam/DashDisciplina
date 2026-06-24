<script setup>
import { computed, ref } from 'vue'
import { Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { useExceptionStore } from '../stores/exceptionStore'

const exceptionStore = useExceptionStore()
exceptionStore.initialize()

const blankForm = {
  id: null,
  date: '',
  title: '',
  type: 'Rotina reduzida',
  minimumHabits: 2,
  description: '',
  notes: '',
  showOnDashboard: true,
}

const form = ref({ ...blankForm })
const editingId = ref(null)
const message = ref('')
const messageType = ref('success')

const exceptions = computed(() => exceptionStore.sortedExceptions)
const formTitle = computed(() => (editingId.value ? 'Editar exceção' : 'Nova exceção'))

function formatDate(date) {
  if (!date) return 'Sem data'
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')
}

function resetForm() {
  form.value = { ...blankForm }
  editingId.value = null
}

function editException(exception) {
  form.value = { ...exception }
  editingId.value = exception.id
  message.value = ''
}

async function saveException() {
  message.value = ''

  if (!form.value.date || !form.value.title.trim()) {
    message.value = 'Informe uma data e um título para a exceção.'
    messageType.value = 'error'
    return
  }

  await exceptionStore.saveException({
    ...form.value,
    id: editingId.value,
    minimumHabits: Number(form.value.minimumHabits) || 1,
  })

  message.value = editingId.value ? 'Exceção atualizada.' : 'Exceção criada.'
  messageType.value = 'success'
  resetForm()
}

async function deleteException(exception) {
  if (!window.confirm(`Excluir "${exception.title || 'esta exceção'}"?`)) return

  await exceptionStore.deleteException(exception.id)
  if (editingId.value === exception.id) resetForm()
  message.value = 'Exceção excluída.'
  messageType.value = 'success'
}
</script>

<template>
  <section class="page-section">
    <div class="page-title page-title-with-action">
      <div>
        <span class="eyebrow">Exceções planejadas</span>
        <h2>Dias em que a rotina será adaptada.</h2>
        <p>
          Configure metas reduzidas para datas especiais. O Registro Diário e os Relatórios passam a usar a meta
          mínima nesses dias.
        </p>
      </div>
      <button class="btn-secondary burgundy-button" type="button" @click="resetForm">
        <Plus class="button-icon" aria-hidden="true" />
        Nova exceção
      </button>
    </div>

    <p v-if="message" :class="['feedback-message', `feedback-${messageType}`]">{{ message }}</p>

    <article class="panel exception-form-panel">
      <div class="section-header">
        <div>
          <span class="eyebrow">{{ editingId ? 'Atualizar' : 'Cadastrar' }}</span>
          <h3>{{ formTitle }}</h3>
        </div>
      </div>

      <form class="exception-form" @submit.prevent="saveException">
        <div class="form-grid">
          <div class="form-group">
            <label for="exception-date">Data</label>
            <input id="exception-date" v-model="form.date" type="date" required />
          </div>

          <div class="form-group">
            <label for="exception-title">Título</label>
            <input id="exception-title" v-model="form.title" maxlength="120" required />
          </div>

          <div class="form-group">
            <label for="exception-type">Tipo</label>
            <input id="exception-type" v-model="form.type" maxlength="80" />
          </div>

          <div class="form-group">
            <label for="exception-minimum">Meta mínima de hábitos</label>
            <input id="exception-minimum" v-model.number="form.minimumHabits" min="1" type="number" />
          </div>
        </div>

        <div class="form-group">
          <label for="exception-description">Descrição</label>
          <textarea id="exception-description" v-model="form.description" maxlength="280"></textarea>
        </div>

        <div class="form-group">
          <label for="exception-notes">Observações internas</label>
          <textarea id="exception-notes" v-model="form.notes" maxlength="360"></textarea>
        </div>

        <label class="inline-check">
          <input v-model="form.showOnDashboard" type="checkbox" />
          Mostrar aviso no Dashboard
        </label>

        <div class="form-actions">
          <button class="btn-primary" type="submit">
            <Plus v-if="!editingId" class="button-icon" aria-hidden="true" />
            <Pencil v-else class="button-icon" aria-hidden="true" />
            {{ editingId ? 'Salvar alterações' : 'Criar exceção' }}
          </button>
          <button v-if="editingId" class="btn-ghost" type="button" @click="resetForm">Cancelar edição</button>
        </div>
      </form>
    </article>

    <div v-if="exceptions.length" class="exception-list">
      <article v-for="item in exceptions" :key="item.id" class="exception-card">
        <div class="exception-card-header">
          <span>{{ formatDate(item.date) }}</span>
          <div class="item-actions">
            <button type="button" title="Editar exceção" @click="editException(item)">
              <Pencil class="button-icon" aria-hidden="true" />
            </button>
            <button type="button" title="Excluir exceção" @click="deleteException(item)">
              <Trash2 class="button-icon" aria-hidden="true" />
            </button>
          </div>
        </div>
        <h3>{{ item.title || 'Exceção sem título' }}</h3>
        <p>{{ item.description || 'Sem descrição.' }}</p>
        <div class="mini-metrics">
          <span>{{ item.type || 'Exceção' }}</span>
          <span>Meta mínima: {{ item.minimumHabits || 1 }}</span>
          <span>{{ item.showOnDashboard ? 'Dashboard' : 'Oculta do Dashboard' }}</span>
        </div>
      </article>
    </div>

    <div v-else class="panel empty-state">
      <h3>Nenhuma exceção cadastrada</h3>
      <p>Crie uma exceção para adaptar a cobrança da rotina em um dia específico.</p>
    </div>
  </section>
</template>
