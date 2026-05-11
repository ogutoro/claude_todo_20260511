'use client'

import { useState } from 'react'
import { useTodoStore } from '@/store/todo-store'
import type { Todo, Priority } from '@/types/todo'
import { TodoForm } from '@/components/todo-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CalendarIcon, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  high: { label: '高', className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100' },
  medium: { label: '中', className: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100' },
  low: { label: '低', className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100' },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

function isOverdue(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr + 'T00:00:00') < today
}

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, deleteTodo } = useTodoStore()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const priority = PRIORITY_CONFIG[todo.priority]
  const overdue = todo.dueDate && !todo.completed && isOverdue(todo.dueDate)

  return (
    <>
      <div
        className={cn(
          'group flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors',
          todo.completed && 'opacity-60'
        )}
      >
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => toggleTodo(todo.id)}
          className="mt-0.5 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'text-sm font-medium leading-snug',
                todo.completed && 'line-through text-muted-foreground'
              )}
            >
              {todo.title}
            </span>
            <Badge variant="outline" className={cn('h-5 px-1.5 text-xs', priority.className)}>
              {priority.label}
            </Badge>
          </div>

          {todo.description && (
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {todo.description}
            </p>
          )}

          {todo.dueDate && (
            <div
              className={cn(
                'mt-1.5 flex items-center gap-1 text-xs',
                overdue ? 'text-red-500' : 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="h-3 w-3" />
              <span>{formatDate(todo.dueDate)}{overdue ? ' · 期限超過' : ''}</span>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">メニュー</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              編集
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <TodoForm open={editOpen} onClose={() => setEditOpen(false)} todo={todo} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>タスクを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{todo.title}」を削除します。この操作は元に戻せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTodo(todo.id)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
