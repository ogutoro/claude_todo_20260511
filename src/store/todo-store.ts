'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Todo, Filter, SortBy } from '@/types/todo'

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

interface TodoStore {
  todos: Todo[]
  filter: Filter
  sortBy: SortBy
  addTodo: (data: Omit<Todo, 'id' | 'createdAt'>) => void
  updateTodo: (id: string, data: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
  deleteTodo: (id: string) => void
  toggleTodo: (id: string) => void
  setFilter: (filter: Filter) => void
  setSortBy: (sortBy: SortBy) => void
  clearCompleted: () => void
  filteredAndSortedTodos: () => Todo[]
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      todos: [],
      filter: 'all',
      sortBy: 'created',

      addTodo: (data) =>
        set((state) => ({
          todos: [
            ...state.todos,
            { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),

      updateTodo: (id, data) =>
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),

      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        })),

      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        })),

      setFilter: (filter) => set({ filter }),
      setSortBy: (sortBy) => set({ sortBy }),

      clearCompleted: () =>
        set((state) => ({
          todos: state.todos.filter((t) => !t.completed),
        })),

      filteredAndSortedTodos: () => {
        const { todos, filter, sortBy } = get()
        let filtered = todos
        if (filter === 'active') filtered = todos.filter((t) => !t.completed)
        if (filter === 'completed') filtered = todos.filter((t) => t.completed)

        return [...filtered].sort((a, b) => {
          if (sortBy === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
          if (sortBy === 'dueDate') {
            if (!a.dueDate && !b.dueDate) return 0
            if (!a.dueDate) return 1
            if (!b.dueDate) return -1
            return a.dueDate.localeCompare(b.dueDate)
          }
          return b.createdAt.localeCompare(a.createdAt)
        })
      },
    }),
    { name: 'claude-todo-storage' }
  )
)
