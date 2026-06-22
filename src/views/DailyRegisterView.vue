<script setup>
const habits = [
  'Treino',
  'Estudo',
  'Cozinhar',
  'Leitura',
  'Crochê',
  'Descanso',
]
</script>

<template>
  <section class="page-section">
    <div class="page-title">
      <span class="eyebrow">Registro diário</span>
      <h2>Como foi sua disciplina hoje?</h2>
      <p>
        Marque os hábitos cumpridos e adicione uma observação. Na próxima etapa,
        essa tela vai salvar os dados automaticamente.
      </p>
    </div>

    <div class="panel">
      <div class="register-list">
        <label
          v-for="habit in habits"
          :key="habit"
          class="register-item"
        >
          <input type="checkbox" />
          <span>{{ habit }}</span>
          <small>Pendente</small>
        </label>
      </div>

      <div class="form-group">
        <label for="note">Observação do dia</label>
        <textarea
          id="note"
          placeholder="Ex: estudei Vue, treinei completo, não consegui ler hoje..."
        ></textarea>
      </div>

      <button class="btn-primary" type="button">
        Salvar registro
      </button>
    </div>
  </section>
</template>