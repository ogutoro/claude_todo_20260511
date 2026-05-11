import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { TodoItem } from '@/components/todo-item'
import { useTodoStore } from '@/store/todo-store'
import type { Todo } from '@/types/todo'

const reset = () =>
  useTodoStore.setState({ todos: [], filter: 'all', sortBy: 'created' })

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'test-id',
    title: 'テストタスク',
    priority: 'medium',
    completed: false,
    createdAt: '2026-05-11T00:00:00.000Z',
    ...overrides,
  }
}

describe('TodoItem', () => {
  beforeEach(() => {
    localStorage.clear()
    reset()
  })

  // ── タイトル・説明 ────────────────────────────────────────────────
  it('todoのタイトルを表示する', () => {
    render(<TodoItem todo={makeTodo({ title: '買い物をする' })} />)
    expect(screen.getByText('買い物をする')).toBeInTheDocument()
  })

  it('説明が存在するとき表示する', () => {
    render(<TodoItem todo={makeTodo({ description: 'スーパーで牛乳を買う' })} />)
    expect(screen.getByText('スーパーで牛乳を買う')).toBeInTheDocument()
  })

  it('説明が未設定のとき説明要素を表示しない', () => {
    render(<TodoItem todo={makeTodo({ description: undefined })} />)
    // 説明はpタグで囲まれる想定
    const paragraphs = document.querySelectorAll('p')
    expect(paragraphs).toHaveLength(0)
  })

  // ── 優先度バッジ ─────────────────────────────────────────────────
  it('優先度 "high" のとき "高" バッジを表示する', () => {
    render(<TodoItem todo={makeTodo({ priority: 'high' })} />)
    expect(screen.getByText('高')).toBeInTheDocument()
  })

  it('優先度 "medium" のとき "中" バッジを表示する', () => {
    render(<TodoItem todo={makeTodo({ priority: 'medium' })} />)
    expect(screen.getByText('中')).toBeInTheDocument()
  })

  it('優先度 "low" のとき "低" バッジを表示する', () => {
    render(<TodoItem todo={makeTodo({ priority: 'low' })} />)
    expect(screen.getByText('低')).toBeInTheDocument()
  })

  // ── 期限日 ───────────────────────────────────────────────────────
  it('期限日が設定されているとき日付を表示する', () => {
    render(<TodoItem todo={makeTodo({ dueDate: '2026-12-31' })} />)
    expect(screen.getByText(/12月31日/)).toBeInTheDocument()
  })

  it('期限日が未設定のとき日付エリアを表示しない', () => {
    render(<TodoItem todo={makeTodo({ dueDate: undefined })} />)
    // 期限日があるとき「月日」形式のテキストが表示されるが、未設定なら表示されない
    expect(screen.queryByText(/月\d+日/)).not.toBeInTheDocument()
  })

  it('期限超過かつ未完了のとき "期限超過" テキストを表示する', () => {
    render(<TodoItem todo={makeTodo({ dueDate: '2020-01-01', completed: false })} />)
    expect(screen.getByText(/期限超過/)).toBeInTheDocument()
  })

  it('期限超過でも完了済みなら "期限超過" テキストを表示しない', () => {
    render(<TodoItem todo={makeTodo({ dueDate: '2020-01-01', completed: true })} />)
    expect(screen.queryByText(/期限超過/)).not.toBeInTheDocument()
  })

  it('未来の期限日は "期限超過" テキストを表示しない', () => {
    render(<TodoItem todo={makeTodo({ dueDate: '2099-12-31', completed: false })} />)
    expect(screen.queryByText(/期限超過/)).not.toBeInTheDocument()
  })

  // ── 完了状態 ─────────────────────────────────────────────────────
  it('完了済みtodoのタイトルに line-through クラスが付く', () => {
    render(<TodoItem todo={makeTodo({ title: '完了済みタスク', completed: true })} />)
    expect(screen.getByText('完了済みタスク')).toHaveClass('line-through')
  })

  it('未完了todoのタイトルに line-through クラスが付かない', () => {
    render(<TodoItem todo={makeTodo({ title: '未完了タスク', completed: false })} />)
    expect(screen.getByText('未完了タスク')).not.toHaveClass('line-through')
  })

  // ── チェックボックス操作 ──────────────────────────────────────────
  it('チェックボックスをクリックするとstoreのcompletedがtrueになる', async () => {
    useTodoStore.getState().addTodo({ title: 'Task', priority: 'medium', completed: false })
    const todo = useTodoStore.getState().todos[0]

    render(<TodoItem todo={todo} />)
    await userEvent.click(screen.getByRole('checkbox'))

    expect(useTodoStore.getState().todos[0].completed).toBe(true)
  })

  it('完了済みtodoのチェックボックスをクリックするとcompletedがfalseになる', async () => {
    useTodoStore.getState().addTodo({ title: 'Task', priority: 'medium', completed: true })
    const todo = useTodoStore.getState().todos[0]

    render(<TodoItem todo={todo} />)
    await userEvent.click(screen.getByRole('checkbox'))

    expect(useTodoStore.getState().todos[0].completed).toBe(false)
  })

  // ── 削除フロー ────────────────────────────────────────────────────
  it('メニューから削除を選択→確認→storeからtodoが消える', async () => {
    useTodoStore.getState().addTodo({ title: '削除対象', priority: 'medium', completed: false })
    const todo = useTodoStore.getState().todos[0]

    render(<TodoItem todo={todo} />)

    // メニューボタンをクリック
    await userEvent.click(screen.getByRole('button', { name: 'メニュー' }))

    // ドロップダウン内の「削除」をクリック
    await userEvent.click(await screen.findByRole('menuitem', { name: /削除/ }))

    // AlertDialogの確認「削除」ボタンをクリック
    await userEvent.click(await screen.findByRole('button', { name: /^削除$/ }))

    expect(useTodoStore.getState().todos).toHaveLength(0)
  })

  it('メニューから「編集」を選択すると編集フォームが開く', async () => {
    useTodoStore.getState().addTodo({ title: '編集対象', priority: 'medium', completed: false })
    const todo = useTodoStore.getState().todos[0]

    render(<TodoItem todo={todo} />)

    await userEvent.click(screen.getByRole('button', { name: 'メニュー' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: /編集/ }))

    expect(await screen.findByText('タスクを編集')).toBeInTheDocument()
  })
})
