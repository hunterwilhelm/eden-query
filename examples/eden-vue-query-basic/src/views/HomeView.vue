<script setup lang="ts">
import { ref } from 'vue'

const result = ref(null)

// Fetch data
const fetchData = async () => {
  const response = await fetch('http://localhost:3000/api')
  const data = await response.json()
  result.value = data
}
//
fetchData()
</script>

<template>
  <main>Home View</main>
  <pre>{{ result }}</pre>
</template>
