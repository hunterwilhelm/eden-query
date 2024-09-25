<script lang="ts" setup>
import { eden } from '../lib/eden'

// Queries
const hello = eden.index.get.useQuery()
const bye = eden.bye.get.useQuery()
</script>

<template>
  <main>
    <h1>Batch</h1>

    <p>
      Because two queries are launched concurrently, the request is actually made to a /batch
      endpoint.
    </p>

    <div>
      <p v-if="hello.isLoading.value">Hello loading...</p>
      <p v-else-if="hello.isError.value">
        <b>Hello Error: </b>
        <span>{{ hello.error.value?.message }}</span>
      </p>
      <p v-else>
        <b>Hello Query: </b>
        <span>{{ hello.data }}</span>
      </p>
    </div>

    <hr />

    <div>
      <p v-if="bye.isLoading.value">Bye loading...</p>
      <p v-else-if="bye.isError.value">
        <b>Bye Error: </b>
        <span>{{ bye.error.value?.message }}</span>
      </p>
      <p v-else>
        <b>Bye Query: </b>
        <span>{{ bye.data }}</span>
      </p>
    </div>
  </main>
</template>

<style scoped>
/* Add any styles here if needed */
</style>
