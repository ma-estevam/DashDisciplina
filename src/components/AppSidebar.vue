<script setup>
import NavItem from './NavItem.vue'

defineProps({
  navItems: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <aside class="sidebar" aria-label="Navegação principal">
    <div class="sidebar-brand brand">
      <div class="brand-mark">H</div>

      <div>
        <h1>HubDisciplina</h1>
        <p>Seu centro de rotina e evolução pessoal</p>
      </div>
    </div>

    <nav class="sidebar-nav nav-menu" aria-label="Menu principal">
      <NavItem v-for="item in navItems" :key="item.to" :item="item" />
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-card">
        <span class="sidebar-card-label">Meta semanal</span>
        <strong>70%</strong>
        <p>Rotina, progresso e constância no mesmo hub.</p>
      </div>
    </div>
  </aside>
</template>
