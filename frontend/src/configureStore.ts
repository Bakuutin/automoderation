import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import createRootReducer from './reducers'
import { googleAnalytics } from './analytics'
import { History } from 'history';
import { routerMiddleware } from 'connected-react-router';


export default (initialState: any, history: History) => {
    return createStore(
        createRootReducer(history),
        initialState,
        compose(
            applyMiddleware(routerMiddleware(history)),
            applyMiddleware(googleAnalytics),
        ),
    )
}
