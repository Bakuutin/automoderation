import React from 'react';
import {
    HashRouter as Router,
    Route,
    Switch,
} from 'react-router-dom'

import Room from './Room.jsx'

class Root extends React.Component {
    render() {
        return (
            <Router hashType="noslash">
                <Switch>
                    <Route exact path="/" component={Room}/>
                    {/* <Route path="/:room" component={Room}/> */}
                </Switch>
            </Router>
        );
    }
}

export default Root;
