import {
    SET_USER_NAME,
    SET_TOKEN,
    RESET_HANDS,
    HAND_ADDED,
    HAND_DELETED,
} from './actionTypes.js'


export const setUserName = userName => {
    return {
        type: SET_USER_NAME,
        userName
    }
}

export const setToken = (roomName, token) => {
    return {
        type: SET_TOKEN,
        roomName,
        token
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
