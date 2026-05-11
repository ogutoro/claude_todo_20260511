'use client'

import { useState } from 'react'
import { useTodoStore } from '@/store/todo-store'
import type { Filter, SortBy } from '@/types/todo'
import { TodoItem } from '@/components/todo-item'
import { TodoForm } from '@/components/todo-form'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Circle, ListTodo, Plus, Trash2 } from 'lucide-react'

const FILTER_LABELS: Record<Filter, string> = {
  all: 'すべて',
  active: '未完了',
  completed: '完了済み',
}

export function TodoList() {
  const { todos, filter, sortBy, setFilter, setSortBy, clearCompleted, filteredAndSortedTodos } =
    useTodoStore()
  const [addOpen, setAddOpen] = useState(false)

  const displayed = filteredAndSortedTodos()
  const activeCount = todos.filter((t) => !t.completed).length
  const completedCount = todos.filter((t) => t.completed).length

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<ListTodo className="h-4 w-4 text-muted-foreground" />}
          label="合計"
          value={todos.length}
        />
        <StatCard
          icon={<Circle className="h-4 w-4 text-blue-500" />}
          label="未完了"
          value={activeCount}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
          label="完了済み"
          value={completedCount}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
              <TabsTrigger key={f} value={f}>
                {FILTER_LABELS[f]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">作成日順</SelectItem>
              <SelectItem value="priority">優先度順</SelectItem>
              <SelectItem value="dueDate">期限日順</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            新しいタスク
          </Button>
        </div>
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <EmptyState filter={filter} onAdd={() => setAddOpen(true)} />
      ) : (
        <ScrollArea className="max-h-[calc(100vh-22rem)]">
          <div className="flex flex-col gap-2 pr-4">
            {displayed.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Clear completed */}
      {completedCount > 0 && (
        <>
          <Separator />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{completedCount} 件の完了済みタスク</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-destructive"
              onClick={clearCompleted}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              完了済みを削除
            </Button>
          </div>
        </>
      )}

      <TodoForm open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
    </div>
  )
}

function EmptyState({ filter, onAdd }: { filter: Filter; onAdd: () => void }) {
  const messages: Record<Filter, { title: string; desc: string }> = {
    all: { title: 'タスクがありません', desc: '新しいタスクを追加してみましょう！' },
    active: { title: '未完了のタスクはありません', desc: 'すべてのタスクが完了しています！' },
    completed: { title: '完了済みのタスクはありません', desc: 'タスクを完了すると、ここに表示されます。' },
  }
  const { title, desc } = messages[filter]

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-14 text-center">
      <CheckCircle2 className="h-10 w-10 text-muted-foreground/40" />
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      </div>
      {filter === 'all' && (
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="mr-1 h-4 w-4" />
          タスクを追加
        </Button>
      )}
    </div>
  )
}
