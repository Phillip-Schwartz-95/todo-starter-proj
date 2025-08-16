import { store, REMOVE_TODO } from '../store.js'
import { todoService } from '../services/todo.service.js'

export function removeTodo(todoId) {
    return todoService.remove(todoId)
        .then(() => store.dispatch({ type: REMOVE_TODO, todoId }))
}
