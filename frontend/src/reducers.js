import { combineReducers } from 'redux'

const auth = (state = {roomName: '', userName: '', token: ''}, action) => {
    switch (action.type) {
      case 'SET_ROOM_NAME':
        return Object.assign({}, state, {
            roomName: action.roomName
        })
      case 'SET_USER_NAME':
        return Object.assign({}, state, {
            userName: action.userName
        })
      case 'SET_TOKEN':
        return Object.assign({}, state, {
            token: action.token
        })
      default:
        return state
    }
  }


const reducer = combineReducers({auth})

export default reducer
