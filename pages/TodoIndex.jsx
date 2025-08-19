const { useSelector } = ReactRedux
const { useEffect } = React
const { Link, useSearchParams } = ReactRouterDOM

import { loadTodos, removeTodo, saveTodo, setFilterSort } from '../store/actions/todo.actions.js'
import { TodoFilter } from '../cmps/TodoFilter.jsx'
import { TodoList } from '../cmps/TodoList.jsx'
import { DataTable } from '../cmps/data-table/DataTable.jsx'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'

export function TodoIndex() {
  const todos = useSelector(state => state.todos)
  const filterBy = useSelector(state => state.filterBy)
  const isLoading = useSelector(state => state.isLoading)
  const user = useSelector(state => state.user)

  const [searchParams, setSearchParams] = useSearchParams()

  // Load todos once on mount and whenever filter changes
  useEffect(() => {
    async function fetchTodos() {
      try {
        await loadTodos(filterBy)
        // Update URL search params to reflect current filter
        const params = new URLSearchParams(filterBy).toString()
        setSearchParams(params)
      } catch (err) {
        showErrorMsg('Cannot load todos')
      }
    }
    fetchTodos()
  }, [filterBy])

  function handleSetFilterBy(newFilter) {
    // Update filter in store, then reload todos
    setFilterSort(newFilter)
    loadTodos(newFilter).catch(() => showErrorMsg('Cannot load todos'))
  }

  function onRemoveTodo(todoId) {
    if (!confirm('Are you sure?')) return
    removeTodo(todoId)
      .then(() => showSuccessMsg('Todo removed'))
      .catch(() => showErrorMsg('Cannot remove todo'))
  }

  function onToggleTodo(todo) {
    const updatedTodo = { ...todo, isDone: !todo.isDone }
    saveTodo(updatedTodo)
      .then(() => {
        showSuccessMsg(`Todo is ${updatedTodo.isDone ? 'done' : 'back on your list'}`)
        if (updatedTodo.isDone) {
          userService.addActivity(`Completed Todo: ${updatedTodo.txt}`)
          userService.updateBalance(10).then(newBalance => {
            setUser(prev => ({ ...prev, balance: newBalance }))
          })
        }
      })
      .catch(() => showErrorMsg('Cannot toggle todo'))
  }


  if (!todos || todos.length === 0) return <div>No todos to show...</div>

  return (
    <section className="todo-index">
      <div className="header-row">
        <h2>Todos {user && `for ${user.name}`}</h2>
        {isLoading && <small style={{ marginLeft: 8 }}>Loading…</small>}
      </div>

      <TodoFilter filterBy={filterBy} onSetFilterBy={handleSetFilterBy} />

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
