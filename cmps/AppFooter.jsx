const { useSelector } = ReactRedux

export const AppFooter = () => {
    const doneTodosPercent = useSelector(state => state.doneTodosPercent || 0)

    return (
        <footer className="app-footer full main-layout">
            <div className="progress-bar">
                <div
                    className="progress-filled"
                    style={{ width: `${doneTodosPercent}%` }}
                />
                <small>{Math.round(doneTodosPercent)}% Done</small>
            </div>
            <p>© 2023 My App</p>
        </footer>
    )
}
