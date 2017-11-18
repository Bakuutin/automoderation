import {SET_ROOM_NAME, SET_USER_NAME, SET_TOKEN} from './actionTypes.js'

export const setRoomName = roomName => {
    return {
        type: SET_ROOM_NAME,
        roomName
    }
}

export const setUserName = userName => {
    return {
        type: SET_USER_NAME,
        userName
    }
}

export const setToken = token => {
    return {
        type: SET_TOKEN,
        token
    }
}
