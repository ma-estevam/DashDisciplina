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
      <span class="eyebrow">HubDisciplina</span>
      <h2>Seu centro de rotina e evolução pessoal</h2>
    </div>

    <div class="topbar-actions">
      <div class="user-badge">
        <span></span>
        {{ currentUser?.name || 'Usuária' }}
      </div>

      <button class="logout-btn" type="button" aria-label="Sair da conta" @click="$emit('logout')">
        <LogOut class="button-icon" aria-hidden="true" />
        Sair
      </button>
    </div>
  </header>
</template>
