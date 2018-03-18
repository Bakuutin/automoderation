import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Button, ButtonGroup } from 'reactstrap';

import { minPriority, maxPriority } from './../constants.js';
import { getPriorityName, getPriorityStyle } from './../priorities.js';


class Footer extends React.Component {
    sendHandler(priority) {
        return () => this.props.onSend(priority)
    }

    render() {
        var addMeButtons = [];
        for (var priority = minPriority; priority <= maxPriority; priority++) {
            if (_.includes(this.props.asked, priority)) {
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
    'asked': PropTypes.array,
}

const mapStateToProps = (state, ownProps) => {
    return {
        asked: _.map(_.filter(state.hands, hand => hand.isOwn), hand => hand.priority),
    }
}

export default connect(mapStateToProps, dispatch => {return {}})(Footer);
