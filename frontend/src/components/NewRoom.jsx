import React from 'react';
import { Redirect } from 'react-router'

import randomstring from 'randomstring'


class NewRoom extends React.Component {
    render() {
        return <Redirect to={"/" + this.randomName}/>
    }

    constructor(props) {
        super(props);
        this.randomName = randomstring.generate({
            length: 32,
            charset: 'alphanumeric',
            readable: true,
        })
    }
}

export default NewRoom
