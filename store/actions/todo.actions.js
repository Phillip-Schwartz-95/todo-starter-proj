import { todoService } from '../../services/todo.service.js'
import { utilService } from '../../services/util.service.js'

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

// Load todos using the current filter in the store if filterSort is not provided
export function loadTodos() {
  store.dispatch({ type: SET_IS_LOADING, isLoading: true })

  const filter = store.getState().filterBy
  console.log('filter from action:', filter);
  

  return todoService
    .query(filter)
    .then((todos) => {
    // .then(({ todos, maxPage, doneTodosPercent }) => {
      store.dispatch({ type: SET_TODOS, todos })
    //   _setTodosData(doneTodosPercent, maxPage)
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
  if (!window.confirm('Are you sure you want to delete this todo?')) {
    return Promise.resolve() // exit early if user cancels
  }

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

  if (!todo.color) todo.color = utilService.getRandomColor()

  return todoService
    .save(todo)
    .then(({ savedTodo, maxPage, doneTodosPercent }) => {
      store.dispatch({ type, todo: savedTodo }) // color is included here
      _setTodosData(doneTodosPercent, maxPage)
      return savedTodo
    })
    .then((res) => {
      const actionName = todo._id ? 'Updated' : 'Added'
      return addActivity(`${actionName} a Todo: ${todo.txt}`).then(() => res)
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