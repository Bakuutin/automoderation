import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'reactstrap';
import _ from 'lodash'

import { numberOfQueues } from './../constants.js';

class Message extends React.Component {
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
        return (
            <Alert color="info" onClick={this.handleClick}>
                <p>{this.props.userName}</p>
                <p>Priority: {this.props.priority}</p>
                <p>{this.props.isOwn? 'Own': 'Not own'}</p>
            </Alert>
        )
    }
}

Message.propTypes = {
    'userName': PropTypes.string,
    'priority': PropTypes.number,
    'isOwn': PropTypes.bool,
}

const Queues = (props) => {
    let messages = []
    for (var priority = 0; priority < numberOfQueues; priority++) {
        messages = _.concat(messages, _.map(props.data[priority], (userName) => (
            <Message
                userName={userName}
                priority={priority}
                key={[userName, priority]}
                isOwn={userName === props.currentUserName}
                onCancel={props.onCancel}
            />
        )))
    }
    return <div className="queues">{messages}</div>
}

export default Queues
