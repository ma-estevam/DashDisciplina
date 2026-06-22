<script setup>
const exceptions = [
  {
    date: '05/07/2026',
    title: 'Dia de descanso e recuperação',
    description: 'Manter leitura leve, organização da semana e crochê se possível.',
  },
  {
    date: '16/07/2026',
    title: 'Rotina reduzida',
    description: 'Priorizar treino curto, estudo essencial e descanso.',
  },
  {
    date: '15/08/2026',
    title: 'Dia flexível',
    description: 'Usar para descanso, crochê, organização pessoal e preparação.',
  },
  {
    date: '25/08/2026',
    title: 'Rotina mínima',
    description: 'Priorizar estudo importante, alimentação organizada e descanso.',
  },
]
</script>

<template>
  <section class="page-section">
    <div class="page-title">
      <span class="eyebrow">Exceções planejadas</span>
      <h2>Dias em que a rotina será adaptada.</h2>
      <p>
        Nesses dias, o sistema não precisa cobrar a rotina completa. A disciplina
        continua, mas com uma versão reduzida.
      </p>
    </div>

    <div class="exception-list">
      <article
        v-for="item in exceptions"
        :key="item.date"
        class="exception-card"
      >
        <span>{{ item.date }}</span>
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </article>
    </div>
  </section>
</template>