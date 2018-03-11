import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import persistState from 'redux-localstorage'

import reducer from './reducers'
import Root from './components/Root.jsx'

let store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()) //, persistState(['auth']))

ReactDOM.render(<Provider store={store}><Root/></Provider>, document.getElementById('root'));
