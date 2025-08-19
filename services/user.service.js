import { storageService } from "./async-storage.service.js"

export const userService = {
    getLoggedinUser,
    login,
    logout,
    signup,
    getById,
    query,
    getEmptyCredentials,
    updateUserPreffs,
    addActivity,
    updateBalance
}

const STORAGE_KEY_LOGGEDIN = 'user'
const STORAGE_KEY = 'userDB'

// Seed a default user if none exist
_createDefaultUsers()

function _createDefaultUsers() {
    let users = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    if (!users.length) {
        users = [
            {
                _id: 'u101',
                username: 'muki',
                password: 'muki1',
                fullname: 'Muki Ja',
                balance: 100,         // Add balance for example
                activities: [],       // Add activities array
                pref: { color: '#ffffff', bgColor: '#191919' },
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
        ]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
    }
}

function query() {
    return storageService.query(STORAGE_KEY)
}

function getById(userId) {
    return storageService.get(STORAGE_KEY, userId)
}

function login({ username, password }) {
    return storageService.query(STORAGE_KEY)
        .then(users => {
            const user = users.find(u => u.username === username && u.password === password)
            if (user) return _setLoggedinUser(user)
            else return Promise.reject('Invalid login')
        })
}

function signup({ username, password, fullname }) {
    const user = {
        username,
        password,
        fullname,
        balance: 100,
        activities: [],
        pref: { color: '#ffffff', bgColor: '#191919' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
    }

    return storageService.post(STORAGE_KEY, user)
        .then(_setLoggedinUser)
}

function logout() {
    sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN)
    return Promise.resolve()
}

function getLoggedinUser() {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN))
}

function updateUserPreffs(userToUpdate) {
    const loggedInUser = getLoggedinUser()
    if (!loggedInUser) return Promise.reject('No logged-in user')

    return getById(loggedInUser._id)
        .then(user => {
            const updatedUser = { ...user, ...userToUpdate, updatedAt: Date.now() }
            return storageService.put(STORAGE_KEY, updatedUser)
        })
        .then(_setLoggedinUser)
}

function addActivity(txt) {
    const loggedInUser = getLoggedinUser()
    if (!loggedInUser) return Promise.reject('No logged-in user')

    return getById(loggedInUser._id)
        .then(user => {
            const updatedUser = { ...user, activities: [...(user.activities || []), txt], updatedAt: Date.now() }
            return storageService.put(STORAGE_KEY, updatedUser)
        })
        .then(_setLoggedinUser)
}

function updateBalance(amount) {
    const loggedInUser = getLoggedinUser()
    if (!loggedInUser) return Promise.reject('No logged-in user')

    return getById(loggedInUser._id)
        .then(user => {
            const newBalance = (user.balance || 0) + amount
            const updatedUser = { ...user, balance: newBalance, updatedAt: Date.now() }
            return storageService.put(STORAGE_KEY, updatedUser).then(() => newBalance)
        })
}

function _setLoggedinUser(user) {
    const userToSave = {
        _id: user._id,
        fullname: user.fullname,
        balance: user.balance,
        activities: user.activities || [],
        pref: user.pref || { color: '#ffffff', bgColor: '#191919' }
    }
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN, JSON.stringify(userToSave))
    return userToSave
}

function getEmptyCredentials() {
    return {
        fullname: '',
        username: '',
        password: '',
    }
}
