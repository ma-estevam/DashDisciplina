<script setup>
import { computed, ref, watch } from 'vue'
import { localDateKey, useDisciplineStore } from '../stores/disciplineStore'
import { useExceptionStore } from '../stores/exceptionStore'
import { useRoutineStore } from '../stores/routineStore'

const routineStore = useRoutineStore()
const disciplineStore = useDisciplineStore()
const exceptionStore = useExceptionStore()
routineStore.initialize()
disciplineStore.initialize()
exceptionStore.initialize()

const selectedDate = ref(localDateKey())
const entries = ref([])
const dayNote = ref('')
const message = ref('')
const messageType = ref('success')
const uploadingHabitId = ref(null)
const isExceptionDay = ref(false)
const selectedExceptionId = ref('')
const exceptionReason = ref('')
const exceptionNote = ref('')
const minimumHabitsGoal = ref(1)
const minimumHabitsCompleted = ref('')
const minimumRoutineCompleted = ref(false)

const activeRoutine = computed(() => routineStore.activeRoutine)
const completedCount = computed(() => entries.value.filter((entry) => entry.completed).length)
const selectedException = computed(
  () => exceptionStore.exceptions.find((item) => item.id === selectedExceptionId.value) || null,
)
const dateException = computed(() => exceptionStore.getExceptionByDate(selectedDate.value))
const effectiveGoal = computed(() =>
  isExceptionDay.value ? Number(minimumHabitsGoal.value) || completedCount.value || 1 : entries.value.length,
)
const progress = computed(() =>
  effectiveGoal.value ? Math.min(100, Math.round((completedCount.value / effectiveGoal.value) * 100)) : 0,
)

function applyException(exception = null) {
  isExceptionDay.value = Boolean(exception)
  selectedExceptionId.value = exception?.id || ''
  exceptionReason.value = exception?.title || ''
  exceptionNote.value = exception?.description || ''
  minimumHabitsGoal.value = exception?.minimumHabits || Math.max(1, Math.min(2, entries.value.length || 1))
  minimumHabitsCompleted.value = ''
  minimumRoutineCompleted.value = false
}

function loadDate() {
  const existing = disciplineStore.recordByDate(selectedDate.value)

  if (existing) {
    entries.value = (existing.entries || []).map((entry) => ({
      ...entry,
      evidenceIds: [...(entry.evidenceIds || [])],
    }))
    dayNote.value = existing.note || ''
    isExceptionDay.value = Boolean(existing.isExceptionDay)
    selectedExceptionId.value = existing.exceptionId || ''
    exceptionReason.value = existing.exceptionReason || existing.exceptionTitle || ''
    exceptionNote.value = existing.exceptionNote || ''
    minimumHabitsGoal.value = existing.minimumHabitsGoal || existing.plannedHabitCount || entries.value.length || 1
    minimumHabitsCompleted.value = existing.minimumHabitsCompleted || existing.habitsCompleted || ''
    minimumRoutineCompleted.value = Boolean(existing.minimumRoutineCompleted)
    return
  }

  entries.value = (activeRoutine.value?.habits || []).map((habit) => ({
    habitId: habit.id,
    habitName: habit.name || 'Hábito sem nome',
    description: habit.description,
    dailyGoal: habit.dailyGoal || habit.goal,
    unit: habit.unit,
    requiresEvidence: habit.requiresEvidence,
    completed: false,
    amount: '',
    note: '',
    evidenceIds: [],
  }))
  dayNote.value = ''
  applyException(dateException.value)
}

watch(selectedDate, loadDate, { immediate: true })
watch(
  () => exceptionStore.exceptions,
  () => {
    if (!disciplineStore.recordByDate(selectedDate.value)) applyException(dateException.value)
  },
  { deep: true },
)
watch(selectedException, (exception) => {
  if (!exception || !isExceptionDay.value) return
  exceptionReason.value = exception.title || exceptionReason.value
  exceptionNote.value = exception.description || exceptionNote.value
  minimumHabitsGoal.value = exception.minimumHabits || minimumHabitsGoal.value
})
watch(
  () => routineStore.activeRoutineId,
  () => {
    if (!disciplineStore.recordByDate(selectedDate.value)) loadDate()
  },
)

function notify(text, type = 'success') {
  message.value = text
  messageType.value = type
}

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

async function attachEvidence(event, entry) {
  const file = event.target.files?.[0]
  if (!file || !file.type.startsWith('image/')) return

  uploadingHabitId.value = entry.habitId
  message.value = ''

  try {
    const image = await resizeImage(file)
    const evidence = disciplineStore.addEvidence({
      date: selectedDate.value,
      routineId: activeRoutine.value?.id || null,
      habitId: entry.habitId,
      habitName: entry.habitName,
      note: entry.note,
      image,
      fileName: file.name,
    })
    entry.evidenceIds.push(evidence.id)
    notify(`Evidência adicionada ao hábito ${entry.habitName}.`)
  } catch {
    notify('Não foi possível salvar a imagem. Tente uma foto menor.', 'error')
  } finally {
    uploadingHabitId.value = null
    event.target.value = ''
  }
}

function removeEvidence(entry, evidenceId) {
  disciplineStore.deleteEvidence(evidenceId)
  entry.evidenceIds = entry.evidenceIds.filter((id) => id !== evidenceId)
}

function evidenceFor(id) {
  return disciplineStore.evidences.find((item) => item.id === id)
}

function saveRecord() {
  message.value = ''

  if (!activeRoutine.value) {
    notify('Crie ou selecione uma rotina antes de registrar o dia.', 'error')
    return
  }

  const missingEvidence = entries.value.find(
    (entry) => entry.completed && entry.requiresEvidence && !entry.evidenceIds.length,
  )

  if (missingEvidence) {
    notify(`Adicione uma evidência para concluir "${missingEvidence.habitName}".`, 'error')
    return
  }

  try {
    const exception = selectedException.value || dateException.value

    disciplineStore.saveRecord({
      date: selectedDate.value,
      routine: activeRoutine.value,
      entries: entries.value,
      note: dayNote.value,
      exceptionData: {
        isExceptionDay: isExceptionDay.value,
        exceptionId: selectedExceptionId.value || exception?.id || null,
        exceptionTitle: exception?.title || exceptionReason.value,
        exceptionType: exception?.type || '',
        exceptionReason: exceptionReason.value,
        exceptionNote: exceptionNote.value,
        minimumHabitsGoal: minimumHabitsGoal.value,
        minimumHabitsCompleted: minimumHabitsCompleted.value || completedCount.value,
        minimumRoutineCompleted: minimumRoutineCompleted.value || completedCount.value >= effectiveGoal.value,
      },
    })
    notify('Registro diário salvo com sucesso.')
  } catch {
    notify('Não foi possível salvar. O armazenamento do navegador pode estar cheio.', 'error')
  }
}
</script>

<template>
  <section class="page-section">
    <div class="page-title page-title-with-action">
      <div>
        <span class="eyebrow">Registro diário</span>
        <h2>Como foi sua disciplina hoje?</h2>
        <p v-if="activeRoutine">
          Você está registrando os hábitos de <strong>{{ activeRoutine?.name || routineStore.activeRoutineName }}</strong>.
        </p>
      </div>
      <div class="date-control">
        <label for="register-date">Data</label>
        <input id="register-date" v-model="selectedDate" type="date" />
      </div>
    </div>

    <p v-if="message" :class="['feedback-message', `feedback-${messageType}`]">{{ message }}</p>

    <div v-if="!activeRoutine" class="panel empty-state">
      <h3>Nenhuma rotina ativa</h3>
      <p>Crie uma rotina para começar seus registros.</p>
      <RouterLink class="btn-primary empty-action" to="/rotina">Configurar rotina</RouterLink>
    </div>

    <template v-else>
      <div class="register-summary panel">
        <div>
          <span>Progresso do dia</span>
          <strong>{{ completedCount }}/{{ effectiveGoal }}</strong>
          <small v-if="isExceptionDay">Meta reduzida por exceção</small>
        </div>
        <div class="progress-bar progress-bar-light">
          <div :style="{ width: `${progress}%` }"></div>
        </div>
        <strong>{{ progress }}%</strong>
      </div>

      <article class="panel exception-day-panel">
        <div class="exception-toggle-row">
          <label class="inline-check">
            <input v-model="isExceptionDay" type="checkbox" />
            Este foi um dia de exceção
          </label>
          <RouterLink class="text-link" to="/excecoes">gerenciar exceções</RouterLink>
        </div>

        <div v-if="isExceptionDay" class="exception-daily-grid">
          <div class="form-group">
            <label for="daily-exception">Exceção cadastrada</label>
            <select id="daily-exception" v-model="selectedExceptionId">
              <option value="">Exceção manual</option>
              <option v-for="item in exceptionStore.sortedExceptions" :key="item.id" :value="item.id">
                {{ item.date }} - {{ item.title }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="minimum-goal">Meta mínima de hábitos</label>
            <input id="minimum-goal" v-model.number="minimumHabitsGoal" min="1" type="number" />
          </div>

          <div class="form-group">
            <label for="minimum-completed">Hábitos mínimos cumpridos</label>
            <input id="minimum-completed" v-model.number="minimumHabitsCompleted" min="0" type="number" />
          </div>

          <div class="form-group">
            <label for="exception-reason">Motivo</label>
            <input id="exception-reason" v-model="exceptionReason" maxlength="160" />
          </div>
        </div>

        <div v-if="isExceptionDay" class="form-group">
          <label for="exception-note">Observação da exceção</label>
          <textarea
            id="exception-note"
            v-model="exceptionNote"
            placeholder="Explique o contexto do dia e qual versão mínima da rotina foi cumprida."
          ></textarea>
        </div>

        <label v-if="isExceptionDay" class="inline-check">
          <input v-model="minimumRoutineCompleted" type="checkbox" />
          Rotina mínima cumprida
        </label>
      </article>

      <div v-if="entries.length" class="register-cards">
        <article
          v-for="entry in entries"
          :key="entry.habitId"
          :class="['register-habit-card', { completed: entry.completed }]"
        >
          <div class="register-habit-header">
            <label class="habit-check">
              <input v-model="entry.completed" type="checkbox" />
              <span></span>
              <div>
                <strong>{{ entry.habitName }}</strong>
                <p>{{ entry.description || 'Sem descrição.' }}</p>
              </div>
            </label>
            <span v-if="entry.requiresEvidence" class="evidence-required">Evidência obrigatória</span>
          </div>

          <div class="register-fields">
            <div v-if="entry.dailyGoal || entry.unit" class="form-group">
              <label :for="`amount-${entry.habitId}`">
                Quantidade
                <small v-if="entry.dailyGoal">Meta: {{ entry.dailyGoal }} {{ entry.unit }}</small>
              </label>
              <div class="input-with-unit">
                <input
                  :id="`amount-${entry.habitId}`"
                  v-model="entry.amount"
                  min="0"
                  step="0.1"
                  type="number"
                  placeholder="0"
                />
                <span v-if="entry.unit">{{ entry.unit }}</span>
              </div>
            </div>

            <div class="form-group">
              <label :for="`note-${entry.habitId}`">Observação</label>
              <input
                :id="`note-${entry.habitId}`"
                v-model="entry.note"
                maxlength="180"
                placeholder="Como foi?"
              />
            </div>
          </div>

          <div class="evidence-row">
            <label class="btn-ghost upload-inline">
              <input type="file" accept="image/*" @change="attachEvidence($event, entry)" />
              {{ uploadingHabitId === entry.habitId ? 'Processando...' : 'Adicionar foto' }}
            </label>

            <div v-if="entry.evidenceIds.length" class="evidence-thumbs">
              <div v-for="evidenceId in entry.evidenceIds" :key="evidenceId" class="evidence-thumb">
                <img v-if="evidenceFor(evidenceId)" :src="evidenceFor(evidenceId).image" alt="Evidência anexada" />
                <button type="button" title="Remover evidência" @click="removeEvidence(entry, evidenceId)">×</button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="panel empty-state">
        <h3>Esta rotina ainda não possui hábitos</h3>
        <p>Adicione pelo menos um hábito na configuração da rotina.</p>
        <RouterLink class="btn-primary empty-action" to="/rotina">Adicionar hábitos</RouterLink>
      </div>

      <div v-if="entries.length" class="panel day-note-panel">
        <div class="form-group">
          <label for="day-note">Observação geral do dia</label>
          <textarea
            id="day-note"
            v-model="dayNote"
            placeholder="Registre aprendizados, dificuldades ou algo importante sobre o dia."
          ></textarea>
        </div>
        <button class="btn-primary" type="button" @click="saveRecord">Salvar registro</button>
      </div>
    </template>
  </section>
</template>
