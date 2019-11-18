import * as React from 'react';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { Button, ButtonGroup } from 'reactstrap';

import { priorities } from './../priorities';
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
        let addMeButtons = [];
        for (let priority = 0; priority < priorities.length; priority++) {
            if (includes(this.props.asked, priority)) {
                continue
            }

            const {name, style, hide} = priorities[priority]

            if (hide) {
                continue
            }

            addMeButtons.push(
                <Button
                    color={style}
                    onClick={this.sendHandler(priority)}
                    key={priority}
                >
                    {name}
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
