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
    <div class="brand">
      <div class="brand-mark">D</div>

      <div>
        <h1>Disciplina 24/7</h1>
        <p>Plano de constância pessoal</p>
      </div>
    </div>

    <nav class="nav-menu" aria-label="Menu principal">
      <NavItem v-for="item in navItems" :key="item.to" :item="item" />
    </nav>

    <div class="sidebar-card">
      <span class="sidebar-card-label">Meta semanal</span>
      <strong>70%</strong>
      <p>O foco é constância, não perfeição.</p>
    </div>
  </aside>
</template>
