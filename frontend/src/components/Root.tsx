import * as React from 'react'
import * as randomstring from 'randomstring'
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import Room from './Room'

const getRandomName = () => {
    return randomstring.generate({
        length: 32,
        charset: 'alphanumeric',
        readable: true,
    })
}

export const Root = ()=> {
    return (
        <Router hashType="noslash">
            <Switch>
                <Route exact path='/'>
                    <Redirect to={'/' + getRandomName()}/>
                </Route>
                <Route path="/:room" render={props => <Room name={props.match.params['room']}/>}/>
            </Switch>
        </Router>
    );
};


export default Root;
