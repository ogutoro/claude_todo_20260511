export type Priority = 'low' | 'medium' | 'high'
export type Filter = 'all' | 'active' | 'completed'
export type SortBy = 'created' | 'priority' | 'dueDate'

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: Priority
  createdAt: string
  dueDate?: string
}
