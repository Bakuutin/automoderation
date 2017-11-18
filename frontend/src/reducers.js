import { combineReducers } from 'redux'
import {
  SET_ROOM_NAME,
  SET_USER_NAME,
  SET_TOKEN,
  SOCKET_CONNECTED,
  SOCKET_DISCONNECTED,
} from './actionTypes.js'

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

const socket = (state = {connected: false, messages: {}}, action = {}) => {
  switch (action.type) {
    case SOCKET_CONNECTED:
      return Object.assign({}, state, {
        connected: true,
      });
    case SOCKET_DISCONNECTED:
      return Object.assign({}, state, {
        connected: false,
        messages: {},
      });
    default:
      return state;
  }
}
//     case SOCKETS_MESSAGE_ADDED:
//       newState = Object.assign({}, state)
//       newState.messages[action.message.priority]
//       return Object.assign({}, state, {
//         connected: true
//       });
//     case SOCKETS_MESSAGE_DELETED:
//       return Object.assign({}, state, {
//         loaded: true,
//         message: 'Message receive',
//         connected: true
//       });
//     default:
//       return state;
//   }
// }


const reducer = combineReducers({auth, socket})

export default reducer
