<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <ul>
        <li>
          <RouterLink to="/">Home</RouterLink>
        </li>
        <li>
          <RouterLink to="/abort">Abort</RouterLink>
        </li>
        <li>
          <RouterLink to="/mutation">Mutation</RouterLink>
        </li>
        <li>
          <RouterLink to="/mutation-query-params">Mutation Query Params</RouterLink>
        </li>
        <li>
          <RouterLink to="/reactive-input">Reactive Input</RouterLink>
        </li>
        <li>
          <RouterLink to="/reactive-params">Reactive Params</RouterLink>
        </li>
        <li>
          <RouterLink to="/batch">Batch</RouterLink>
        </li>
        <li>
          <RouterLink to="/preload">Preload</RouterLink>
        </li>
        <li>
          <RouterLink to="/use-queries">Use Queries</RouterLink>
        </li>
        <li>
          <RouterLink to="/infinite">Infinite</RouterLink>
        </li>
      </ul>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped></style>
