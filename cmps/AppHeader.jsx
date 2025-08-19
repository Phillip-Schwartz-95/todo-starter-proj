const { useState, useEffect } = React
const { useNavigate, Link, NavLink } = ReactRouterDOM
const { useSelector } = ReactRedux

import { userService } from '../services/user.service.js'
import { UserMsg } from './UserMsg.jsx'
import { LoginSignup } from './LoginSignup.jsx'
import { showErrorMsg } from '../services/event-bus.service.js'

export function AppHeader() {
    const navigate = useNavigate()
    const [user, setUser] = useState(userService.getLoggedinUser())
    const doneTodosPercent = useSelector(state => state.doneTodosPercent || 0)

    useEffect(() => {
        // Polling to keep balance and activities reactive
        const interval = setInterval(() => {
            setUser(userService.getLoggedinUser())
        }, 500)
        return () => clearInterval(interval)
    }, [])

    function onLogout() {
        userService.logout()
            .then(() => setUser(null))
            .catch(() => showErrorMsg('Oops, try again'))
    }

    return (
        <header className="app-header full main-layout">
            <section className="header-container">
                <h1>React Todo App</h1>

                {user ? (
                    <section className="user-info">
                        <Link to={`/user/${user._id}`}>
                            Hello {user.fullname} | Balance: ${user.balance || 0}
                        </Link>
                        <button onClick={onLogout}>Logout</button>

                        <div className="progress-bar">
                            <div
                                className="progress-filled"
                                style={{ width: `${doneTodosPercent}%` }}
                            />
                            <small>{Math.round(doneTodosPercent)}% Done</small>
                        </div>
                    </section>
                ) : (
                    <section>
                        <LoginSignup />
                    </section>
                )}

                <nav className="app-nav">
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/about">About</NavLink>
                    <NavLink to="/todo">Todos</NavLink>
                    <NavLink to="/dashboard">Dashboard</NavLink>
                </nav>
            </section>
            <UserMsg />
        </header>
    )
}

