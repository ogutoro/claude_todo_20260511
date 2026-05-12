import { TodoList } from '@/components/todo-list'
import { ThemeToggle } from '@/components/theme-toggle'
import { CheckSquare } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <CheckSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">TODO</h1>
              <p className="text-xs text-muted-foreground">タスクを管理しましょう</p>
            </div>
          </div>
          <ThemeToggle />
        </header>
        <TodoList />
      </div>
    </main>
  )
}
