import * as React from 'react';
import { Alert } from 'reactstrap';
import * as moment from 'moment';
import * as FontAwesome from 'react-fontawesome';
import ReactGA from 'react-ga';


import { priorities } from './../priorities';

export interface HandData {
    id: string,
    user: string,
    priority: number,
    cancel: boolean,
    raisedAt: number,
    isOwn: boolean,
}

export interface Props extends HandData {
    onCancel: (id: string) => any,
    position: number,
}

export interface State {
    verboseAge: string,
    timer: number,
}

class Hand extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            verboseAge: this.getVerboseAge(),
            timer: window.setInterval(() => this.setState({verboseAge: this.getVerboseAge()}), 200),
        };
    }

    handleClick() {
        if (this.props.isOwn) {
            ReactGA.event({
                category: 'Hand Lowered',
                action: this.props.priority.toString(),
            });
            this.props.onCancel(this.props.id);
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.timer);
    }

    get prefix() {
        return this.props.isOwn? <FontAwesome name='star'/>: '';
    }

    get alertClass() {
        const classes = ['hand'];
        if (this.props.position === 0) {
            classes.push('hand-top');
        }
        if (this.props.isOwn) {
            classes.push('hand-own');
        }
        return classes.join(' ');
    }

    getVerboseAge() {
        const
            totalSeconds = Math.round(moment().unix() - this.props.raisedAt / 1e9),
            minutes = Math.floor(totalSeconds / 60),
            seconds = totalSeconds % 60;

        if (totalSeconds < 5) {
            return `now`
        }

        return minutes? `${minutes}m ${seconds}s`: `${seconds}s`
    }

    render() {
        return (
            <Alert color={priorities[this.props.priority].style} onClick={this.handleClick} className={this.alertClass}>
                <span>{this.prefix} {this.props.user}</span>
                <span className="float-right">{this.state.verboseAge}</span>
            </Alert>
        )
    }
}

export default Hand;
