<script setup lang="ts">
import { eden } from '../lib/eden'

const pages = eden.pages.get.useInfiniteQuery(undefined, {
  getNextPageParam: (_lastPage, _allPages, lastPageParams, _allPageParams) => {
    return (lastPageParams ?? 0) + 1
  },
})
const getNextPage = async () => {
  await pages.fetchNextPage()
}
</script>

<template>
  <div>
    <h1>Infinite Query</h1>
    <ul>
      <li v-for="(page, i) in pages.data.value?.pages" :key="i">
        Page: {{ i }}
        <ul>
          <li v-for="(p, ii) in page" :key="ii">
            <b>Item Index: {{ ii }}</b>
            <p>{{ p }}</p>
          </li>
        </ul>
      </li>
    </ul>
    <button @click="getNextPage">Get Next Page</button>
  </div>
</template>

<style></style>
