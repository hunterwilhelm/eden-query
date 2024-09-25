<script setup lang="ts">
import { computed, ref } from 'vue'
import { eden } from '../lib/eden'

// Fetch todos query
const todosQuery = eden.todos.get.useQuery()
const todos = computed(() => todosQuery.data.value)

// Mutation for adding todos
const addTodo = eden.todos.post.useMutation()

// Mutation for deleting todos
const deleteTodo = eden.todos.delete.useMutation()

// Utils for invalidating queries
const utils = eden.useUtils()

// Local state for the todo content
const content = ref('')

// Method to handle adding a todo
const handleAddTodo = async () => {
  await addTodo.mutateAsync({ completed: false, content: content.value })
  await utils.todos.get.invalidate()
  content.value = ''
}

// Method to handle deleting a todo
const handleDeleteTodo = async (id: string) => {
  await deleteTodo.mutateAsync(id)
  await utils.todos.get.invalidate()
}
</script>

<template>
  <main>
    <h1>Mutation</h1>

    <p>Todos:</p>

    <ul>
      <li
        v-for="todo in todos"
        :key="todo.id"
        style="display: flex; align-items: center; gap: 1rem"
      >
        <input type="checkbox" :checked="todo.completed" />
        <p>{{ todo.content }}</p>
        <button @click="() => handleDeleteTodo(todo.id)">Delete</button>
      </li>
    </ul>

    <form @submit.prevent="handleAddTodo">
      <input type="text" v-model="content" />
      <button>Add Todo</button>
    </form>
  </main>
</template>
