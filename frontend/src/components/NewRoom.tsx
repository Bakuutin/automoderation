import * as React from 'react';
import { Redirect } from 'react-router'

import * as randomstring from 'randomstring'


class NewRoom extends React.Component {
    render() {
        return <Redirect to={'/' + this.getRandomName()}/>
    }

    getRandomName() {
        return randomstring.generate({
            length: 32,
            charset: 'alphanumeric',
            readable: true,
        })
    }
}

export default NewRoom
