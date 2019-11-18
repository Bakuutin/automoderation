import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Provider } from 'react-redux';

import * as randomstring from 'randomstring'

import ReactGA from 'react-ga';

import configureStore from './configureStore'
import { createBrowserHistory } from 'history';

import { Route, Switch, Redirect } from 'react-router-dom'
import Room from './components/Room'
import { RoomShare } from './components/Share'
import { ConnectedRouter } from 'connected-react-router'

const getRandomName = () => {
    return randomstring.generate({
        length: 10,
        charset: 'alphanumeric',
        readable: false,
    })
}

const history = createBrowserHistory()

const debug = process.env.NODE_ENV === 'development';

ReactGA.initialize(process.env.GOOGLE_ANALYTICS_ID, {
    debug: debug,
    gaAddress: process.env.GOOGLE_ANALYTICS_URL,
    testMode: debug,
});

const store = configureStore({}, history);

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <Switch>
                <Route exact path='/'>
                    <Redirect to={`/${getRandomName()}`}/>
                </Route>
                <Route path="/:room">
                    <Route path="/:room/share" render={props => <RoomShare name={props.match.params['room']}/>}/>
                    <Route exact path="/:room" render={props => <Room name={props.match.params['room']}/>}/>
                </Route>
            </Switch>
        </ConnectedRouter>
    </Provider>,
    document.getElementById('root'),
);
