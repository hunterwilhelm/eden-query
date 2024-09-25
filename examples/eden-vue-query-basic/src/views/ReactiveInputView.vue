<script setup lang="ts">
import { keepPreviousData } from '@tanstack/react-query'
import { ref } from 'vue'
import { eden, type InferInput } from '../lib/eden'

const input = ref<InferInput['names']['get']['query']>({
  search: '',
})
const names = eden.names.get.useQuery(input.value, {
  placeholderData: keepPreviousData,
})

const handleNameChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  input.value.search = target.value
}
</script>

<template>
  <main>
    <h1>Reactive Input</h1>

    <p>Matching Names</p>

    <p>The developer can optimize this reactive input by using debounce...</p>

    <ul>
      <li v-for="(name, index) in names.data.value" :key="index">{{ name }}</li>
    </ul>

    <label>
      <p>Search for a name by typing into the box</p>
      <input
        type="text"
        @input="handleNameChange"
        v-model="input.search"
        placeholder="Enter name here..."
      />
    </label>
  </main>
</template>

<style scoped>
/* Add any necessary styles here */
</style>
