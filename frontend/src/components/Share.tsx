import * as React from 'react';

export interface Props {
    name: string,
}

const https = (window.location.protocol === 'https:');
const wsHost = (https ? 'wss://' : 'ws://') + window.location.host;
const apiHost = (https ? 'https://' : 'http://') + window.location.host;



export const RoomShare = ({name}) => (
    <h1>Share {name}</h1>
);
