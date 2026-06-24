<script setup>
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import CustomModuleCard from '../components/CustomModuleCard.vue'
import CustomModuleForm from '../components/CustomModuleForm.vue'
import { useCustomModulesStore } from '../stores/customModulesStore'

const customStore = useCustomModulesStore()
customStore.initialize()

const editorOpen = ref(false)
const editingModule = ref(null)
const message = ref('')
const messageType = ref('success')

function notify(text, type = 'success') {
  message.value = text
  messageType.value = type
  window.setTimeout(() => {
    if (message.value === text) message.value = ''
  }, 3500)
}

function openNewModule() {
  editingModule.value = null
  editorOpen.value = true
}

function openEdit(module) {
  editingModule.value = module
  editorOpen.value = true
}

async function saveModule(data) {
  if (editingModule.value) {
    await customStore.updateModule(editingModule.value.id, data)
    notify('Módulo atualizado.')
  } else {
    await customStore.createModule(data)
    notify('Módulo personalizado criado.')
  }
  editorOpen.value = false
  editingModule.value = null
}

async function deleteModule(module) {
  if (!module || !window.confirm(`Excluir "${module.name || 'este módulo'}" e seus registros?`)) return
  await customStore.deleteModule(module.id)
  notify('Módulo removido.')
}
</script>

<template>
  <section class="page-section tracker-page custom-modules-page">
    <div class="page-title page-title-with-action">
      <div>
        <span class="eyebrow">Meus Módulos</span>
        <h2>Crie acompanhamentos do seu jeito.</h2>
        <p>Monte módulos com campos próprios para água, sono, humor, projetos, finanças ou qualquer rotina pessoal.</p>
      </div>
      <button class="btn-primary" type="button" @click="openNewModule">
        <Plus class="button-icon" aria-hidden="true" />
        Novo módulo
      </button>
    </div>

    <p v-if="message" :class="['feedback-message', `feedback-${messageType}`]">{{ message }}</p>
    <p v-if="customStore.usingLocalFallback" class="feedback-message feedback-warning">
      Salvando temporariamente no navegador até as tabelas de módulos personalizados estarem disponíveis no Supabase.
    </p>

    <article v-if="editorOpen" class="panel editor-panel">
      <CustomModuleForm :module="editingModule" @save="saveModule" @cancel="editorOpen = false" />
    </article>

    <div v-if="customStore.modules.length" class="tracker-grid custom-modules-grid">
      <CustomModuleCard
        v-for="module in customStore.modules"
        :key="module.id"
        :module="module"
        @edit="openEdit"
        @delete="deleteModule"
      />
    </div>

    <div v-else class="panel empty-state">
      <h3>Nenhum módulo personalizado ainda</h3>
      <p>Crie o primeiro módulo para acompanhar qualquer área da sua vida com campos próprios.</p>
      <button class="btn-primary empty-action" type="button" @click="openNewModule">
        <Plus class="button-icon" aria-hidden="true" />
        Criar primeiro módulo
      </button>
    </div>
  </section>
</template>
