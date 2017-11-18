import React from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import Loader from 'react-loaders'
import axios from 'axios'
import { Button, ButtonGroup } from 'reactstrap';

import {
    setRoomName, setUserName, setToken,
    setSocketConnected, setSocketDisconnected,
    messageReceieved,
} from '../actions'

import SigninForm from './SigninForm.jsx'
import Queues from './Queues.jsx'
import Footer from './Footer.jsx'

const RoomNameForm = (props) => (
    <SigninForm
        title="Please,"
        subtitle="enter the room name"
        placeholder="Platform 9¾"
        buttonText="Let's go"
        onSubmit={props.onSubmit}
    />
)

const UserNameForm = (props) => (
    <SigninForm
        title="Almost there,"
        subtitle="choose a name"
        placeholder="T-Rex 9000"
        buttonText="Join"
        onSubmit={props.onSubmit}
    />
)

const mapDispatchToProps = dispatch => {
    return {
        onSetUserName: (value) => {
            dispatch(setUserName(value))
        },
        onSetRoomName: (value) => {
            dispatch(setRoomName(value))
        },
        onSetToken: (value) => {
            dispatch(setToken(value))
        },
        onSocketConnected: () => {
            dispatch(setSocketConnected())
        },
        onSocketDisconnected: () => {
            dispatch(setSocketDisconnected())
        },
        onMessageReceieved: (message) => {
            dispatch(messageReceieved(message))
        },
    }
}

const getToken = (roomName, userName, onSetToken) => {
    axios.post('/auth', {
        room: roomName,
        name: userName,
    }).then((response) => {
        onSetToken(response.data.token);
    });
}

const wsUrl = ((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host + "/ws";

class Room extends React.Component {
    constructor(props) {
        super(props)
        this.socket = null
        this.handleSend = this.handleSend.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    onSocketClose() {
        this.socket = null
        this.props.onSocketDisconnected()
    }

    setSocket() {
        this.socket = new WebSocket(wsUrl + '?token=' + this.props.auth.token)
        this.socket.onopen = this.props.onSocketConnected
        this.socket.onclose = this.onSocketClose
        this.socket.onmessage = (e) => this.props.onMessageReceieved(JSON.parse(e.data))
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.props.auth.roomName || !this.props.auth.userName) {
            return
        }

        if (!this.props.auth.token) {
            this.socket = null;
            getToken(this.props.auth.roomName, this.props.auth.userName, this.props.onSetToken);
            return
        }

        if (!this.socket) {
            this.setSocket()
        }
    }

    handleSend(priority) {
        this.socket.send(JSON.stringify({priority: priority}))
    }

    handleCancel(priority) {
        this.socket.send(JSON.stringify({priority: priority, cancel: true}))
    }

    render() {
        if (!this.props.auth.roomName) {
            return <RoomNameForm onSubmit={this.props.onSetRoomName}/>
        }

        if (!this.props.auth.userName) {
            return <UserNameForm onSubmit={this.props.onSetUserName}/>
        }

        if (!this.props.auth.token || !this.props.socket.connected) {
            return <Loader type="ball-pulse-rise"/>
        }
        return (
            <div>
                <h3>Room {this.props.auth.roomName}</h3>
                <Queues
                    data={this.props.socket.queues}
                    onCancel={this.handleCancel}
                    currentUserName={this.props.auth.userName}
                />
                <Footer onSend={this.handleSend}/>
            </div>
        )
    }
}

Room.propTypes = {
    auth: PropTypes.shape({
        userName: PropTypes.string,
        roomName: PropTypes.string,
        token: PropTypes.string,
    }),

    socket: PropTypes.shape({
        connected: PropTypes.bool,
        queues: PropTypes.any,
    }),

    onSetUserName: PropTypes.func,
    onSetRoomName: PropTypes.func,
    onSetToken: PropTypes.func,

    onSocketConnected: PropTypes.func,
    onSocketDisconnected: PropTypes.func,

    onMessageReceieved: PropTypes.func,
}

export default connect(state => state, mapDispatchToProps)(Room)
