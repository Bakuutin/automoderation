import { combineReducers } from 'redux'
import _ from 'lodash'
import {
  SET_ROOM_NAME,
  SET_USER_NAME,
  SET_TOKEN,
  SOCKET_CONNECTED,
  SOCKET_DISCONNECTED,
  MESSAGE_ADDED,
  MESSAGE_DELETED,
} from './actionTypes.js'
import { numberOfQueues } from './constants.js';

const auth = (state = {roomName: '', userName: '', token: ''}, action) => {
  switch (action.type) {
    case SET_ROOM_NAME:
      return Object.assign({}, state, {
        roomName: action.roomName,
        token: '',
      })
    case SET_USER_NAME:
      return Object.assign({}, state, {
        userName: action.userName,
        token: '',
      })
    case SET_TOKEN:
      return Object.assign({}, state, {
        token: action.token
      })
    default:
      return state
  }
}

const initialSocketState = {connected: false, queues: Array(numberOfQueues).fill().map(() => [])}

const socket = (state = initialSocketState, action = {}) => {
  switch (action.type) {
    case SOCKET_CONNECTED:
      return Object.assign({}, state, {connected: true});
    case SOCKET_DISCONNECTED:
      return initialSocketState

    case MESSAGE_ADDED:
      var newState = Object.assign({}, state)
      newState.queues[action.message.priority].push(action.message.user)
      return newState
    case MESSAGE_DELETED:
      var newState = Object.assign({}, state)
      _.remove(newState.queues[action.message.priority], (user) => (user == action.message.user))
      return newState
    default:
      return state;
  }
}


const reducer = combineReducers({auth, socket})

export default reducer
