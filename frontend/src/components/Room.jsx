import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Loader from 'react-loaders';
import _ from 'lodash';
import axios from 'axios';
import { numberOfQueues } from './../constants.js';
import qs from 'qs';

import { setUserName, setToken, handReceieved, resetHands } from '../actions'

import SigninForm from './SigninForm.jsx'
import Queue from './Queue.jsx'
import Footer from './Footer.jsx'

const mapStateToProps = (state, ownProps) => {
    return {
        token: state.auth.rooms[ownProps.name],
        userName: state.auth.userName,
        hands: state.hands,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onSetUserName: (value) => {
            dispatch(setUserName(value))
        },
        onSetToken: (roomName, token) => {
            dispatch(setToken(roomName, token))
        },
        onHandReceieved: (hand) => {
            dispatch(handReceieved(hand))
        },
        onResetHands: () => {
            dispatch(resetHands())
        },
    }
}

const https = (window.location.protocol === 'https:');
const wsUrl = (https ? 'wss://' : 'ws://') + window.location.host + '/ws';

class Room extends React.Component {
    constructor(props) {
        super(props)
        this.handleSend = this.handleSend.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.onSocketClose = this.onSocketClose.bind(this);
        this.onSocketConnected = this.onSocketConnected.bind(this);
        this.onSetUserName = this.onSetUserName.bind(this);
        this.state = {
            usernameIsTaken: false,
            ws: null,
            connected: false,
        }
    }

    // get askedMap() {
    //     let askedMap = {}
    //     for (var priority = 0; priority < numberOfQueues; priority++) {
    //         askedMap[priority] = _.includes(this.props.ws.queues[priority], this.props.userName)
    //     }
    //     return askedMap
    // }

    onSocketClose() {
        this.state.ws = null;
        this.state.connected = false;
    }

    onSocketConnected() {
        this.state.connected = true;
        this.forceUpdate();
    }

    get client() {
        return axios.create({
            headers: {'Token': this.props.token || ''},
            timeout: 2000,
        });
    }

    dropToken() {
        this.props.onSetToken(this.props.name, null);
    }

    getToken() {
        this.client.post('/auth', {
            'room': this.props.name,
            'name': this.props.userName,
        }).then((response) => {
            this.props.onSetToken(this.props.name, response.data.token);
        }).catch((error) => {
            if (error.response && error.response.status === 409) {
                this.state.usernameIsTaken = true;
            } else {
                this.dropToken();
            }
            this.forceUpdate();
        });
    }

    onSetUserName(newUsername) {
        this.state.usernameIsTaken = false;
        this.props.onSetUserName(newUsername);
        this.forceUpdate();
    }

    setSocket() {
        this.props.onResetHands();
        this.state.ws = new WebSocket(wsUrl + '?' + qs.stringify({'token': this.props.token}));
        this.state.ws.onopen = this.onSocketConnected;
        this.state.ws.onclose = this.onSocketClose;
        this.state.ws.onerror = this.onSocketClose;
        this.state.ws.onmessage = (e) => this.props.onMessageReceieved(JSON.parse(e.data));
        window.ws = this.state.ws;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.props.userName || this.state.usernameIsTaken) {
            return
        }

        if (!this.props.token) {
            this.state.ws = null;
            this.getToken();
            return
        }

        if (!this.state.ws) {
            this.setSocket();
        }
    }

    handleSend(priority) {
        this.client.post('/api/hands', JSON.stringify({priority: priority}));
    }

    handleCancel(hand) {
        this.client.delete('/api/hands/' + hand.id);
    }

    render() {
        if (!this.props.userName || this.state.usernameIsTaken) {
            return (
                <SigninForm
                    title="Almost there,"
                    subtitle="choose a name"
                    placeholder="T-Rex 9000"
                    buttonText="Join"
                    initial={this.props.userName}
                    onSubmit={this.onSetUserName}
                    errorHand={this.state.usernameIsTaken ? "Already taken in this room, sorry": null}
                    />
            );
        }

        if (!this.props.token || !this.state.connected) {
            console.log(this.props.token, this.state.connected);
            return <Loader type="ball-pulse-rise"/>;
        }
        return (
            <div>
                <h3>You entered {this.props.name}</h3>
                <Queue
                    data={this.props.hands}
                    onCancel={this.handleCancel}
                    currentUserName={this.props.userName}
                />
                {/* <Footer onSend={this.handleSend} askedMap={this.askedMap}/> */}
            </div>
        );
    }
}

Room.propTypes = {
    userName: PropTypes.string,
    token: PropTypes.string,
    name: PropTypes.string.isRequired,

    onSetUserName: PropTypes.func,
    onSetToken: PropTypes.func,
    onHandReceieved: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Room)
