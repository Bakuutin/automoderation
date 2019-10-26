import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import { merge, map } from 'lodash';
import axios from 'axios';
import Loader from 'react-loaders'

import { setUserName, handReceieved, resetHands } from '../actions'

import SigninForm from './SigninForm'
import Hand, { HandData } from './Hand'
import Footer from './Footer'
import { AssertionError } from 'assert';


export interface Props {
    userName?: string,
    token?: string,
    name: string,
    hands?: HandData[],

    onSetUserName?: (name: string) => any,
    onHandReceieved?: (hand: HandData) => any,
    onResetHands?: () => any,
}

export interface State {
    attemptsToConnect: number,
    ws: WebSocket,
    connected: boolean,
}


const mapStateToProps = (state: any, ownProps: Props) => {
    return {
        userName: state.auth.userName,
        hands: state.hands,
    }
}

const mapDispatchToProps = (dispatch: Dispatch<Action<string>>) => ({
    onSetUserName: (value: string) => {
        dispatch(setUserName(value));
    },
    onHandReceieved: (hand: HandData) => {
        dispatch(handReceieved(hand));
    },
    onResetHands: () => {
        dispatch(resetHands());
    },
})

const https = (window.location.protocol === 'https:');
const wsHost = (https ? 'wss://' : 'ws://') + window.location.host;
const apiHost = (https ? 'https://' : 'http://') + window.location.host;

class dRoom extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.handleSend = this.handleSend.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.onSocketError = this.onSocketError.bind(this);
        this.onSocketConnected = this.onSocketConnected.bind(this);
        this.onSetUserName = this.onSetUserName.bind(this);

        this.state = {
            ws: null,
            connected: false,
            attemptsToConnect: 0,
        }
    }

    get hands() {
        return map(this.props.hands, (handData, index) => React.createElement(
            Hand,
            merge({}, handData, {
                onCancel: this.handleCancel,
                key: handData.id,
                position: index,
            }),
            null
        ));
    }

    onSocketError() {
        console.error('WS disconnected')
        this.setState({
            ws: null,
            connected: false,
            attemptsToConnect: this.state.attemptsToConnect + 1,
        })
    }

    onSocketConnected() {
        this.setState({
            connected: true,
            attemptsToConnect: 0,
        })
    }

    get client() {
        return axios.create({ timeout: 2000 })
    }

    get path() {
        if (!this.props.userName) {
            throw new AssertionError({message: 'Missing username'})
        }
        return `/api/rooms/${this.props.name}/users/${this.props.userName}`
    }

    onSetUserName(name: string) {
        this.props.onSetUserName(name);
    }

    onHandReceieved(handData: HandData) {
        handData.isOwn = handData.user === this.props.userName;
        this.props.onHandReceieved(handData);
    }

    setSocket() {
        setTimeout(() => {
            const ws = new WebSocket(`${wsHost}${this.path}/ws`);
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
        this.setSocketIfMissing()
    }

    componentDidUpdate() {
        this.setSocketIfMissing()
    }

    setSocketIfMissing() {
        if (this.props.userName && !this.state.ws) {
            this.setSocket()
        }
    }

    getReconnectTimeout() {
        if (this.state.attemptsToConnect === 0) {
            return 0
        }
        return 400 * Math.pow(2, this.state.attemptsToConnect)
    }

    handleSend(priority: number) {
        this.client.post(`${apiHost}${this.path}/hands/`, {priority: priority});
    }

    handleCancel(handId: string) {
        this.client.delete(`${apiHost}${this.path}/hands/${handId}`);
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

        if (!this.state.connected) {
            return <Loader type="ball-pulse-rise" active/>;
        }
        return (
            <div>
                <div className="queues">{this.hands}</div>
                <Footer onSend={this.handleSend}/>
            </div>
        );
    }
}

export const Room = connect(mapStateToProps, mapDispatchToProps)(dRoom)
export default Room;
