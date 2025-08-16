import { createStore } from 'redux'

export const SET_TODOS = 'SET_TODOS'          
export const ADD_TODO = 'ADD_TODO'            
export const REMOVE_TODO = 'REMOVE_TODO'    
export const UPDATE_TODO = 'UPDATE_TODO'     
export const SET_FILTER = 'SET_FILTER'        
export const SET_USER = 'SET_USER'            
export const SET_IS_LOADING = 'SET_IS_LOADING' 

const initialState = {
    todos: [],
    filterBy: { txt: '', status: 'all', importance: 0 },
    isLoading: false,
    user: null
}

export function appReducer(state = initialState, action = {}) {
    switch(action.type) {
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

        default:
            return state
    }
}

export const store = createStore(appReducer)
window.gStore = store 
