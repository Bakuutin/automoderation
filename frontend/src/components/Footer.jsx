import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup } from 'reactstrap';

import { numberOfQueues } from './../constants.js';
import { getPriorityName } from './../priorities.js';


class Footer extends React.Component {
    sendHandler(priority) {
        return () => this.props.onSend(priority)
    }

    render() {
        var addMeButtons = [];
        for (var priority = 0; priority < numberOfQueues; priority++) {
            addMeButtons.push(
                <Button
                    color="info"
                    onClick={this.sendHandler(priority)}
                    key={priority}
                >
                    {getPriorityName(priority)}
                </Button>
            );
        }
        return (
            <div className="footer">
                <ButtonGroup size="lg">{addMeButtons}</ButtonGroup>
            </div>
        )
    }
}

Footer.propTypes = {
    'onSend': PropTypes.func,
}

export default Footer
