import React from 'react';
import {
    HashRouter as Router,
    Route,
    Link
} from 'react-router-dom'

const Room = ({ match }) => (
  <div>
    <h3>{match.params.room}</h3>
  </div>
)

const Hall = ({ match }) => (
  <div>
    <h3>Hall</h3>
  </div>
)

class Root extends React.Component {
    render() {
        return (
            <Router hashType="noslash">
                <div>
                    <Route exact path="/" component={Hall}/>
                    <Route path="/:room" component={Room}/>
                </div>
            </Router>
        );
    }
}

export default Root;
