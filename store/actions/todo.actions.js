import { store } from '../store.js'
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
import { todoService } from '../../services/todo.service.js'

// Load todos using the current filter in the store if filterSort is not provided
export function loadTodos(filterSort) {
  store.dispatch({ type: SET_IS_LOADING, isLoading: true })

  const filter = filterSort || store.getState().filterBy

  return todoService
    .query(filter)
    .then(({ todos, maxPage, doneTodosPercent }) => {
      store.dispatch({ type: SET_TODOS, todos })
      _setTodosData(doneTodosPercent, maxPage)
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

export function removeTodo(todoId) {
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

export function saveTodo(todo) {
  const type = todo._id ? UPDATE_TODO : ADD_TODO

  return todoService
    .save(todo)
    .then(({ savedTodo, maxPage, doneTodosPercent }) => {
      store.dispatch({ type, todo: savedTodo })
      _setTodosData(doneTodosPercent, maxPage)
      return savedTodo
    })
    .then((res) => {
      const actionName = todo._id ? 'Updated' : 'Added'
      return addActivity(`${actionName} a Todo: ${todo.txt}`).then(() => res)
    })
    .catch((err) => {
      console.error('Cannot save todo:', err)
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

      if (savedTodo.isDone) {
        return addActivity('Completed Todo: ' + savedTodo.txt)
          .then(() => incUserBalance(10))
          .then(() => savedTodo)
      }
      return savedTodo
    })
    .catch((err) => {
      console.error('Cannot toggle todo:', err)
      throw err
    })
}

export function setFilter(filterBy) {
  store.dispatch({ type: SET_FILTER, filterBy })
}

function _setTodosData(doneTodosPercent, maxPage) {
  store.dispatch({ type: SET_DONE_TODOS_PERCENT, doneTodosPercent })
  store.dispatch({ type: SET_MAX_PAGE, maxPage })
}