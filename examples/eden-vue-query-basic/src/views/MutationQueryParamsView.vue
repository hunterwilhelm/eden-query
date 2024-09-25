<script lang="ts" setup>
import { eden } from '../lib/eden'

// Composable logic
const withParam = eden.nendoroid({ id: 1895 }).put.useMutation()
const withParamQuery = eden.nendoroid({ id: 1895 }).patch.useMutation()

const handleParamMutation = async () => {
  try {
    await withParam.mutateAsync({ from: '', name: '' }, {})
  } catch (error) {
    console.error('Error during mutation:', error)
  }
}

const handleQueryParamMutation = async () => {
  try {
    await withParamQuery.mutateAsync({ from: '', name: '' }, { query: { location: '' } })
  } catch (error) {
    console.error('Error during query mutation:', error)
  }
}
</script>

<template>
  <main>
    <button @click="handleParamMutation">Params only</button>
    <button @click="handleQueryParamMutation">Params with query</button>
  </main>
</template>
