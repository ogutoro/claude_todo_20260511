import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TodoForm } from '@/components/todo-form'
import { useTodoStore } from '@/store/todo-store'
import type { Todo } from '@/types/todo'

const reset = () =>
  useTodoStore.setState({ todos: [], filter: 'all', sortBy: 'created' })

const EXISTING_TODO: Todo = {
  id: 'existing-id',
  title: '既存のタスク',
  priority: 'low',
  completed: false,
  createdAt: '2026-05-01T00:00:00.000Z',
  description: '既存の説明',
}

describe('TodoForm', () => {
  beforeEach(() => {
    localStorage.clear()
    reset()
  })

  // ── 表示 ───────────────────────────────────────────────────────────
  it('追加モードでは "新しいタスク" というタイトルを表示する', async () => {
    render(<TodoForm open={true} onClose={() => {}} />)
    expect(await screen.findByText('新しいタスク')).toBeInTheDocument()
  })

  it('編集モードでは "タスクを編集" というタイトルを表示する', async () => {
    render(<TodoForm open={true} onClose={() => {}} todo={EXISTING_TODO} />)
    expect(await screen.findByText('タスクを編集')).toBeInTheDocument()
  })

  it('編集モードでは既存のタイトルがinputに入力済みになっている', async () => {
    render(<TodoForm open={true} onClose={() => {}} todo={EXISTING_TODO} />)
    const input = await screen.findByLabelText(/タイトル/)
    expect(input).toHaveValue('既存のタスク')
  })

  it('タイトルが空のとき送信ボタンが無効になっている', async () => {
    render(<TodoForm open={true} onClose={() => {}} />)
    const submitBtn = await screen.findByRole('button', { name: '追加' })
    expect(submitBtn).toBeDisabled()
  })

  it('タイトルを入力すると送信ボタンが有効になる', async () => {
    render(<TodoForm open={true} onClose={() => {}} />)
    const input = await screen.findByLabelText(/タイトル/)
    await userEvent.type(input, 'テストタスク')
    expect(screen.getByRole('button', { name: '追加' })).not.toBeDisabled()
  })

  // ── 追加モード ────────────────────────────────────────────────────
  it('追加モードでフォームを送信するとstoreにtodoが追加される', async () => {
    const onClose = vi.fn()
    render(<TodoForm open={true} onClose={onClose} />)

    const input = await screen.findByLabelText(/タイトル/)
    await userEvent.type(input, '新しいタスク内容')
    await userEvent.click(screen.getByRole('button', { name: '追加' }))

    const { todos } = useTodoStore.getState()
    expect(todos).toHaveLength(1)
    expect(todos[0].title).toBe('新しいタスク内容')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('説明と期限日を入力してもstoreに正しく保存される', async () => {
    render(<TodoForm open={true} onClose={() => {}} />)

    await userEvent.type(await screen.findByLabelText(/タイトル/), '詳細あり')
    await userEvent.type(screen.getByLabelText(/説明/), 'メモ内容')
    await userEvent.type(screen.getByLabelText(/期限日/), '2026-12-31')
    await userEvent.click(screen.getByRole('button', { name: '追加' }))

    const todo = useTodoStore.getState().todos[0]
    expect(todo.title).toBe('詳細あり')
    expect(todo.description).toBe('メモ内容')
    expect(todo.dueDate).toBe('2026-12-31')
  })

  // ── 編集モード ────────────────────────────────────────────────────
  it('編集モードでタイトルを変更して送信するとstoreが更新される', async () => {
    useTodoStore.getState().addTodo({
      title: '元のタイトル',
      priority: 'low',
      completed: false,
    })
    const todo = useTodoStore.getState().todos[0]
    const onClose = vi.fn()

    render(<TodoForm open={true} onClose={onClose} todo={todo} />)

    const input = await screen.findByLabelText(/タイトル/)
    await userEvent.clear(input)
    await userEvent.type(input, '更新したタイトル')
    await userEvent.click(screen.getByRole('button', { name: '更新' }))

    expect(useTodoStore.getState().todos[0].title).toBe('更新したタイトル')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('編集モードで送信しても既存の完了状態が維持される', async () => {
    useTodoStore.getState().addTodo({
      title: '完了済みタスク',
      priority: 'medium',
      completed: true,
    })
    const todo = useTodoStore.getState().todos[0]

    render(<TodoForm open={true} onClose={() => {}} todo={todo} />)

    await userEvent.click(await screen.findByRole('button', { name: '更新' }))

    expect(useTodoStore.getState().todos[0].completed).toBe(true)
  })

  // ── キャンセル ────────────────────────────────────────────────────
  it('キャンセルボタンをクリックするとonCloseが呼ばれる', async () => {
    const onClose = vi.fn()
    render(<TodoForm open={true} onClose={onClose} />)

    await userEvent.click(await screen.findByRole('button', { name: 'キャンセル' }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('キャンセル後storeに変更が加えられない', async () => {
    render(<TodoForm open={true} onClose={() => {}} />)

    const input = await screen.findByLabelText(/タイトル/)
    await userEvent.type(input, '入力途中')
    await userEvent.click(screen.getByRole('button', { name: 'キャンセル' }))

    expect(useTodoStore.getState().todos).toHaveLength(0)
  })
})
