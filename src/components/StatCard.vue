<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'default',
  },
})
</script>

<template>
  <article :class="['stat-card', `stat-card-${type}`]">
    <span>{{ title }}</span>
    <strong>{{ value }}</strong>
    <p>{{ subtitle }}</p>
  </article>
</template>