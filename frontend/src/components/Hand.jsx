import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Alert } from 'reactstrap';
import _ from 'lodash';
import moment from 'moment';
import FontAwesome from 'react-fontawesome';

import { getPriorityStyle } from './../priorities.js';

class Hand extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state
    }

    handleClick() {
        if (this.props.isOwn) {
            this.props.onCancel(this.props.id);
        }
    }

    componentDidMount() {
        this.timer = setInterval(() => {
            this.forceUpdate();
        }, 200);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    get prefix() {
        return this.props.isOwn? <FontAwesome name='star'/>: '';
    }

    get alertClass() {
        var classes = ['hand'];
        if (this.props.position === 0) {
            classes.push('hand-top');
        }
        if (this.isOwn) {
            classes.push('hand-own');
        }
        return classes.join(' ');
    }

    get age() {
        return moment.unix(this.props.raisedAt).fromNow();
    }

    render() {
        return (
            <Alert color={getPriorityStyle(this.props.priority)} onClick={this.handleClick}>
                <span>{this.prefix} {this.props.user}</span>
                <span className="pull-right">{this.age}</span>
            </Alert>
        )
    }
}

Hand.propTypes = {
    'user': PropTypes.string,
    'id': PropTypes.string,
    'priority': PropTypes.number,
    'cancel': PropTypes.bool,
    'raisedAt': PropTypes.number,
    'onCancel': PropTypes.func,
    'isOwn': PropTypes.bool,
    'position': PropTypes.number,
}

export default Hand;
