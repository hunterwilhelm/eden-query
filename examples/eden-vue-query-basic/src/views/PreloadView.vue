<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { eden } from '../lib/eden'
import Preload from '../components/Preload.vue'
const utils = eden.useUtils()
const loaded = ref(false)
async function load() {
  await utils.index.get.fetch()
  loaded.value = true
}
onMounted(() => {
  load()
})
</script>
<template>
  <main>
    <Preload />
  </main>
</template>

<style scoped>
/* Add styles if needed */
</style>
