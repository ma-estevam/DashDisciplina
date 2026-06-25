<script setup>
import { reactive, watch } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import { FIELD_TYPES } from '../stores/customModulesStore'

const props = defineProps({
  module: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['save', 'cancel'])

const iconOptions = ['Target', 'Droplets', 'Moon', 'Heart', 'Smile', 'BookOpen', 'Wallet', 'Home', 'Sparkles']
const trackingTypes = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'free', label: 'Livre' },
]

const form = reactive({
  name: '',
  description: '',
  icon: 'Target',
  color: '#8f1828',
  trackingType: 'free',
  goal: '',
  unit: '',
  allowEvidence: false,
  showOnDashboard: true,
  fields: [],
})

watch(
  () => props.module,
  (module) => {
    form.name = module?.name || ''
    form.description = module?.description || ''
    form.icon = module?.icon || 'Target'
    form.color = module?.color || '#8f1828'
    form.trackingType = module?.trackingType || 'free'
    form.goal = module?.goal || ''
    form.unit = module?.unit || ''
    form.allowEvidence = Boolean(module?.allowEvidence)
    form.showOnDashboard = module?.showOnDashboard ?? true
    form.fields = (module?.fields?.length ? module.fields : [{ label: '', fieldType: 'short_text', required: false, options: [] }]).map(
      (field) => ({
        id: field.id,
        label: field.label || '',
        fieldKey: field.fieldKey || '',
        fieldType: field.fieldType || 'short_text',
        required: Boolean(field.required),
        options: Array.isArray(field.options) ? field.options.join(', ') : field.options || '',
      }),
    )
  },
  { immediate: true },
)

function addField() {
  form.fields.push({ label: '', fieldType: 'short_text', required: false, options: '' })
}

function removeField(index) {
  form.fields.splice(index, 1)
}

function submit() {
  if (!form.name.trim()) return
  emit('save', {
    ...form,
    name: form.name.trim(),
    fields: form.fields,
  })
}
</script>

<template>
  <form class="editor-form custom-module-form" @submit.prevent="submit">
    <section class="form-section">
      <div class="section-header compact-header">
        <div>
          <span class="eyebrow">Identidade</span>
          <h3>Como este módulo aparece no app</h3>
        </div>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="custom-name">Nome do módulo</label>
          <input id="custom-name" v-model="form.name" maxlength="80" required placeholder="Ex: Controle de Água" />
        </div>
        <div class="form-group">
          <label for="custom-icon">Ícone</label>
          <select id="custom-icon" v-model="form.icon">
            <option v-for="icon in iconOptions" :key="icon">{{ icon }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="custom-color">Cor</label>
          <input id="custom-color" v-model="form.color" type="color" />
        </div>
        <div class="form-group">
          <label for="custom-type">Tipo de acompanhamento</label>
          <select id="custom-type" v-model="form.trackingType">
            <option v-for="type in trackingTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="custom-description">Descrição</label>
        <textarea id="custom-description" v-model="form.description" placeholder="Explique o que você quer acompanhar."></textarea>
      </div>
    </section>

    <section class="form-section">
      <div class="section-header compact-header">
        <div>
          <span class="eyebrow">Meta e exibição</span>
          <h3>Resumo e preferências</h3>
        </div>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="custom-goal">Meta opcional</label>
          <input id="custom-goal" v-model="form.goal" min="0" step="0.1" type="number" placeholder="Ex: 2" />
        </div>
        <div class="form-group">
          <label for="custom-unit">Unidade</label>
          <input id="custom-unit" v-model="form.unit" maxlength="40" placeholder="litros, horas, páginas..." />
        </div>
      </div>

      <div class="toggle-row">
        <label class="check-field">
          <input v-model="form.allowEvidence" type="checkbox" />
          Permitir evidências por foto
        </label>
        <label class="check-field">
          <input v-model="form.showOnDashboard" type="checkbox" />
          Exibir no Dashboard
        </label>
      </div>
    </section>

    <section class="form-section">
      <div class="section-header compact-header">
        <div>
          <span class="eyebrow">Campos personalizados</span>
          <h3>O que será preenchido em cada registro</h3>
        </div>
        <button class="btn-compact" type="button" @click="addField">
          <Plus class="button-icon" aria-hidden="true" />
          Campo
        </button>
      </div>

      <div class="custom-fields-list">
        <article v-for="(field, index) in form.fields" :key="field.id || index" class="custom-field-row">
          <div class="form-group">
            <label :for="`field-label-${index}`">Rótulo</label>
            <input :id="`field-label-${index}`" v-model="field.label" maxlength="60" placeholder="Ex: Quantidade" />
          </div>
          <div class="form-group">
            <label :for="`field-type-${index}`">Tipo</label>
            <select :id="`field-type-${index}`" v-model="field.fieldType">
              <option v-for="type in FIELD_TYPES" :key="type.value" :value="type.value">{{ type.label }}</option>
            </select>
          </div>
          <div class="form-group" v-if="field.fieldType === 'select'">
            <label :for="`field-options-${index}`">Opções</label>
            <input :id="`field-options-${index}`" v-model="field.options" placeholder="uma, duas, três" />
          </div>
          <label class="check-field custom-required">
            <input v-model="field.required" type="checkbox" />
            Obrigatório
          </label>
          <button class="btn-danger field-remove" type="button" aria-label="Remover campo" @click="removeField(index)">
            <Trash2 class="button-icon" aria-hidden="true" />
          </button>
        </article>
      </div>
    </section>

    <div class="form-actions">
      <button class="btn-primary" type="submit">{{ module ? 'Salvar módulo' : 'Criar módulo' }}</button>
      <button class="btn-ghost" type="button" @click="$emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>
