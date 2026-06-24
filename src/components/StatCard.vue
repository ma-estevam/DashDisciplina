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
  icon: {
    type: [Object, Function],
    default: null,
  },
})
</script>

<template>
  <article :class="['stat-card', `stat-card-${type}`]">
    <div class="stat-card-header">
      <span>{{ title }}</span>
      <component :is="icon" v-if="icon" class="stat-icon" aria-hidden="true" />
    </div>
    <strong>{{ value }}</strong>
    <p>{{ subtitle }}</p>
  </article>
</template>
