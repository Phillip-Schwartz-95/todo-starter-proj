import { userService } from '../../services/user.service.js'
import { SET_USER, SET_USER_BALANCE, store } from '../store.js'

export function login(credentials) {
  return userService.login(credentials).then(user => {
    store.dispatch({ type: SET_USER, user })
    return user
  })
}

export function signup(credentials) {
  return userService.signup(credentials).then(user => {
    store.dispatch({ type: SET_USER, user })
    return user
  })
}

export function logout() {
  return userService.logout().then(() => store.dispatch({ type: SET_USER, user: null }))
}

export function updateUser(userToUpdate) {
  return userService.updateUserPreffs(userToUpdate).then(updatedUser =>
    store.dispatch({ type: SET_USER, user: updatedUser })
  )
}

export function addActivity(txt) {
  return userService.addActivity(txt).then(updatedUser =>
    store.dispatch({ type: SET_USER, user: updatedUser })
  )
}

export function changeBalance(amount) {
  return userService.updateBalance(amount).then(newBalance =>
    store.dispatch({ type: SET_USER_BALANCE, balance: newBalance })
  )
}
