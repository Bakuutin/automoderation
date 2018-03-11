import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'reactstrap';
import _ from 'lodash';
import FontAwesome from 'react-fontawesome';

import { numberOfQueues } from './../constants.js';

import { getPriorityName, getPriorityStyle } from './../priorities.js';

class Hand extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        if (this.props.isOwn) {
            this.props.onCancel(this.props.priority)
        }
    }

    render() {
        let prefix = this.props.isOwn? <FontAwesome name='star'/>: '';
        return (
            <Alert color={getPriorityStyle(this.props.priority)} onClick={this.handleClick}>
                {prefix} {this.props.userName}
            </Alert>
        )
    }
}

Hand.propTypes = {
    'userName': PropTypes.string,
    'priority': PropTypes.number,
    'isOwn': PropTypes.bool,
}

const Queue = (props) => {
    let hands = []
    // for (var priority = 0; priority < numberOfQueues; priority++) {
    //     hands = _.concat(hands, _.map(props.data[priority], (userName) => (
    //         <Hand
    //             userName={userName}
    //             priority={priority}
    //             key={[userName, priority]}
    //             isOwn={userName === props.currentUserName}
    //             onCancel={props.onCancel}
    //         />
    //     )))
    // }
    return <div className="queues">{hands}</div>
}

export default Queue
