<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  item: {
    type: Object,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <RouterLink :to="item.to" :class="['nav-link', { 'nav-link-compact': compact }]" :aria-label="item.label">
    <component :is="item.icon" class="nav-icon" aria-hidden="true" />
    <span>{{ item.label }}</span>
  </RouterLink>
</template>
