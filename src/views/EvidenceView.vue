<script setup>
import { computed, ref, onMounted } from 'vue'

const STORAGE_KEY = 'disciplina_247_evidencias'

const habits = [
  'Treino',
  'Estudo',
  'Cozinhar',
  'Leitura',
  'Crochê',
  'Descanso',
]

const today = new Date().toISOString().split('T')[0]

const selectedDate = ref(today)
const selectedHabit = ref('Treino')
const note = ref('')
const evidences = ref([])
const isLoading = ref(false)

const filteredEvidences = computed(() => {
  return evidences.value
    .filter((item) => item.date === selectedDate.value)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const groupedByHabit = computed(() => {
  return habits.map((habit) => ({
    habit,
    items: filteredEvidences.value.filter((item) => item.habit === habit),
  }))
})

function loadEvidences() {
  const saved = localStorage.getItem(STORAGE_KEY)
  evidences.value = saved ? JSON.parse(saved) : []
}

function saveEvidences() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(evidences.value))
}

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxWidth = 1000
        const scale = Math.min(maxWidth / img.width, 1)

        canvas.width = img.width * scale
        canvas.height = img.height * scale

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const compressedImage = canvas.toDataURL('image/jpeg', 0.75)
        resolve(compressedImage)
      }

      img.onerror = reject
      img.src = event.target.result
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function handleFiles(event) {
  const files = Array.from(event.target.files)

  if (!files.length) return

  isLoading.value = true

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue

    const image = await resizeImage(file)

    evidences.value.push({
      id: crypto.randomUUID(),
      date: selectedDate.value,
      habit: selectedHabit.value,
      note: note.value,
      image,
      fileName: file.name,
      createdAt: new Date().toISOString(),
    })
  }

  saveEvidences()
  note.value = ''
  event.target.value = ''
  isLoading.value = false
}

function deleteEvidence(id) {
  evidences.value = evidences.value.filter((item) => item.id !== id)
  saveEvidences()
}

function formatDate(date) {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
}

onMounted(() => {
  loadEvidences()
})
</script>

<template>
  <section class="page-section evidence-page">
    <div class="page-title">
      <span class="eyebrow">Evidências</span>
      <h2>Fotos separadas por dia.</h2>
      <p>
        Envie fotos ou prints que comprovem seus hábitos. Cada evidência fica
        salva com data, categoria e observação para visualização posterior.
      </p>
    </div>

    <div class="evidence-layout">
      <article class="panel upload-panel">
        <h3>Adicionar evidência</h3>

        <div class="evidence-form">
          <div class="form-group">
            <label for="date">Data</label>
            <input id="date" v-model="selectedDate" type="date" />
          </div>

          <div class="form-group">
            <label for="habit">Hábito</label>
            <select id="habit" v-model="selectedHabit">
              <option
                v-for="habit in habits"
                :key="habit"
                :value="habit"
              >
                {{ habit }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="note">Observação</label>
            <textarea
              id="note"
              v-model="note"
              placeholder="Ex: treino completo, resumo de Vue, progresso no crochê..."
            ></textarea>
          </div>

          <label class="upload-box" for="photo">
            <input
              id="photo"
              type="file"
              accept="image/*"
              multiple
              @change="handleFiles"
            />

            <span>📷</span>
            <strong>Selecionar fotos</strong>
            <small>Você pode enviar uma ou mais imagens</small>
          </label>

          <p v-if="isLoading" class="loading-text">
            Salvando evidência...
          </p>
        </div>
      </article>

      <article class="panel evidence-summary">
        <span class="eyebrow">Resumo do dia</span>
        <h3>{{ formatDate(selectedDate) }}</h3>

        <div class="summary-number">
          {{ filteredEvidences.length }}
        </div>

        <p>
          evidência{{ filteredEvidences.length === 1 ? '' : 's' }} registrada{{ filteredEvidences.length === 1 ? '' : 's' }}
          nesta data.
        </p>
      </article>
    </div>

    <section class="evidence-gallery">
      <div class="section-header">
        <div>
          <span class="eyebrow">Visualização</span>
          <h3>Evidências de {{ formatDate(selectedDate) }}</h3>
        </div>
      </div>

      <div
        v-if="filteredEvidences.length === 0"
        class="panel empty-state"
      >
        <h3>Nenhuma evidência nessa data</h3>
        <p>
          Escolha uma data e envie fotos para começar a montar seu histórico de disciplina.
        </p>
      </div>

      <div
        v-for="group in groupedByHabit"
        v-else
        :key="group.habit"
        class="habit-evidence-group"
      >
        <h4>{{ group.habit }}</h4>

        <div
          v-if="group.items.length > 0"
          class="evidence-grid"
        >
          <article
            v-for="item in group.items"
            :key="item.id"
            class="evidence-card"
          >
            <img :src="item.image" :alt="`Evidência de ${item.habit}`" />

            <div class="evidence-card-content">
              <strong>{{ item.habit }}</strong>

              <p v-if="item.note">
                {{ item.note }}
              </p>

              <small>
                Enviado em {{ new Date(item.createdAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }) }}
              </small>

              <button
                type="button"
                class="delete-btn"
                @click="deleteEvidence(item.id)"
              >
                Excluir
              </button>
            </div>
          </article>
        </div>

        <p v-else class="no-evidence-text">
          Nenhuma foto para este hábito.
        </p>
      </div>
    </section>
  </section>
</template>