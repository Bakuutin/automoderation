import * as React from 'react';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { Button, ButtonGroup } from 'reactstrap';

import { minPriority, maxPriority } from './../constants';
import { getPriorityName, getPriorityStyle } from './../priorities';
import { HandData } from './Hand';


export interface Props {
    onSend: (priority: number) => any,
    asked: number[],
}

export interface State {
    verboseAge: string,
    timer: number,
}


class Footer extends React.Component<Props, State> {
    sendHandler(priority) {
        return () => this.props.onSend(priority)
    }

    render() {
        var addMeButtons = [];
        for (var priority = minPriority; priority <= maxPriority; priority++) {
            if (includes(this.props.asked, priority)) {
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

const mapStateToProps = (state: {hands: HandData[]}, ownProps) => {
    return {
        asked: state.hands.filter(hand => hand.isOwn).map(hand => hand.priority)
    }
}

export default connect(mapStateToProps, () => {return {}})(Footer);
