<script setup>
import { computed, ref, watch } from 'vue'
import { localDateKey, useDisciplineStore } from '../stores/disciplineStore'
import { useRoutineStore } from '../stores/routineStore'

const routineStore = useRoutineStore()
const disciplineStore = useDisciplineStore()
routineStore.initialize()
disciplineStore.initialize()

const selectedDate = ref(localDateKey())
const selectedHabitId = ref(routineStore.activeRoutine?.habits[0]?.id || '')
const note = ref('')
const isLoading = ref(false)
const message = ref('')

const habits = computed(() => routineStore.activeRoutine?.habits || [])
const selectedHabit = computed(() => habits.value.find((habit) => habit.id === selectedHabitId.value))
const filteredEvidences = computed(() =>
  disciplineStore.evidencesByDate(selectedDate.value).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  ),
)
const groupedByHabit = computed(() => {
  const groups = new Map()

  for (const evidence of filteredEvidences.value) {
    const key = evidence.habitId || evidence.habitName || evidence.habit
    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        name: evidence.habitName || evidence.habit || 'Hábito removido',
        items: [],
      })
    }
    groups.get(key).items.push(evidence)
  }

  for (const habit of habits.value) {
    if (!groups.has(habit.id)) groups.set(habit.id, { id: habit.id, name: habit.name, items: [] })
  }

  return [...groups.values()]
})

watch(
  habits,
  (items) => {
    if (!items.some((habit) => habit.id === selectedHabitId.value)) {
      selectedHabitId.value = items[0]?.id || ''
    }
  },
  { immediate: true },
)

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1000 / image.width, 1)
        canvas.width = image.width * scale
        canvas.height = image.height * scale
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      image.onerror = reject
      image.src = event.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function handleFiles(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length || !selectedHabit.value) return

  isLoading.value = true
  message.value = ''

  try {
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      const image = await resizeImage(file)
      disciplineStore.addEvidence({
        date: selectedDate.value,
        routineId: routineStore.activeRoutineId,
        habitId: selectedHabit.value.id,
        habitName: selectedHabit.value.name,
        note: note.value.trim(),
        image,
        fileName: file.name,
      })
    }
    note.value = ''
    message.value = 'Evidência salva com sucesso.'
  } catch {
    message.value = 'Não foi possível salvar. Tente imagens menores.'
  } finally {
    isLoading.value = false
    event.target.value = ''
  }
}

function deleteEvidence(id) {
  if (!window.confirm('Excluir esta evidência?')) return
  disciplineStore.deleteEvidence(id)
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')
}
</script>

<template>
  <section class="page-section evidence-page">
    <div class="page-title">
      <span class="eyebrow">Evidências</span>
      <h2>Fotos separadas por dia e hábito.</h2>
      <p>As evidências agora pertencem ao usuário logado e acompanham os hábitos da rotina ativa.</p>
    </div>

    <p v-if="message" class="feedback-message">{{ message }}</p>

    <div class="evidence-layout">
      <article class="panel upload-panel">
        <h3>Adicionar evidência</h3>

        <div v-if="habits.length" class="evidence-form">
          <div class="form-group">
            <label for="date">Data</label>
            <input id="date" v-model="selectedDate" type="date" />
          </div>
          <div class="form-group">
            <label for="habit">Hábito</label>
            <select id="habit" v-model="selectedHabitId">
              <option v-for="habit in habits" :key="habit.id" :value="habit.id">{{ habit.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="note">Observação</label>
            <textarea id="note" v-model="note" placeholder="Conte o que esta foto comprova."></textarea>
          </div>

          <label class="upload-box" for="photo">
            <input id="photo" type="file" accept="image/*" multiple @change="handleFiles" />
            <span>📷</span>
            <strong>Selecionar fotos</strong>
            <small>Você pode enviar uma ou mais imagens</small>
          </label>
          <p v-if="isLoading" class="loading-text">Salvando evidência...</p>
        </div>

        <div v-else class="empty-state compact-empty">
          <h3>Nenhum hábito disponível</h3>
          <p>Adicione hábitos à rotina ativa antes de enviar fotos.</p>
          <RouterLink to="/rotina" class="btn-primary empty-action">Configurar hábitos</RouterLink>
        </div>
      </article>

      <article class="panel evidence-summary">
        <span class="eyebrow">Resumo do dia</span>
        <h3>{{ formatDate(selectedDate) }}</h3>
        <div class="summary-number">{{ filteredEvidences.length }}</div>
        <p>evidência{{ filteredEvidences.length === 1 ? '' : 's' }} registrada{{ filteredEvidences.length === 1 ? '' : 's' }}.</p>
      </article>
    </div>

    <section class="evidence-gallery">
      <div class="section-header">
        <div>
          <span class="eyebrow">Visualização</span>
          <h3>Evidências de {{ formatDate(selectedDate) }}</h3>
        </div>
      </div>

      <div v-if="filteredEvidences.length === 0" class="panel empty-state">
        <h3>Nenhuma evidência nessa data</h3>
        <p>Escolha uma data e envie fotos para montar seu histórico.</p>
      </div>

      <div v-for="group in groupedByHabit" v-else :key="group.id" class="habit-evidence-group">
        <h4>{{ group.name }}</h4>
        <div v-if="group.items.length" class="evidence-grid">
          <article v-for="item in group.items" :key="item.id" class="evidence-card">
            <img :src="item.image" :alt="`Evidência de ${group.name}`" />
            <div class="evidence-card-content">
              <strong>{{ group.name }}</strong>
              <p v-if="item.note">{{ item.note }}</p>
              <small>
                Enviado às {{ new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}
              </small>
              <button type="button" class="delete-btn" @click="deleteEvidence(item.id)">Excluir</button>
            </div>
          </article>
        </div>
      </div>
    </section>
  </section>
</template>
