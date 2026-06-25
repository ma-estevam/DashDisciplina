import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'
import { useAuthStore } from './authStore'

export const FIELD_TYPES = [
  { value: 'short_text', label: 'Texto curto' },
  { value: 'long_text', label: 'Texto longo' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
  { value: 'time', label: 'Hora' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'select', label: 'Seleção' },
  { value: 'percentage', label: 'Porcentagem' },
  { value: 'money', label: 'Valor monetário' },
  { value: 'image', label: 'Imagem/evidência' },
  { value: 'scale_1_5', label: 'Escala 1 a 5' },
  { value: 'scale_1_10', label: 'Escala 1 a 10' },
]

function createId() {
  return crypto.randomUUID()
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function slugify(value) {
  return (
    value
      ?.toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || `campo_${createId().slice(0, 8)}`
  )
}

function toModule(row, fields = [], records = []) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name || '',
    description: row.description || '',
    icon: row.icon || 'Target',
    color: row.color || '#8f1828',
    trackingType: row.tracking_type || 'free',
    goal: row.goal || '',
    unit: row.unit || '',
    allowEvidence: Boolean(row.allow_evidence),
    showOnDashboard: Boolean(row.show_on_dashboard),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    fields,
    records,
  }
}

function toField(row) {
  return {
    id: row.id,
    moduleId: row.module_id,
    userId: row.user_id,
    label: row.label || '',
    fieldKey: row.field_key || slugify(row.label),
    fieldType: row.field_type || 'short_text',
    required: Boolean(row.required),
    options: Array.isArray(row.options) ? row.options : [],
    position: Number(row.position || 0),
    createdAt: row.created_at || new Date().toISOString(),
  }
}

function toRecord(row) {
  return {
    id: row.id,
    moduleId: row.module_id,
    userId: row.user_id,
    recordDate: row.record_date || todayKey(),
    values: row.values || {},
    evidenceUrl: row.evidence_url || '',
    notes: row.notes || '',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
  }
}

function moduleRow(module, userId) {
  const goal = Number(module.goal)

  return {
    user_id: userId,
    name: module.name || '',
    description: module.description || '',
    icon: module.icon || 'Target',
    color: module.color || '#8f1828',
    tracking_type: module.trackingType || 'free',
    goal: module.goal === '' || module.goal === null || module.goal === undefined || Number.isNaN(goal) ? null : goal,
    unit: module.unit || '',
    allow_evidence: Boolean(module.allowEvidence),
    show_on_dashboard: Boolean(module.showOnDashboard),
    updated_at: new Date().toISOString(),
  }
}

function fieldRow(field, moduleId, userId, index) {
  return {
    module_id: moduleId,
    user_id: userId,
    label: field.label || '',
    field_key: field.fieldKey || slugify(field.label),
    field_type: field.fieldType || 'short_text',
    required: Boolean(field.required),
    options: Array.isArray(field.options) ? field.options : [],
    position: index,
  }
}

function recordRow(record, moduleId, userId) {
  return {
    module_id: moduleId,
    user_id: userId,
    record_date: record.recordDate || todayKey(),
    values: record.values || {},
    evidence_url: record.evidenceUrl || null,
    notes: record.notes || '',
    updated_at: new Date().toISOString(),
  }
}

function normalizeFields(fields) {
  return (fields || [])
    .filter((field) => field.label?.trim())
    .map((field, index) => ({
      id: field.id || createId(),
      label: field.label.trim(),
      fieldKey: field.fieldKey || slugify(field.label),
      fieldType: field.fieldType || 'short_text',
      required: Boolean(field.required),
      options:
        typeof field.options === 'string'
          ? field.options
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : field.options || [],
      position: index,
    }))
}

export const useCustomModulesStore = defineStore('customModules', {
  state: () => ({
    modules: [],
    loading: false,
    usingLocalFallback: false,
    userId: null,
    error: '',
  }),

  getters: {
    dashboardModules: (state) => state.modules.filter((module) => module.showOnDashboard).slice(0, 4),

    moduleById: (state) => (moduleId) => state.modules.find((module) => module.id === moduleId) || null,

    totalRecords: (state) =>
      state.modules.reduce((total, module) => total + (module.records?.length || 0), 0),
  },

  actions: {
    async initialize() {
      await this.loadModules()
    },

    async loadModules() {
      const authStore = useAuthStore()
      const userId = authStore.currentUser?.id
      this.userId = userId || null
      this.loading = true
      this.error = ''

      if (!userId) {
        this.modules = []
        this.loading = false
        return
      }

      try {
        const [{ data: modulesData, error: modulesError }, { data: fieldsData, error: fieldsError }, { data: recordsData, error: recordsError }] =
          await Promise.all([
            supabase.from('custom_modules').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
            supabase.from('custom_module_fields').select('*').eq('user_id', userId).order('position', { ascending: true }),
            supabase.from('custom_module_records').select('*').eq('user_id', userId).order('record_date', { ascending: false }),
          ])

        if (modulesError || fieldsError || recordsError) {
          throw modulesError || fieldsError || recordsError
        }

        const fieldsByModule = new Map()
        for (const field of (fieldsData || []).map(toField)) {
          if (!fieldsByModule.has(field.moduleId)) fieldsByModule.set(field.moduleId, [])
          fieldsByModule.get(field.moduleId).push(field)
        }

        const recordsByModule = new Map()
        for (const record of (recordsData || []).map(toRecord)) {
          if (!recordsByModule.has(record.moduleId)) recordsByModule.set(record.moduleId, [])
          recordsByModule.get(record.moduleId).push(record)
        }

        this.modules = (modulesData || []).map((module) =>
          toModule(module, fieldsByModule.get(module.id) || [], recordsByModule.get(module.id) || []),
        )
        this.usingLocalFallback = false
      } catch (error) {
        this.error = error.message || 'Não foi possível carregar os módulos personalizados.'
        this.modules = []
      } finally {
        this.loading = false
      }
    },

    persistLocal() {
      // Os módulos personalizados agora são salvos apenas no Supabase.
    },

    async createModule(moduleData) {
      const userId = useAuthStore().currentUser?.id || this.userId
      if (!userId) throw new Error('Faça login para salvar módulos personalizados no banco.')
      const fields = normalizeFields(moduleData.fields)
      const localModule = {
        id: createId(),
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name: moduleData.name?.trim() || 'Módulo sem nome',
        description: moduleData.description || '',
        icon: moduleData.icon || 'Target',
        color: moduleData.color || '#8f1828',
        trackingType: moduleData.trackingType || 'free',
        goal: moduleData.goal || '',
        unit: moduleData.unit || '',
        allowEvidence: Boolean(moduleData.allowEvidence),
        showOnDashboard: Boolean(moduleData.showOnDashboard),
        fields,
        records: [],
      }

      try {
        const { data, error } = await supabase
          .from('custom_modules')
          .insert(moduleRow(localModule, userId))
          .select()
          .single()

        if (error) throw error

        const createdFields = []
        if (fields.length) {
          const { data: fieldData, error: fieldError } = await supabase
            .from('custom_module_fields')
            .insert(fields.map((field, index) => fieldRow(field, data.id, userId, index)))
            .select()

          if (fieldError) throw fieldError
          createdFields.push(...(fieldData || []).map(toField))
        }

        const created = toModule(data, createdFields, [])
        this.modules.unshift(created)
        return created
      } catch (error) {
        this.error = error.message || 'Não foi possível criar o módulo.'
        throw error
      }
    },

    async updateModule(moduleId, moduleData) {
      if (!this.userId) throw new Error('Faça login para editar módulos personalizados no banco.')
      const index = this.modules.findIndex((module) => module.id === moduleId)
      if (index === -1) return

      const fields = normalizeFields(moduleData.fields)
      const updated = {
        ...this.modules[index],
        ...moduleData,
        fields,
        updatedAt: new Date().toISOString(),
      }

      try {
        const { error } = await supabase
          .from('custom_modules')
          .update(moduleRow(updated, this.userId))
          .eq('id', moduleId)
          .eq('user_id', this.userId)

        if (error) throw error

        await supabase.from('custom_module_fields').delete().eq('module_id', moduleId).eq('user_id', this.userId)
        if (fields.length) {
          const { error: fieldError } = await supabase
            .from('custom_module_fields')
            .insert(fields.map((field, fieldIndex) => fieldRow(field, moduleId, this.userId, fieldIndex)))

          if (fieldError) throw fieldError
        }
      } catch (error) {
        this.error = error.message || 'Não foi possível atualizar o módulo.'
        throw error
      }

      this.modules[index] = updated
    },

    async deleteModule(moduleId) {
      if (!this.userId) throw new Error('Faça login para excluir módulos personalizados no banco.')

      try {
        const { error } = await supabase.from('custom_modules').delete().eq('id', moduleId).eq('user_id', this.userId)
        if (error) throw error
        this.modules = this.modules.filter((module) => module.id !== moduleId)
      } catch (error) {
        this.error = error.message || 'Não foi possível excluir o módulo.'
        throw error
      }
    },

    async createRecord(moduleId, recordData) {
      if (!this.userId) throw new Error('Faça login para salvar registros no banco.')
      const module = this.moduleById(moduleId)
      if (!module) return null

      const localRecord = {
        id: createId(),
        moduleId,
        userId: this.userId,
        recordDate: recordData.recordDate || todayKey(),
        values: recordData.values || {},
        evidenceUrl: recordData.evidenceUrl || '',
        notes: recordData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      try {
        const { data, error } = await supabase
          .from('custom_module_records')
          .insert(recordRow(localRecord, moduleId, this.userId))
          .select()
          .single()

        if (error) throw error
        const saved = toRecord(data)
        module.records.unshift(saved)
        return saved
      } catch (error) {
        this.error = error.message || 'Não foi possível criar o registro.'
        throw error
      }
    },

    async updateRecord(moduleId, recordId, recordData) {
      if (!this.userId) throw new Error('Faça login para editar registros no banco.')
      const module = this.moduleById(moduleId)
      if (!module) return
      const index = module.records.findIndex((record) => record.id === recordId)
      if (index === -1) return

      const updated = {
        ...module.records[index],
        ...recordData,
        updatedAt: new Date().toISOString(),
      }

      try {
        const { error } = await supabase
          .from('custom_module_records')
          .update(recordRow(updated, moduleId, this.userId))
          .eq('id', recordId)
          .eq('user_id', this.userId)

        if (error) throw error
      } catch (error) {
        this.error = error.message || 'Não foi possível atualizar o registro.'
        throw error
      }

      module.records[index] = updated
    },

    async deleteRecord(moduleId, recordId) {
      if (!this.userId) throw new Error('Faça login para excluir registros no banco.')
      const module = this.moduleById(moduleId)
      if (!module) return

      try {
        const { error } = await supabase.from('custom_module_records').delete().eq('id', recordId).eq('user_id', this.userId)
        if (error) throw error
        module.records = module.records.filter((record) => record.id !== recordId)
      } catch (error) {
        this.error = error.message || 'Não foi possível excluir o registro.'
        throw error
      }
    },
  },
})
