import {
    SET_USER_NAME,
    RESET_HANDS,
    HAND_ADDED,
    HAND_DELETED,
} from './actionTypes'


export const setUserName = userName => {
    return {
        type: SET_USER_NAME,
        userName
    }
}

export const handReceieved = (hand) => {
    return {
        type: hand.cancel ? HAND_DELETED : HAND_ADDED,
        hand
    }
}

export const resetHands = () => {
    return {
        type: RESET_HANDS
    }
}
