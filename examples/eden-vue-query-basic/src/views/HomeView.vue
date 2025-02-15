<script setup lang="ts">
import { computed } from 'vue'
import { eden } from '../lib/eden'

const query = eden.api.todos.get.useQuery()

const rows = computed(() =>
  [
    ['isPending', query.isPending.value] as const,
    ['isFetching', query.isFetching.value] as const,
    ['isError', query.isError.value] as const,
    ['error', query.error.value] as const,
    ['data', query.data.value] as const,
    ['isSuccess', query.isSuccess.value] as const,
  ].map(([key, value]) => ({ key, value: JSON.stringify(value) }) as const),
)

const mutation = eden.api.nendoroid({ id: 1895 }).put.useMutation()

function mutate() {
  mutation.mutate({
    from: '',
    name: '',
  })
}

const mutationRows = computed(() =>
  [
    ['isPending', mutation.isPending.value] as const,
    ['isError', mutation.isError.value] as const,
    ['error', mutation.error.value] as const,
    ['data', mutation.data.value] as const,
    ['isSuccess', mutation.isSuccess.value] as const,
  ].map(([key, value]) => ({ key, value: JSON.stringify(value) }) as const),
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

  <button @click="mutate">Mutate</button>
  <table v-if="mutation.data">
    <thead>
      <tr>
        <th>Property</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="{ key, value } in mutationRows" :key="key">
        <td>{{ key }}</td>
        <td>{{ value }}</td>
      </tr>
    </tbody>
  </table>
</template>
