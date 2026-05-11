import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { TodoList } from '@/components/todo-list'
import { useTodoStore } from '@/store/todo-store'

const reset = () =>
  useTodoStore.setState({ todos: [], filter: 'all', sortBy: 'created' })

describe('TodoList', () => {
  beforeEach(() => {
    localStorage.clear()
    reset()
  })

  // ── 統計カード ────────────────────────────────────────────────────
  it('todoが0件のとき統計がすべて0を表示する', async () => {
    render(<TodoList />)
    // マウント後のレンダリングを待つ
    await screen.findByText('合計')

    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(3)
  })

  it('1件未完了・1件完了済みのとき統計が合計2・未完了1・完了1を表示する', async () => {
    useTodoStore.getState().addTodo({ title: 'Active', priority: 'medium', completed: false })
    useTodoStore.getState().addTodo({ title: 'Done', priority: 'medium', completed: true })

    render(<TodoList />)
    await screen.findByText('合計')

    // 合計=2、未完了=1、完了済み=1 が表示されている
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getAllByText('1')).toHaveLength(2)
  })

  // ── 空の状態 ──────────────────────────────────────────────────────
  it('todoが0件のとき空状態メッセージを表示する', async () => {
    render(<TodoList />)
    expect(await screen.findByText('タスクがありません')).toBeInTheDocument()
  })

  it('空状態に "タスクを追加" ボタンが表示される', async () => {
    render(<TodoList />)
    expect(await screen.findByRole('button', { name: 'タスクを追加' })).toBeInTheDocument()
  })

  // ── todo一覧表示 ──────────────────────────────────────────────────
  it('storeのtodoタイトルを一覧表示する', async () => {
    useTodoStore.getState().addTodo({ title: '買い物する', priority: 'high', completed: false })
    useTodoStore.getState().addTodo({ title: '本を読む', priority: 'low', completed: false })

    render(<TodoList />)

    expect(await screen.findByText('買い物する')).toBeInTheDocument()
    expect(screen.getByText('本を読む')).toBeInTheDocument()
  })

  // ── フィルタータブ ────────────────────────────────────────────────
  it('"未完了" タブで未完了のtodoだけ表示する', async () => {
    useTodoStore.getState().addTodo({ title: '未完了タスク', priority: 'medium', completed: false })
    useTodoStore.getState().addTodo({ title: '完了済みタスク', priority: 'medium', completed: true })

    render(<TodoList />)
    await userEvent.click(await screen.findByRole('tab', { name: '未完了' }))

    expect(screen.getByText('未完了タスク')).toBeInTheDocument()
    expect(screen.queryByText('完了済みタスク')).not.toBeInTheDocument()
  })

  it('"完了済み" タブで完了済みのtodoだけ表示する', async () => {
    useTodoStore.getState().addTodo({ title: '未完了タスク', priority: 'medium', completed: false })
    useTodoStore.getState().addTodo({ title: '完了済みタスク', priority: 'medium', completed: true })

    render(<TodoList />)
    await userEvent.click(await screen.findByRole('tab', { name: '完了済み' }))

    expect(screen.queryByText('未完了タスク')).not.toBeInTheDocument()
    expect(screen.getByText('完了済みタスク')).toBeInTheDocument()
  })

  it('"すべて" タブですべてのtodoを表示する', async () => {
    useTodoStore.getState().addTodo({ title: '未完了タスク', priority: 'medium', completed: false })
    useTodoStore.getState().addTodo({ title: '完了済みタスク', priority: 'medium', completed: true })

    render(<TodoList />)
    // いったん別タブへ
    await userEvent.click(await screen.findByRole('tab', { name: '未完了' }))
    await userEvent.click(screen.getByRole('tab', { name: 'すべて' }))

    expect(screen.getByText('未完了タスク')).toBeInTheDocument()
    expect(screen.getByText('完了済みタスク')).toBeInTheDocument()
  })

  it('フィルターを切り替えるとstoreのfilterが更新される', async () => {
    render(<TodoList />)
    await userEvent.click(await screen.findByRole('tab', { name: '完了済み' }))
    expect(useTodoStore.getState().filter).toBe('completed')
  })

  // ── 完了済みを削除 ────────────────────────────────────────────────
  it('完了済みtodoがあるとき "完了済みを削除" ボタンを表示する', async () => {
    useTodoStore.getState().addTodo({ title: 'Done', priority: 'medium', completed: true })

    render(<TodoList />)
    expect(await screen.findByRole('button', { name: /完了済みを削除/ })).toBeInTheDocument()
  })

  it('完了済みtodoがないとき "完了済みを削除" ボタンを表示しない', async () => {
    useTodoStore.getState().addTodo({ title: 'Active', priority: 'medium', completed: false })

    render(<TodoList />)
    await screen.findByText('Active') // マウント後まで待つ
    expect(screen.queryByRole('button', { name: /完了済みを削除/ })).not.toBeInTheDocument()
  })

  it('"完了済みを削除" ボタンをクリックすると完了済みtodoがstoreから消える', async () => {
    useTodoStore.getState().addTodo({ title: 'Active', priority: 'medium', completed: false })
    useTodoStore.getState().addTodo({ title: 'Done', priority: 'medium', completed: true })

    render(<TodoList />)
    await userEvent.click(await screen.findByRole('button', { name: /完了済みを削除/ }))

    const { todos } = useTodoStore.getState()
    expect(todos).toHaveLength(1)
    expect(todos[0].title).toBe('Active')
  })

  // ── 新しいタスク追加 ──────────────────────────────────────────────
  it('"新しいタスク" ボタンをクリックすると追加フォームが開く', async () => {
    render(<TodoList />)
    await userEvent.click(await screen.findByRole('button', { name: /新しいタスク/ }))
    // ダイアログが開くことを確認（ボタンテキストと重複しないよう role で確認）
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })
})
