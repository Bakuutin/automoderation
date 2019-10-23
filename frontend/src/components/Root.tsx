import * as React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import Room from './Room'
import NewRoom from './NewRoom'

export const Root = ()=> {
    return (
        <Router hashType="noslash">
            <Switch>
                <Route exact path="/" component={NewRoom}/>
                <Route path="/:room" render={props => <Room name={props.match.params['room']}/>}/>
            </Switch>
        </Router>
    );
};


export default Root;
