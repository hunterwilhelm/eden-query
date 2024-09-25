<script setup lang="ts">
import { computed } from 'vue'
import { eden } from '../lib/eden'

const response = eden.useQueries((e) => {
  return [e.index.get(), e.bye.get()]
})
const hello = computed(() => response.value[0]!)
const bye = computed(() => response.value[1]!)
</script>

<template>
  <main>
    <h1>Use Queries</h1>
    <p>
      The two queries should be fetched concurrently like the batch example. But this time using the
      useQueries API.
    </p>
    <div>
      <p v-if="hello.isLoading">Hello loading...</p>
      <p v-else-if="hello.isError">
        <b>Hello Error: </b>
        <span>{{ hello.error?.message }}</span>
      </p>
      <p v-else>
        <b>Hello Query: </b>
        <span>{{ hello.data }}</span>
      </p>
    </div>
    <hr />
    <div>
      <p v-if="bye.isLoading">Bye loading...</p>
      <p v-else-if="bye.isError">
        <b>Bye Error: </b>
        <span>{{ bye.error?.message }}</span>
      </p>
      <p v-else>
        <b>Bye Query: </b>
        <span>{{ bye.data }}</span>
      </p>
    </div>
  </main>
</template>
