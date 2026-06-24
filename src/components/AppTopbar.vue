<script setup>
import { LogOut } from 'lucide-vue-next'

defineProps({
  currentUser: {
    type: Object,
    default: null,
  },
})

defineEmits(['logout'])
</script>

<template>
  <header class="topbar">
    <div>
      <span class="eyebrow">Sistema de comprovação</span>
      <h2>Plano de Disciplina Pessoal</h2>
    </div>

    <div class="topbar-actions">
      <div class="user-badge">
        <span></span>
        {{ currentUser?.name || 'Usuária' }}
      </div>

      <button class="logout-btn" type="button" @click="$emit('logout')">
        <LogOut class="button-icon" aria-hidden="true" />
        Sair
      </button>
    </div>
  </header>
</template>
