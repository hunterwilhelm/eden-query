<script lang="ts" setup>
import { ref } from 'vue'
import Sleep from '../components/Sleep.vue'

const show = ref(false)

const toggle = () => {
  show.value = !show.value
}
</script>

<template>
  <main>
    <h1>Abort</h1>
    <button @click="toggle">Toggle Component</button>
    <p>
      The toggle-able component does a long query. If it's hidden before the request ends, then the
      request should be aborted.
    </p>
    <Sleep v-if="show" />
  </main>
</template>

<style scoped>
/* Add styles if needed */
</style>
