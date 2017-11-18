import React from 'react';
import { connect } from 'react-redux'
import { setRoomName, setUserName } from '../actions'
import PropTypes from 'prop-types';
import SigninForm from './SigninForm.jsx'

const RoomNameForm = (props) => (
    <SigninForm
        title="Please,"
        subtitle="enter the room name"
        placeholder="Platform 9¾"
        buttonText="Let's go"
        onSubmit={props.onSubmit}
    />
)

const UserNameForm = (props) => (
    <SigninForm
        title="You are almost there"
        subtitle="What's your name today?"
        placeholder="T-Rex 9000"
        buttonText="Join"
        onSubmit={props.onSubmit}
    />
)

const mapDispatchToProps = dispatch => {
    return {
        onSetUserName: (value) => {
            dispatch(setUserName(value))
        },
        onSetRoomName: (value) => {
            dispatch(setRoomName(value))
        }
    }
}

class Room extends React.Component {
    render() {
        if (!this.props.auth.roomName) {
            return <RoomNameForm onSubmit={this.props.onSetRoomName}/>
        }

        if (!this.props.auth.userName) {
            return <UserNameForm onSubmit={this.props.onSetUserName}/>
        }

        return (
            <div>
                <h3>{this.props.auth.roomName}</h3>
                <h3>{this.props.auth.userName}</h3>
            </div>
        )
    }
}

Room.propTypes = {
    auth: PropTypes.shape({
        userName: PropTypes.string,
        roomName: PropTypes.string,
        token: PropTypes.string,
    }),
    onSetUserName: PropTypes.func,
    onSetRoomName: PropTypes.func,
}

const ReduxRoom = connect(state => state, mapDispatchToProps)(Room)

export default ReduxRoom
