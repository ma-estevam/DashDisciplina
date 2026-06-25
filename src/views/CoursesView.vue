<script setup>
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import CourseCard from '../components/CourseCard.vue'
import CourseForm from '../components/CourseForm.vue'
import StatCard from '../components/StatCard.vue'
import { useCoursesStore } from '../stores/coursesStore'

const coursesStore = useCoursesStore()
coursesStore.initialize()

const editorOpen = ref(false)
const editingCourse = ref(null)
const message = ref('')

function notify(text) {
  message.value = text
  window.setTimeout(() => {
    if (message.value === text) message.value = ''
  }, 3500)
}

function openNewCourse() {
  editingCourse.value = null
  editorOpen.value = true
}

function openEdit(course) {
  editingCourse.value = course
  editorOpen.value = true
}

async function saveCourse(data) {
  if (editingCourse.value) {
    await coursesStore.updateCourse(editingCourse.value.id, data)
    notify('Curso atualizado.')
  } else {
    await coursesStore.createCourse(data)
    notify('Curso adicionado.')
  }
  editorOpen.value = false
  editingCourse.value = null
}

async function deleteCourse(course) {
  if (!course || !window.confirm(`Excluir "${course.name || 'este curso'}"?`)) return
  await coursesStore.deleteCourse(course.id)
  notify('Curso removido.')
}
</script>

<template>
  <section class="page-section tracker-page">
    <div class="page-title page-title-with-action">
      <div>
        <span class="eyebrow">Cursos</span>
        <h2>Acompanhe estudos e carga horária.</h2>
        <p>Cadastre cursos, registre horas concluídas e visualize o progresso dos seus estudos.</p>
      </div>
      <button class="btn-primary" type="button" @click="openNewCourse">
        <Plus class="button-icon" aria-hidden="true" />
        Novo curso
      </button>
    </div>

    <p v-if="message" class="feedback-message">{{ message }}</p>

    <div class="stats-grid tracker-stats">
      <StatCard title="Cursos cadastrados" :value="String(coursesStore.totalCourses)" subtitle="todos os status" type="primary" />
      <StatCard title="Em andamento" :value="String(coursesStore.activeCourses.length)" subtitle="cursos ativos" />
      <StatCard title="Concluídos" :value="String(coursesStore.completedCourses.length)" subtitle="finalizados" />
      <StatCard title="Horas estudadas" :value="String(coursesStore.studiedHours)" :subtitle="`${coursesStore.generalProgress}% geral`" />
    </div>

    <article v-if="editorOpen" class="panel editor-panel">
      <CourseForm :course="editingCourse" @save="saveCourse" @cancel="editorOpen = false" />
    </article>

    <div v-if="coursesStore.courses.length" class="tracker-grid">
      <CourseCard
        v-for="course in coursesStore.courses"
        :key="course.id"
        :course="course"
        @edit="openEdit"
        @delete="deleteCourse"
      />
    </div>

    <div v-else class="panel empty-state">
      <h3>Nenhum curso cadastrado</h3>
      <p>Adicione seu primeiro curso para acompanhar progresso e carga horária.</p>
      <button class="btn-primary empty-action" type="button" @click="openNewCourse">
        <Plus class="button-icon" aria-hidden="true" />
        Adicionar primeiro curso
      </button>
    </div>
  </section>
</template>
