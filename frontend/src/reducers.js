import { combineReducers } from 'redux'
import _ from 'lodash'
import {
  SET_USER_NAME,
  SET_TOKEN,
  RESET_HANDS,
  HAND_ADDED,
  HAND_DELETED,
} from './actionTypes.js'
import { numberOfQueues } from './constants.js';

const auth = (state = {userName: '', rooms: {}}, action) => {
  switch (action.type) {
    case SET_USER_NAME:
    return {
      'userName': action.userName,
      'rooms': {},
    }
    case SET_TOKEN:
      let newState = _.cloneDeep(state);
      newState['rooms'][action.roomName] = action.token
      return newState
    default:
      return state
  }
}


const hands = (state = [], action = {}) => {
  switch (action.type) {
    case HAND_ADDED:
      return _.sortBy(_.concat(state, action.hand), ['priority'])
    case HAND_DELETED:
      return _.filter(state, (hand) => (hand.id !== action.hand.id))
    case RESET_HANDS:
      return []
    default:
      return state;
  }
}


const reducer = combineReducers({auth, hands})

export default reducer
