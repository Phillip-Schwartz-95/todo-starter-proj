import { TodoPreview } from "./TodoPreview.jsx"
const { Link } = ReactRouterDOM

export function TodoList({ todos, onRemoveTodo, onToggleTodo }) {
  return (
    <ul className="todo-list">
      {todos.map(todo => (
        <TodoPreview
          key={todo._id}
          todo={todo}
          onToggleTodo={() => onToggleTodo(todo)}
          onRemove={() => onRemoveTodo(todo._id)}
        />
      ))}
    </ul>
  )
}