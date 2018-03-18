import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux'
import { compose, createStore } from 'redux'
import persistState from 'redux-sessionstorage'

import reducer from './reducers'
import Root from './components/Root.jsx'

const enhancer = compose(
    persistState(['auth']),
);

let store = createStore(reducer, enhancer);

ReactDOM.render(<Provider store={store}><Root/></Provider>, document.getElementById('root'));
