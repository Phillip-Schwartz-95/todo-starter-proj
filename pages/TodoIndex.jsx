const { useSelector } = ReactRedux
const { useEffect, useRef } = React
const { Link, useSearchParams } = ReactRouterDOM

import { loadTodos, removeTodo, saveTodo, setFilter } from '../store/actions/todo.actions.js'
import { TodoFilter } from '../cmps/TodoFilter.jsx'
import { TodoList } from '../cmps/TodoList.jsx'
import { DataTable } from '../cmps/data-table/DataTable.jsx'
import { todoService } from '../services/todo.service.js'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'

// 🔸 Keep debounce in this file
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = React.useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debouncedValue
}

export function TodoIndex() {
  const todos = useSelector(state => state.todos)
  const filterBy = useSelector(state => state.filterBy)
  const isLoading = useSelector(state => state.isLoading)
  const user = useSelector(state => state.user)

  const [searchParams] = useSearchParams()

  // Update store.filterBy when searchParams change
  useEffect(() => {
    const nextFilter = todoService.getFilterFromSearchParams(searchParams)
    if (JSON.stringify(nextFilter) !== JSON.stringify(filterBy)) {
      setFilter(nextFilter)
    }
  }, [searchParams])

  // Debounced filter to avoid excessive API calls
  const debouncedFilterBy = useDebounce(filterBy, 600)

  // Load todos whenever the debounced filter changes
  const prevKeyRef = useRef('')
  useEffect(() => {
    if (!debouncedFilterBy) return
    const key = JSON.stringify(debouncedFilterBy)
    if (key === prevKeyRef.current) return
    prevKeyRef.current = key

    loadTodos(debouncedFilterBy).catch(() => showErrorMsg('Cannot load todos'))
  }, [debouncedFilterBy])

  function onRemoveTodo(todoId) {
    if (!confirm('Are you sure?')) return
    removeTodo(todoId)
      .then(() => showSuccessMsg('Todo removed'))
      .catch(() => showErrorMsg('Cannot remove todo'))
  }

  function onToggleTodo(todo) {
    const updatedTodo = { ...todo, isDone: !todo.isDone }
    saveTodo(updatedTodo)
      .then(() => showSuccessMsg(`Todo is ${updatedTodo.isDone ? 'done' : 'back on your list'}`))
      .catch(() => showErrorMsg('Cannot toggle todo'))
  }

  if (!todos) return <div>No todos to show...</div>

  return (
    <section className="todo-index">
      <div className="header-row">
        <h2>Todos {user && `for ${user.name}`}</h2>
        {isLoading && <small style={{ marginLeft: 8 }}>Loading…</small>}
      </div>

      <TodoFilter filterBy={filterBy} onSetFilterBy={setFilter} />

      <div>
        <Link to="/todo/edit" className="btn">Add Todo</Link>
      </div>

      <h3>Todos List</h3>
      <TodoList todos={todos} onRemoveTodo={onRemoveTodo} onToggleTodo={onToggleTodo} />

      <hr />
      <h3>Todos Table</h3>
      <div style={{ width: '60%', margin: 'auto' }}>
        <DataTable todos={todos} onRemoveTodo={onRemoveTodo} />
      </div>
    </section>
  )
}

