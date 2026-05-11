'use client'

import { useState } from 'react'
import { useTodoStore } from '@/store/todo-store'
import type { Todo, Priority } from '@/types/todo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TodoFormProps {
  open: boolean
  onClose: () => void
  todo?: Todo
}

export function TodoForm({ open, onClose, todo }: TodoFormProps) {
  const { addTodo, updateTodo } = useTodoStore()
  const isEdit = !!todo

  const [title, setTitle] = useState(todo?.title ?? '')
  const [description, setDescription] = useState(todo?.description ?? '')
  const [priority, setPriority] = useState<Priority>(todo?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(todo?.dueDate ?? '')

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) handleClose()
  }

  const handleClose = () => {
    if (!isEdit) {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
    }
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      completed: todo?.completed ?? false,
    }

    if (isEdit && todo) {
      updateTodo(todo.id, data)
    } else {
      addTodo(data)
    }
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'タスクを編集' : '新しいタスク'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              placeholder="タスクのタイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">説明（任意）</Label>
            <Textarea
              id="description"
              placeholder="詳細を入力..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>優先度</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 高</SelectItem>
                  <SelectItem value="medium">🟡 中</SelectItem>
                  <SelectItem value="low">🟢 低</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueDate">期限日（任意）</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {isEdit ? '更新' : '追加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
