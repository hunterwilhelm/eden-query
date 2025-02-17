<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { routes } from './router'
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <ul>
          <li v-for="route in routes" :key="route.path">
            <RouterLink :to="route.path">{{ route.name }}</RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped></style>
