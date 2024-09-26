<script setup lang="ts">
import { computed } from 'vue'
import { eden } from '../lib/eden'

const helloQuery = eden.hello.get.useQuery({ search: 'Alice' }, undefined)

const value = computed(() => {
  const value = JSON.stringify(helloQuery.isPending.value ?? 'undefined')
  return value
})
const goodbyeMutation = eden.mutate.goodbye.post.useMutation({
  onSuccess: () => {
    console.log('Goodbye mutation was successful')
  },
})
function handleMutation() {
  try {
    throw new Error('This is an error')
  } catch (error) {}

  goodbyeMutation.mutate()
}
function handleMutation2() {
  try {
    throw new Error('This is an error')
  } catch (error) {}

  goodbye2Mutation.mutate()
}
const goodbye2Mutation = eden.mutate.goodbye.post.useMutation({})
</script>

<template>
  <div>
    <p>{{ value }}</p>
    <button @click="handleMutation">Say Goodbye</button>
    <button @click="handleMutation2">Say Goodbye2</button>
  </div>
</template>

<style scoped>
/* Add any necessary styles here */
</style>
