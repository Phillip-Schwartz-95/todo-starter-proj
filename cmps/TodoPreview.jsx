const { Link } = ReactRouterDOM

export function TodoPreview({ todo, onToggleTodo, onRemove }) {
  return (
    <li style={{ backgroundColor: todo.color, padding: '8px', margin: '4px 0' }}>
      <div onClick={onToggleTodo}>
        {todo.txt} (Importance: {todo.importance})
      </div>
      <section>
        <button onClick={onRemove}>Remove</button>
        <Link to={`/todo/${todo._id}`} className="btn">Details</Link>
        <Link to={`/todo/edit/${todo._id}`} className="btn">Edit</Link>
      </section>
    </li>
  )
}