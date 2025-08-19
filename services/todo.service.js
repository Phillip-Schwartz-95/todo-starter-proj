import { utilService } from './util.service.js'
import { storageService } from './async-storage.service.js'
import { userService } from './user.service.js'

const TODO_KEY = 'todoDB'
const PAGE_SIZE = 3

_createTodos()

export const todoService = {
    query,
    get,
    remove,
    save,
    getEmptyTodo,
    getDefaultFilter,
    getFilterFromSearchParams,
    getImportanceStats,
    getDoneTodosPercent,
}

// For debug:
window.cs = todoService

// ================= QUERY =================
function query(filterBy = {}) {
    return storageService.query(TODO_KEY).then((todos) => {
        

        if (filterBy.txt) {
            const regExp = new RegExp(filterBy.txt, 'i')
            todos = todos.filter(todo => regExp.test(todo.txt))
        }

        if (filterBy.importance) {
            todos = todos.filter(todo => todo.importance >= filterBy.importance)
        }

        // if (filterBy.isDone !== 'all') {
        //     todos = todos.filter(todo =>
        //         filterBy.isDone === 'done' ? todo.isDone : !todo.isDone
        //     )
        // }

        // if (filterBy.sort) {
        //     if (filterBy.sort === 'txt') todos.sort((a, b) => a.txt.localeCompare(b.txt))
        //     if (filterBy.sort === 'createdAt') todos.sort((a, b) => a.createdAt - b.createdAt)
        // }

        // const filteredTodosLength = todos.length

        // if (filterBy.pageIdx !== undefined) {
        //     const startIdx = filterBy.pageIdx * PAGE_SIZE
        //     todos = todos.slice(startIdx, startIdx + PAGE_SIZE)
        // }
        console.log('from wuery:', todos);

        // return includeDataFromServer({ todos, filteredTodosLength })
        return todos
    })
}

// ================= GET =================
function get(todoId) {
    return storageService.get(TODO_KEY, todoId).then(todo => _setNextPrevTodoId(todo))
}

// ================= REMOVE =================
function remove(todoId) {
    return storageService.remove(TODO_KEY, todoId).then(() => includeDataFromServer())
}

// ================= SAVE =================
function save(todo) {
    if (!userService.getLoggedinUser()) return Promise.reject('User is not logged in')

    // Assign color only if it's a new todo and doesn't already have one
    if (!todo._id && !todo.color) todo.color = utilService.getRandomColor()

    return (todo._id ? _edit(todo) : _add(todo))
        .then(savedTodo => includeDataFromServer({ savedTodo }))
}

// Add new todo
function _add(todo) {
    const newTodo = { ...todo, createdAt: Date.now(), updatedAt: Date.now() }
    return storageService.post(TODO_KEY, newTodo)
}

// Edit existing todo
function _edit(todo) {
    const updatedTodo = { ...todo, updatedAt: Date.now() }
    return storageService.put(TODO_KEY, updatedTodo)
}

// ================= UTILITY =================
function getEmptyTodo(txt = '', importance = 5) {
    return { txt, importance, isDone: false, color: utilService.getRandomColor() }
}

function getDefaultFilter() {
    return { txt: '', isDone: 'all', importance: 0, pageIdx: 0, sort: '' }
}

function getFilterFromSearchParams() {
    console.log('filter from service');
    
    const href = window.location.href  //http://127.0.0.1:5503/#/todo?isDone=all 
    const idx = href.indexOf('?')
    const queryString = idx !== -1 ? href.slice(idx + 1) : ''
    const queryParams = new URLSearchParams(queryString)
    return {
        txt: queryParams.get('txt') || '',
        // isDone: queryParams.get('isDone') || 'all',
        importance: +queryParams.get('importance') || 0,
        // pageIdx: +queryParams.get('pageIdx') || 0,
        // sort: queryParams.get('sort') || '',
    }
}

// Mimic extra data from server
function includeDataFromServer(data = {}) {
    const filteredTodosLength = data.filteredTodosLength
    return Promise.all([getDoneTodosPercent(), getMaxPage(filteredTodosLength)]).then(
        ([doneTodosPercent, maxPage]) => ({ maxPage, doneTodosPercent, ...data })
    )
}

// Get done todos %
function getDoneTodosPercent() {
    return storageService.query(TODO_KEY).then(todos => {
        const doneCount = todos.reduce((acc, t) => acc + t.isDone, 0)
        return (doneCount / todos.length) * 100 || 0
    })
}

// Get max page count
function getMaxPage(filteredTodosLength) {
    if (filteredTodosLength) return Promise.resolve(Math.ceil(filteredTodosLength / PAGE_SIZE))
    return storageService.query(TODO_KEY).then(todos => Math.ceil(todos.length / PAGE_SIZE))
}

// Importance stats
function getImportanceStats() {
    return storageService.query(TODO_KEY).then(todos => {
        const map = _getTodoCountByImportanceMap(todos)
        return Object.keys(map).map(key => ({ title: key, value: map[key] }))
    })
}

// ================= PRIVATE HELPERS =================
function _createTodos() {
    let todos = utilService.loadFromStorage(TODO_KEY)
    if (!todos || !todos.length) {
        todos = []
        const txts = ['Learn React', 'Master CSS', 'Practice Redux']
        for (let i = 0; i < 8; i++) {
            const txt = txts[utilService.getRandomIntInclusive(0, txts.length - 1)]
            todos.push(_createTodo(txt + (i + 1), utilService.getRandomIntInclusive(1, 10)))
        }
        utilService.saveToStorage(TODO_KEY, todos)
    }
}

function _createTodo(txt, importance) {
    const todo = getEmptyTodo(txt, importance)
    todo._id = utilService.makeId()
    todo.createdAt = todo.updatedAt =
        Date.now() - utilService.getRandomIntInclusive(0, 1000 * 60 * 60 * 24 * 30)
    return todo
}

function _setNextPrevTodoId(todo) {
    return storageService.query(TODO_KEY).then(todos => {
        const idx = todos.findIndex(t => t._id === todo._id)
        todo.nextTodoId = (todos[idx + 1] && todos[idx + 1]._id) ? todos[idx + 1]._id : todos[0]._id
        todo.prevTodoId = (todos[idx - 1] && todos[idx - 1]._id) ? todos[idx - 1]._id : todos[todos.length - 1]._id

        return todo
    })
}

function _getTodoCountByImportanceMap(todos) {
    return todos.reduce(
        (map, todo) => {
            if (todo.importance < 3) map.low++
            else if (todo.importance < 7) map.normal++
            else map.urgent++
            return map
        },
        { low: 0, normal: 0, urgent: 0 }
    )
}

// Data Model:
// const todo = {
//     _id: "gZ6Nvy",
//     txt: "Master Redux",
//     importance: 9,
//     isDone: false,
//     createdAt: 1711472269690,
//     updatedAt: 1711472269690
// }

