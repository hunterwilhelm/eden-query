<script setup lang="ts">
import { computed } from 'vue'
import { eden } from '../lib/eden'

const query = eden.api.todos.get.useQuery()

const rows = computed(() =>
  [
    ['isPending', query.isPending.value],
    ['isFetching', query.isFetching.value],
    ['isError', query.isError.value],
    ['error', query.error.value],
    ['data', query.data.value],
    ['isSuccess', query.isSuccess.value],
  ].map(([key, value]) => ({ key, value: JSON.stringify(value) })),
)
</script>

<template>
  <main>Home View</main>
  <table v-if="query.data">
    <thead>
      <tr>
        <th>Property</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="{ key, value } in rows" :key="key">
        <td>{{ key }}</td>
        <td>{{ value }}</td>
      </tr>
    </tbody>
  </table>
</template>
