import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import './style.scss';

import reducer from './reducers'
import Root from './components/Root.jsx'


let store = createStore(reducer)

ReactDOM.render(<Provider store={store}><Root/></Provider>, document.getElementById('root'));
