const { useSelector, useDispatch } = ReactRedux

import { loadTodos } from "../store/actions/todo.actions.js"

import { TodoFilter } from "../cmps/TodoFilter.jsx"
import { TodoList } from "../cmps/TodoList.jsx"
import { DataTable } from "../cmps/data-table/DataTable.jsx"
import { todoService } from "../services/todo.service.js"
import { showErrorMsg, showSuccessMsg } from "../services/event-bus.service.js"

import { removeTodo } from "../store/actions/todo.actions.js"

const { useState, useEffect } = React
const { Link, useSearchParams } = ReactRouterDOM

export function TodoIndex() {
  const dispatch = useDispatch()
  const todos = useSelector(state => state.todos)

  const [searchParams, setSearchParams] = useSearchParams()
  const defaultFilter = todoService.getFilterFromSearchParams(searchParams)
  const [filterBy, setFilterBy] = useState(defaultFilter)

  useEffect(() => {
    setSearchParams(filterBy)
    loadTodos(filterBy)
    .catch(() => showErrorMsg('Cannot load todos'))
}, [filterBy]) 

  function onRemoveTodo(todoId) {
    if (!confirm('Are you sure?')) return
    removeTodo(todoId)
      .then(() => showSuccessMsg('Todo removed'))
      .catch(err => showErrorMsg('Cannot remove todo'))
  }

  function onToggleTodo(todo) {
    const todoToSave = { ...todo, isDone: !todo.isDone }
    todoService.save(todoToSave)
      .then((savedTodo) => {
        // If you're using Redux, dispatch an update instead of setTodos
        showSuccessMsg(`Todo is ${(savedTodo.isDone) ? 'done' : 'back on your list'}`)
      })
      .catch(err => {
        console.log('err:', err)
        showErrorMsg('Cannot toggle todo ' + todo._id)
      })
  }

  if (!todos) return <div>Loading...</div>

  return (
    <section className="todo-index">
      <TodoFilter filterBy={filterBy} onSetFilterBy={setFilterBy} />
      <div>
        <Link to="/todo/edit" className="btn">Add Todo</Link>
      </div>
      <h2>Todos List</h2>
      <TodoList todos={todos} onRemoveTodo={onRemoveTodo} onToggleTodo={onToggleTodo} />
      <hr />
      <h2>Todos Table</h2>
      <div style={{ width: '60%', margin: 'auto' }}>
        <DataTable todos={todos} onRemoveTodo={onRemoveTodo} />
      </div>
    </section>
  )
}
