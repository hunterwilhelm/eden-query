import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
export const routes = {
  HomeView: {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  MutationWithOnSuccessAndInvalidationView: {
    path: '/mutation-with-on-success-and-invalidation',
    name: 'mutation with on success and invalidation view',
    component: () => import('../views/MutationWithOnSuccessAndInvalidationView.vue'),
  },
  UseQueriesView: {
    path: '/use-queries',
    name: 'use queries',
    component: () => import('../views/UseQueriesView.vue'),
  },
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: Object.values(routes),
})

export default router
