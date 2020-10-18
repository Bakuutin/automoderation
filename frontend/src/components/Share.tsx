import * as React from 'react'
import { toDataURL as getQR } from 'qrcode'
import { Link, withRouter, RouteComponentProps } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard';

declare const navigator: any;

export interface Props extends RouteComponentProps {
    name: string,
}

export interface State {
    qrUrl?: string,
    copied: boolean,
}

const https = (window.location.protocol === 'https:');
const wsHost = (https ? 'wss://' : 'ws://') + window.location.host;
const apiHost = (https ? 'https://' : 'http://') + window.location.host;


class dRoomShare extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            qrUrl: null,
            copied: false,
        }
        getQR(
            this.link,
            {
                width: Math.min(window.innerWidth, window.innerHeight) / 3 * 2,
                margin: 0,
            }
        ).then(qrUrl => this.setState({qrUrl}))

        this.handleShare = this.handleShare.bind(this)
    }

    get link() {
        return `${apiHost}/${this.props.name}`
    }

    handleShare() {
        navigator.share({
            title: 'Automoderation',
            url: this.link,
        }).then(() => {
            this.props.history.push(`/${this.props.name}`)
        })
    }

    render() {
        let shareButton: React.ReactElement

        if (navigator.share) {
            shareButton = (
                <button className="btn mt-3 btn-lg btn-primary mx-auto d-block" onClick={this.handleShare}>
                    <i className="fas fa-share-square"></i> Send
                </button>
            )
        }

        return (
            <div>
                <Link className="btn btn-link mx-auto d-block" to={`/${this.props.name}`}>Close Sharing</Link>
                <img className="img-fluid mx-auto d-block" src={this.state.qrUrl} alt=""/>
                <CopyToClipboard text={this.link} onCopy={() => {this.setState({copied: true})}}>
                    <button className={"btn mt-3 btn-lg mx-auto d-block " + (!this.state.copied ? "btn-primary": "btn-success")}>
                        <i className="far fa-copy"></i> {!this.state.copied ? "Copy link": "Copied"}
                    </button>
                </CopyToClipboard>
                { shareButton }
            </div>
        )
    }
};


export const RoomShare = withRouter(dRoomShare)
