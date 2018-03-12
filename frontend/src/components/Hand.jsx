import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Alert } from 'reactstrap';
import _ from 'lodash';
import FontAwesome from 'react-fontawesome';

import { getPriorityStyle } from './../priorities.js';

class Hand extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        if (this.props.isOwn) {
            this.props.onCancel(this.props.id);
        }
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

    render() {
        return (
            <Alert color={getPriorityStyle(this.props.priority)} onClick={this.handleClick}>
                {this.prefix} {this.props.user}
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
