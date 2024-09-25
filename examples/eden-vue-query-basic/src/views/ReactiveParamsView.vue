<script setup lang="ts">
import { keepPreviousData } from '@tanstack/react-query'
import { computed, ref } from 'vue'
import { eden } from '../lib/eden'

// Use refs for path params
const id = ref(1)
const productQuery = eden.products({ id: id }).get.useQuery(undefined, {
  placeholderData: keepPreviousData,
})
const productData = computed(() => productQuery.data.value)
</script>

<template>
  <main>
    <h1>Reactive Input</h1>

    <p>Matching Names</p>

    <p>The developer can optimize this reactive input by using debounce...</p>

    <p>From API: {{ productData }}</p>

    <label>
      <p>Search for a name by typing into the box</p>
      <input type="number" v-model.number="id" />
    </label>
  </main>
</template>
