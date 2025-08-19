const { Link } = ReactRouterDOM

export function TodoPreview({ todo, onToggleTodo, onRemove }) {
  return (
    <li style={{ backgroundColor: todo.color, padding: '8px', margin: '4px 0' }}>
      <div onClick={onToggleTodo}>
        {todo.txt} (Importance: {todo.importance})
      </div>
      <section>
        <button onClick={onRemove}>Remove</button>
        <button><Link to={`/todo/${todo._id}`}>Details</Link></button>
        <button><Link to={`/todo/edit/${todo._id}`}>Edit</Link></button>
      </section>
    </li>
  )
}