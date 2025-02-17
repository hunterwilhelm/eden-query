<script setup lang="ts">
import { eden } from '../lib/eden'
import { routes } from '../router'
const [hello, bye] = eden.useQueries((e) => {
  return [e.api.index.get(), e.api.bye.get()]
})
</script>

<template>
  <div>
    <h1>{{ routes.UseQueriesView.name }}</h1>
  </div>
</template>

<style></style>
