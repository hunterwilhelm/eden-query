import { createRouter, createWebHistory } from 'vue-router'

import HomeView from './views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/abort',
      component: () => import('./views/AbortView.vue'),
    },
    {
      path: '/batch',
      component: () => import('./views/BatchView.vue'),
    },
    {
      path: '/mutation',
      name: 'mutation',
      component: () => import('./views/MutationView.vue'),
    },
    {
      path: '/mutation-query-params',
      name: 'mutation-query-params',
      component: () => import('./views/MutationQueryParamsView.vue'),
    },
    {
      path: '/reactive-input',
      name: 'reactive-input',
      component: () => import('./views/ReactiveInputView.vue'),
    },
    {
      path: '/reactive-params',
      name: 'reactive-params',
      component: () => import('./views/ReactiveParamsView.vue'),
    },
    {
      path: '/preload',
      name: 'preload',
      component: () => import('./views/PreloadView.vue'),
    },
    {
      path: '/use-queries',
      name: 'use-queries',
      component: () => import('./views/UseQueriesView.vue'),
    },
    {
      path: '/infinite',
      name: 'infinite',
      component: () => import('./views/InfiniteView.vue'),
    },
  ],
})

export default router
