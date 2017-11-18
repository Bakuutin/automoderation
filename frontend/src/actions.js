import {
    SET_ROOM_NAME, SET_USER_NAME, SET_TOKEN,
    SOCKET_CONNECTED, SOCKET_DISCONNECTED
} from './actionTypes.js'


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


export const setSocketConnected = () => {
    return {
        type: SOCKET_CONNECTED,
    }
}


export const setSocketDisconnected = () => {
    return {
        type: SOCKET_DISCONNECTED,
    }
}
