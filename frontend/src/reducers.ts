import { combineReducers } from 'redux'
import { connectRouter, RouterState } from 'connected-react-router'
import { sortBy, uniqBy, concat, filter } from 'lodash'
import {
  SET_USER_NAME,
  RESET_HANDS,
  HAND_ADDED,
  HAND_DELETED,
} from './actionTypes'
import { HandData } from './components/Hand'
import { History } from 'history'

type AuthState = {
  userName: string,
};

type HandState = HandData[];


export type RootState = {
  auth: AuthState,
  hands: HandState,
  router: RouterState,
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


const createRootReducer = (history: History) => combineReducers({
  router: connectRouter(history),
  auth,
  hands,
})

export default createRootReducer
