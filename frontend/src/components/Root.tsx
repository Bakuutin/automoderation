import * as React from 'react'
import * as randomstring from 'randomstring'
import { HashRouter as Router, Route, Switch, Redirect, withRouter } from 'react-router-dom'
import Room from './Room'

const getRandomName = () => {
    return randomstring.generate({
        length: 10,
        charset: 'alphanumeric',
        readable: false,
    })
}

export const Root = ()=> {
    return (
        <Router hashType="noslash">
            <Switch>
                <Route exact path='/'>
                    <Redirect to={`/${getRandomName()}`}/>
                </Route>
                <Route path="/:room">
                    <Route path="/:room/share" render={props => <h1>Share</h1>}/>
                    <Route exact path="/:room" render={props => <Room name={props.match.params['room']}/>}/>
                </Route>
            </Switch>
        </Router>
    );
};
