const { createStore, compose } = Redux

export const SET_TODOS = 'SET_TODOS'
export const ADD_TODO = 'ADD_TODO'
export const REMOVE_TODO = 'REMOVE_TODO'
export const UPDATE_TODO = 'UPDATE_TODO'
export const SET_FILTER = 'SET_FILTER'
export const SET_USER = 'SET_USER'
export const SET_IS_LOADING = 'SET_IS_LOADING'
export const SET_DONE_TODOS_PERCENT = 'SET_DONE_TODOS_PERCENT'
export const SET_MAX_PAGE = 'SET_MAX_PAGE'

const initialState = {
    todos: [],
    color: '',
    filterBy: { txt: '', status: 'all', importance: 0 },
    isLoading: false,
    user: null
}

export function appReducer(state = initialState, action = {}) {
    switch (action.type) {
        case SET_TODOS:
            return { ...state, todos: action.todos }

        case ADD_TODO:
            return { ...state, todos: [...state.todos, action.todo] }

        case REMOVE_TODO:
            return { ...state, todos: state.todos.filter(t => t._id !== action.todoId) }

        case UPDATE_TODO:
            return { ...state, todos: state.todos.map(t => t._id === action.todo._id ? action.todo : t) }

        case SET_FILTER:
            return { ...state, filterBy: action.filterBy }

        case SET_USER:
            return { ...state, user: action.user }

        case SET_IS_LOADING:
            return { ...state, isLoading: action.isLoading }

        case SET_DONE_TODOS_PERCENT:
            return { ...state, doneTodosPercent: action.doneTodosPercent }

        case SET_MAX_PAGE:
            return { ...state, maxPage: action.maxPage }

        default:
            return state
    }
}
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
export const store = createStore(appReducer, composeEnhancers())
