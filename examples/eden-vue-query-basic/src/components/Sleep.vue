<script lang="ts" setup>
import { eden } from '../lib/eden' // Adjust the path as needed

const sleep = eden.sleep.get.useQuery()
</script>
<template>
  <div>
    <p>
      <span>Result: </span>
      <span v-if="sleep.isLoading">Loading...</span>
      <span v-else>{{ sleep.data }}</span>
    </p>
  </div>
</template>

<style scoped>
/* Add styles if needed */
</style>
