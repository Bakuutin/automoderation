import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import axios from 'axios';
import Loader from 'react-loaders'

import qs from 'qs';

import log from '../logger.js';
import { numberOfQueues } from './../constants.js';
import { setUserName, setToken, handReceieved, resetHands } from '../actions'

import SigninForm from './SigninForm.jsx'
import Hand from './Hand.jsx'
import Footer from './Footer.jsx'

const maxSocketErrors = 3

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
        this.onSocketError = this.onSocketError.bind(this);
        this.onSocketConnected = this.onSocketConnected.bind(this);
        this.onSetUserName = this.onSetUserName.bind(this);
        this.onRequestError = this.onRequestError.bind(this);

        this.state = {
            ws: null,
            connected: false,
            attemptsToConnect: 0,
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

    onSocketError() {
        const shouldDropToken = this.state.attemptsToConnect >= maxSocketErrors;

        this.setState({
            ws: null,
            connected: false,
            attemptsToConnect: this.state.attemptsToConnect + 1,
        })

        if (shouldDropToken) {
            this.dropToken();
        }
    }

    onSocketConnected() {
        this.setState({
            connected: true,
            attemptsToConnect: 0,
        })
    }

    onRequestError(error) {
        this.setState({
            connected: false,
            ws: null,
            attemptsToConnect: this.state.attemptsToConnect + 1,
        });
        this.dropToken();
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
        setTimeout(() => {
            this.client.post('/auth', {
                'room': this.props.name,
                'name': this.props.userName,
            }).then((response) => {
                this.props.onSetToken(this.props.name, response.data.token);
            }).catch(this.onRequestError);
        }, this.getReconnectTimeout());
    }

    onSetUserName(newUsername) {
        this.props.onSetUserName(newUsername);
    }

    onHandReceieved(handData) {
        handData['isOwn'] = handData.user === this.props.userName;
        this.props.onHandReceieved(handData);
    }

    setSocket() {
        setTimeout(() => {
            const ws = new WebSocket(wsUrl + '?' + qs.stringify({'token': this.props.token}));
            ws.onopen = this.onSocketConnected;
            ws.onclose = this.onSocketError;
            ws.onerror = this.onSocketError;
            ws.onmessage = e => this.onHandReceieved(JSON.parse(e.data));
            this.setState({
                ws: ws,
            });
            this.props.onResetHands();
        }, this.getReconnectTimeout());
    }

    componentWillUnmount() {
        this.closeSocket();
    }

    closeSocket() {
        if (this.state.ws) {
            this.state.ws.close();
        }
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.props.userName) {
            return
        }

        if (!this.props.token) {
            this.getToken();
            return
        }

        if (!this.state.ws) {
            this.setSocket()
        }
    }

    getReconnectTimeout() {
        if (this.state.attemptsToConnect === 0) {
            return 0
        }
        return 400 * Math.pow(2, this.state.attemptsToConnect)
    }

    handleSend(priority) {
        this.client.post('/api/hands/', {priority: priority}).catch(this.onRequestError);
    }

    handleCancel(handId) {
        this.client.delete(`/api/hands/${handId}`).catch(this.onRequestError);
    }

    render() {
        if (!this.props.userName) {
            return (
                <SigninForm
                    title="Almost there,"
                    subtitle="choose a name"
                    placeholder="T-Rex 9000"
                    buttonText="Join"
                    initial={this.props.userName}
                    onSubmit={this.onSetUserName}
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
