<script lang="ts" setup>
import { watch } from 'vue'
import { eden } from '../lib/eden'

const hello = eden.index.get.useQuery({})
watch(hello.isLoading, () => {
  console.log('hello is loading', hello.isLoading.value)
})
</script>
<template>
  <main>
    <h1>Preload</h1>

    <p>Since this page's query has been preloaded, a "loading" message should never be seen.</p>
    <p>Check the console, it's logging the loading state</p>

    <div>
      <div v-if="hello.isLoading.value">Loading...</div>
      <div v-else-if="hello.isError.value">
        <p>Error: {{ hello.error.value?.message }}</p>
      </div>
      <div v-else>
        <p>
          <b>Data: </b>
          <span>{{ hello.data }}</span>
        </p>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
