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
import Hand from './Hand.jsx'
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
        this.onSocketError = this.onSocketError.bind(this);
        this.onSocketConnected = this.onSocketConnected.bind(this);
        this.onSetUserName = this.onSetUserName.bind(this);
        this.onRequestError = this.onRequestError.bind(this);

        this.state = {
            usernameIsTaken: false,
            ws: null,
            connected: false,
            failedAttemptsToConnect: 0,
        }
    }

    get hands() {
        return _.map(this.props.hands, (handData, index) => React.createElement(
            Hand,
            _.merge({}, handData, {
                'onCancel': this.handleCancel,
                'key': handData.id,
                'position': index,
            }),
            null
        ));
    }

    onSocketClose() {
        this.state.ws = null;
        this.state.connected = false;
    }

    onSocketError() {
        console.log('Socket error, trying to reconnect')
        this.onSocketClose();
        this.state.failedAttemptsToConnect++;

        if (this.state.failedAttemptsToConnect > 7) {
            this.state.failedAttemptsToConnect = 0;
            this.dropToken();
            return
        }

        setTimeout(() => {
            this.setSocket();
            this.forceUpdate();
        }, 200 * Math.pow(2, this.state.failedAttemptsToConnect));
    }

    onSocketConnected() {
        this.state.connected = true;
        this.state.failedAttemptsToConnect = 0;
        this.forceUpdate();
    }

    onRequestError(error) {
        if (error.response) {
            switch (error.response.status) {
                case 409:
                    this.state.usernameIsTaken = true;
                case 401:
                    this.dropToken();
                case 404:
                    this.setSocket();
            }
        } else {
            this.dropToken();
        }
        this.forceUpdate();
    }

    get client() {
        return axios.create({
            headers: {'Token': this.props.token || ''},
            timeout: 2000,
        })
    }

    dropToken() {
        this.closeSocket();
        this.props.onSetToken(this.props.name, null);
    }

    getToken() {
        this.client.post('/auth', {
            'room': this.props.name,
            'name': this.props.userName,
        }).then((response) => {
            this.props.onSetToken(this.props.name, response.data.token);
        }).catch(this.onRequestError);
    }

    onSetUserName(newUsername) {
        this.state.usernameIsTaken = false;
        this.props.onSetUserName(newUsername);
        this.forceUpdate();
    }

    onHandReceieved(handData) {
        handData['isOwn'] = handData.user === this.props.userName;
        this.props.onHandReceieved(handData);
    }

    setSocket() {
        this.props.onResetHands();
        this.state.ws = new WebSocket(wsUrl + '?' + qs.stringify({'token': this.props.token}));
        this.state.ws.onopen = this.onSocketConnected;
        this.state.ws.onclose = this.onSocketClose;
        this.state.ws.onerror = this.onSocketError;
        this.state.ws.onmessage = (e) => this.onHandReceieved(JSON.parse(e.data));
        window.ws = this.state.ws;
    }

    componentWillUnmount() {
        this.closeSocket();
    }

    closeSocket() {
        if (this.ws) {
            this.ws.close();
        }
    }

    componentDidMount() {
        this.componentDidUpdate();
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
        this.client.post('/api/hands/', {priority: priority}).catch(this.onRequestError);
    }

    handleCancel(handId) {
        this.client.delete(`/api/hands/${handId}`).catch(this.onRequestError);
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
            return <Loader type="ball-pulse-rise"/>;
        }
        return (
            <div>
                <div className="queues">{this.hands}</div>
                <Footer onSend={this.handleSend}/>
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
