import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup } from 'reactstrap';

import { numberOfQueues } from './../constants.js';
import { getPriorityName, getPriorityStyle } from './../priorities.js';


class Footer extends React.Component {
    sendHandler(priority) {
        return () => this.props.onSend(priority)
    }

    render() {
        var addMeButtons = [];
        for (var priority = 0; priority < numberOfQueues; priority++) {
            if (this.props.askedMap[priority]) {
                continue
            }

            addMeButtons.push(
                <Button
                    color={getPriorityStyle(priority)}
                    onClick={this.sendHandler(priority)}
                    key={priority}
                >
                    {getPriorityName(priority)}
                </Button>
            );
        }
        return (
            <div className="footer fixed-bottom">
                <ButtonGroup size="lg" vertical>{addMeButtons}</ButtonGroup>
            </div>
        )
    }
}

Footer.propTypes = {
    'onSend': PropTypes.func,
    'askedMap': PropTypes.object,
}

export default Footer
