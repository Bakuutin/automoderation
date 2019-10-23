import { combineReducers } from 'redux'
import { sortBy, uniqBy, concat, filter } from 'lodash'
import {
  SET_USER_NAME,
  RESET_HANDS,
  HAND_ADDED,
  HAND_DELETED,
} from './actionTypes'
import { HandData } from './components/Hand'

type AuthState = {
  userName: string,
};

type HandState = HandData[];


export type RootState = {
  auth: AuthState,
  hands: HandState,
}

const auth = (state: AuthState = {userName: ''}, action) => {
  switch (action.type) {
    case SET_USER_NAME:
    return {
      'userName': action.userName,
    }
    default:
      return state
  }
}


const hands = (state: HandState = [], action: {hand?: HandData, type?: string } = {}) => {
  switch (action.type) {
    case HAND_ADDED:
      return sortBy(
        uniqBy(concat(state, action.hand), 'id'),
        ['priority'],
      )
    case HAND_DELETED:
      return filter(state, (hand) => (hand.id !== action.hand.id))
    case RESET_HANDS:
      return []
    default:
      return state;
  }
}


const reducer = combineReducers({auth, hands})

export default reducer
