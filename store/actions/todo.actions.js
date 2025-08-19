import { todoService } from '../../services/todo.service.js'
import { store } from '../store.js'
import { addActivity } from './user.actions.js'

import {
  REMOVE_TODO,
  SET_TODOS,
  ADD_TODO,
  UPDATE_TODO,
  SET_FILTER,
  SET_IS_LOADING,
  SET_DONE_TODOS_PERCENT,
  SET_MAX_PAGE,
} from '../store.js'

// Load todos using the provided filterSort or current store filter
export function loadTodos(filterSort) {
  store.dispatch({ type: SET_IS_LOADING, isLoading: true })
  const filter = filterSort || store.getState().filterBy

  return todoService
    .query(filter)
    .then((todos) => {
      store.dispatch({ type: SET_TODOS, todos })
      // Calculate doneTodosPercent immediately
      const doneTodosPercent = todoService.getDoneTodosPercentSync(todos)
      store.dispatch({ type: SET_DONE_TODOS_PERCENT, doneTodosPercent })
      return todos
    })
    .catch((err) => {
      console.error('Cannot load todos:', err)
      throw err
    })
    .finally(() => {
      store.dispatch({ type: SET_IS_LOADING, isLoading: false })
    })
}


export function saveTodo(todo) {
  const type = todo._id ? UPDATE_TODO : ADD_TODO

  return todoService
    .save(todo)
    .then(({ savedTodo, maxPage, doneTodosPercent }) => {
      store.dispatch({ type, todo: savedTodo })
      _setTodosData(doneTodosPercent, maxPage)
      return savedTodo
    })
    .then((savedTodo) => {
      const actionName = todo._id ? 'Updated' : 'Added'
      return addActivity(`${actionName} a Todo: ${savedTodo.txt}`).then(() => savedTodo)
    })
    .catch((err) => {
      console.error('Cannot save todo:', err)
      throw err
    })
}

export function removeTodo(todoId) {
  if (!window.confirm('Are you sure you want to delete this todo?')) return Promise.resolve()

  return todoService
    .remove(todoId)
    .then(({ maxPage, doneTodosPercent }) => {
      store.dispatch({ type: REMOVE_TODO, todoId })
      _setTodosData(doneTodosPercent, maxPage)
      return addActivity('Removed the Todo: ' + todoId)
    })
    .catch((err) => {
      console.error('Cannot remove todo:', err)
      throw err
    })
}

export function toggleTodo(todo) {
  const updatedTodo = { ...todo, isDone: !todo.isDone }

  return todoService
    .save(updatedTodo)
    .then(({ savedTodo, maxPage, doneTodosPercent }) => {
      store.dispatch({ type: UPDATE_TODO, todo: savedTodo })
      _setTodosData(doneTodosPercent, maxPage)
      if (savedTodo.isDone) return addActivity('Completed Todo: ' + savedTodo.txt).then(() => savedTodo)
      return savedTodo
    })
    .catch((err) => {
      console.error('Cannot toggle todo:', err)
      throw err
    })
}

export function setFilterSort(filterSort) {
  store.dispatch({ type: SET_FILTER, filterBy: filterSort })
}

// Helper to update todos stats in the store
function _setTodosData(doneTodosPercent, maxPage) {
  store.dispatch({ type: SET_DONE_TODOS_PERCENT, doneTodosPercent })
  store.dispatch({ type: SET_MAX_PAGE, maxPage })
}
