const { useState, useEffect } = React
const { useParams } = ReactRouterDOM

import { userService } from '../services/user.service.js'

export function UserDetails() {
    const { userId } = useParams()
    const [user, setUser] = useState(userService.getLoggedinUser())

    useEffect(() => {
        // Keep the user info reactive
        const interval = setInterval(() => {
            const currentUser = userService.getLoggedinUser()
            if (currentUser && currentUser._id === userId) {
                setUser(currentUser)
            }
        }, 500)
        return () => clearInterval(interval)
    }, [userId])

    if (!user) return <div>No user logged in</div>

    return (
        <section>
            <h2>User Details</h2>
            <p>Full Name: {user.fullname}</p>
            <p>Balance: ${user.balance}</p>
            <p>Preferences: Color - {user.pref && user.pref.color}, BG - {user.pref && user.pref.bgColor}</p>


            <h3>Activities:</h3>
            <ul>
               {user.activities && user.activities.map((act, idx) => <li key={idx}>{act}</li>)}
            </ul>
        </section>
    )
}
