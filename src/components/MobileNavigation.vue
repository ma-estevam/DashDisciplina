<script setup>
import { computed, ref, watch } from 'vue'
import { LogOut, Menu, X } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import NavItem from './NavItem.vue'

const props = defineProps({
  navItems: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['logout'])
const route = useRoute()
const isOpen = ref(false)

const primaryItems = computed(() => props.navItems.slice(0, 4))
const moreItems = computed(() => props.navItems.slice(4))

watch(
  () => route.fullPath,
  () => {
    isOpen.value = false
  },
)

function handleLogout() {
  isOpen.value = false
  emit('logout')
}
</script>

<template>
  <div class="mobile-navigation" aria-label="Navegação mobile">
    <nav class="mobile-nav-bar" aria-label="Atalhos principais">
      <NavItem v-for="item in primaryItems" :key="item.to" :item="item" compact />

      <button
        class="nav-link nav-link-compact mobile-more-button"
        type="button"
        :aria-expanded="isOpen"
        aria-controls="mobile-nav-drawer"
        aria-label="Abrir mais páginas"
        @click="isOpen = !isOpen"
      >
        <Menu v-if="!isOpen" class="nav-icon" aria-hidden="true" />
        <X v-else class="nav-icon" aria-hidden="true" />
        <span>Mais</span>
      </button>
    </nav>

    <div v-if="isOpen" class="mobile-nav-backdrop" @click="isOpen = false"></div>

    <section v-if="isOpen" id="mobile-nav-drawer" class="mobile-nav-drawer" aria-label="Todas as páginas">
      <div class="mobile-drawer-header">
        <div>
          <span class="eyebrow">Menu</span>
          <h3>Disciplina 24/7</h3>
        </div>
        <button class="icon-button" type="button" aria-label="Fechar menu" @click="isOpen = false">
          <X aria-hidden="true" />
        </button>
      </div>

      <nav class="mobile-drawer-links" aria-label="Mais páginas">
        <NavItem v-for="item in moreItems" :key="item.to" :item="item" />
      </nav>

      <button class="logout-btn mobile-logout" type="button" aria-label="Sair da conta" @click="handleLogout">
        <LogOut class="button-icon" aria-hidden="true" />
        Sair
      </button>
    </section>
  </div>
</template>
