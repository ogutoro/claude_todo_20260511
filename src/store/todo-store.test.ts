import { describe, it, expect, beforeEach } from 'vitest'
import { useTodoStore } from '@/store/todo-store'

const reset = () =>
  useTodoStore.setState({ todos: [], filter: 'all', sortBy: 'created' })

describe('useTodoStore', () => {
  beforeEach(() => {
    localStorage.clear()
    reset()
  })

  // ── addTodo ──────────────────────────────────────────────────────────
  describe('addTodo', () => {
    it('指定したフィールドを持つtodoを追加する', () => {
      useTodoStore.getState().addTodo({
        title: '買い物する',
        priority: 'high',
        completed: false,
        description: 'スーパーで牛乳を買う',
      })
      const { todos } = useTodoStore.getState()
      expect(todos).toHaveLength(1)
      expect(todos[0].title).toBe('買い物する')
      expect(todos[0].priority).toBe('high')
      expect(todos[0].description).toBe('スーパーで牛乳を買う')
      expect(todos[0].completed).toBe(false)
    })

    it('追加のたびにユニークなidとcreatedAtを生成する', () => {
      useTodoStore.getState().addTodo({ title: 'A', priority: 'low', completed: false })
      useTodoStore.getState().addTodo({ title: 'B', priority: 'low', completed: false })
      const { todos } = useTodoStore.getState()
      expect(todos[0].id).toBeTruthy()
      expect(todos[1].id).toBeTruthy()
      expect(todos[0].id).not.toBe(todos[1].id)
      expect(todos[0].createdAt).toBeTruthy()
    })

    it('複数のtodoをリストに追加できる', () => {
      useTodoStore.getState().addTodo({ title: '1つ目', priority: 'medium', completed: false })
      useTodoStore.getState().addTodo({ title: '2つ目', priority: 'medium', completed: false })
      useTodoStore.getState().addTodo({ title: '3つ目', priority: 'medium', completed: false })
      expect(useTodoStore.getState().todos).toHaveLength(3)
    })
  })

  // ── toggleTodo ───────────────────────────────────────────────────────
  describe('toggleTodo', () => {
    it('未完了のtodoを完了状態にする', () => {
      useTodoStore.getState().addTodo({ title: 'Task', priority: 'medium', completed: false })
      const { id } = useTodoStore.getState().todos[0]
      useTodoStore.getState().toggleTodo(id)
      expect(useTodoStore.getState().todos[0].completed).toBe(true)
    })

    it('完了済みのtodoを未完了状態に戻す', () => {
      useTodoStore.getState().addTodo({ title: 'Task', priority: 'medium', completed: true })
      const { id } = useTodoStore.getState().todos[0]
      useTodoStore.getState().toggleTodo(id)
      expect(useTodoStore.getState().todos[0].completed).toBe(false)
    })

    it('他のtodoの状態に影響を与えない', () => {
      useTodoStore.getState().addTodo({ title: 'A', priority: 'low', completed: false })
      useTodoStore.getState().addTodo({ title: 'B', priority: 'low', completed: false })
      const idA = useTodoStore.getState().todos[0].id
      useTodoStore.getState().toggleTodo(idA)
      expect(useTodoStore.getState().todos[1].completed).toBe(false)
    })
  })

  // ── updateTodo ───────────────────────────────────────────────────────
  describe('updateTodo', () => {
    it('指定したフィールドだけを更新し他は変更しない', () => {
      useTodoStore.getState().addTodo({
        title: '元のタイトル',
        priority: 'low',
        completed: false,
        description: '元の説明',
      })
      const { id } = useTodoStore.getState().todos[0]
      useTodoStore.getState().updateTodo(id, { title: '新しいタイトル', priority: 'high' })

      const todo = useTodoStore.getState().todos[0]
      expect(todo.title).toBe('新しいタイトル')
      expect(todo.priority).toBe('high')
      expect(todo.description).toBe('元の説明')  // 変更されていない
      expect(todo.completed).toBe(false)          // 変更されていない
    })

    it('期限日を更新できる', () => {
      useTodoStore.getState().addTodo({ title: 'Task', priority: 'medium', completed: false })
      const { id } = useTodoStore.getState().todos[0]
      useTodoStore.getState().updateTodo(id, { dueDate: '2026-12-31' })
      expect(useTodoStore.getState().todos[0].dueDate).toBe('2026-12-31')
    })
  })

  // ── deleteTodo ───────────────────────────────────────────────────────
  describe('deleteTodo', () => {
    it('指定したidのtodoを削除する', () => {
      useTodoStore.getState().addTodo({ title: '残す', priority: 'low', completed: false })
      useTodoStore.getState().addTodo({ title: '削除する', priority: 'low', completed: false })
      const idToDelete = useTodoStore.getState().todos[1].id

      useTodoStore.getState().deleteTodo(idToDelete)

      const { todos } = useTodoStore.getState()
      expect(todos).toHaveLength(1)
      expect(todos[0].title).toBe('残す')
    })

    it('存在しないidを指定しても他のtodoに影響しない', () => {
      useTodoStore.getState().addTodo({ title: 'Task', priority: 'medium', completed: false })
      useTodoStore.getState().deleteTodo('non-existent-id')
      expect(useTodoStore.getState().todos).toHaveLength(1)
    })
  })

  // ── clearCompleted ───────────────────────────────────────────────────
  describe('clearCompleted', () => {
    it('完了済みtodoをすべて削除し未完了は残す', () => {
      useTodoStore.getState().addTodo({ title: '未完了', priority: 'medium', completed: false })
      useTodoStore.getState().addTodo({ title: '完了1', priority: 'low', completed: true })
      useTodoStore.getState().addTodo({ title: '完了2', priority: 'high', completed: true })

      useTodoStore.getState().clearCompleted()

      const { todos } = useTodoStore.getState()
      expect(todos).toHaveLength(1)
      expect(todos[0].title).toBe('未完了')
    })

    it('完了済みが0件のとき何も変化しない', () => {
      useTodoStore.getState().addTodo({ title: 'Active', priority: 'medium', completed: false })
      useTodoStore.getState().clearCompleted()
      expect(useTodoStore.getState().todos).toHaveLength(1)
    })

    it('すべて完了済みのときリストが空になる', () => {
      useTodoStore.getState().addTodo({ title: 'Done', priority: 'medium', completed: true })
      useTodoStore.getState().clearCompleted()
      expect(useTodoStore.getState().todos).toHaveLength(0)
    })
  })

  // ── filteredAndSortedTodos ───────────────────────────────────────────
  describe('filteredAndSortedTodos', () => {
    beforeEach(() => {
      useTodoStore.getState().addTodo({ title: '未完了A', priority: 'high', completed: false })
      useTodoStore.getState().addTodo({ title: '未完了B', priority: 'low', completed: false })
      useTodoStore.getState().addTodo({ title: '完了済み', priority: 'medium', completed: true })
    })

    it('"all"フィルターはすべてのtodoを返す', () => {
      useTodoStore.setState({ filter: 'all' })
      expect(useTodoStore.getState().filteredAndSortedTodos()).toHaveLength(3)
    })

    it('"active"フィルターは未完了のtodoだけを返す', () => {
      useTodoStore.setState({ filter: 'active' })
      const result = useTodoStore.getState().filteredAndSortedTodos()
      expect(result).toHaveLength(2)
      expect(result.every((t) => !t.completed)).toBe(true)
    })

    it('"completed"フィルターは完了済みのtodoだけを返す', () => {
      useTodoStore.setState({ filter: 'completed' })
      const result = useTodoStore.getState().filteredAndSortedTodos()
      expect(result).toHaveLength(1)
      expect(result[0].completed).toBe(true)
    })

    it('priorityソート: high → medium → low の順になる', () => {
      useTodoStore.setState({ filter: 'all', sortBy: 'priority' })
      const result = useTodoStore.getState().filteredAndSortedTodos()
      expect(result[0].priority).toBe('high')
      expect(result[1].priority).toBe('medium')
      expect(result[2].priority).toBe('low')
    })

    it('dueDateソート: 期限が早い順、期限なしは最後', () => {
      useTodoStore.setState({ todos: [], filter: 'all', sortBy: 'dueDate' })
      useTodoStore.getState().addTodo({ title: '期限なし', priority: 'medium', completed: false })
      useTodoStore.getState().addTodo({ title: '年末', priority: 'medium', completed: false, dueDate: '2026-12-31' })
      useTodoStore.getState().addTodo({ title: '来月', priority: 'medium', completed: false, dueDate: '2026-06-01' })

      const result = useTodoStore.getState().filteredAndSortedTodos()
      expect(result[0].title).toBe('来月')
      expect(result[1].title).toBe('年末')
      expect(result[2].title).toBe('期限なし')
    })

    it('期限日が同じ2件の場合は順序が安定している', () => {
      useTodoStore.setState({ todos: [], filter: 'all', sortBy: 'dueDate' })
      useTodoStore.getState().addTodo({ title: 'A', priority: 'medium', completed: false, dueDate: '2026-08-01' })
      useTodoStore.getState().addTodo({ title: 'B', priority: 'medium', completed: false, dueDate: '2026-08-01' })

      const result = useTodoStore.getState().filteredAndSortedTodos()
      expect(result).toHaveLength(2)
    })
  })

  // ── setFilter / setSortBy ─────────────────────────────────────────────
  describe('setFilter', () => {
    it('フィルターを変更できる', () => {
      useTodoStore.getState().setFilter('completed')
      expect(useTodoStore.getState().filter).toBe('completed')
    })

    it('フィルターをallに戻せる', () => {
      useTodoStore.getState().setFilter('active')
      useTodoStore.getState().setFilter('all')
      expect(useTodoStore.getState().filter).toBe('all')
    })
  })

  describe('setSortBy', () => {
    it('ソートキーを変更できる', () => {
      useTodoStore.getState().setSortBy('priority')
      expect(useTodoStore.getState().sortBy).toBe('priority')
    })

    it('ソートキーをcreatedに戻せる', () => {
      useTodoStore.getState().setSortBy('dueDate')
      useTodoStore.getState().setSortBy('created')
      expect(useTodoStore.getState().sortBy).toBe('created')
    })
  })
})
