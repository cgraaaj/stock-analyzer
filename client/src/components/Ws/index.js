import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { } from "../../actions";
import { WS_OPTION_RANK, WS_OPTION_TREND, SET_WS } from "../../actions/types"

class Ws extends React.Component {

    // instance of websocket connection as a class property
    // socket = io(`http://192.168.1.76:3213`);
    websocket = () => {
        const ws = new WebSocket(`wss://${window.location.host}/ws`)
        ws.onopen = () => {
            // on connecting, do nothing but log it to the console
            console.log('connected')
        }
        ws.onmessage = evt => {
            // listen to data sent from the websocket server
            const data = JSON.parse(evt.data)
            // console.log(data)
            if (!_.isEmpty(data)) {
                switch (data.event) {
                    case "TREND":
                        this.props.setOptionsTrend(data)
                        break
                    case "RANK":
                        data['data'] = JSON.parse(data.data)
                        this.props.setOptionsRank(data)
                        break
                    default:
                        this.props.setOptionsTrend(data.options_trend)
                        data['options_rank']['data'] = JSON.parse(data.options_rank.data)
                        this.props.setOptionsRank(data.options_rank)
                }
            }
        }

        ws.onclose = (e) => {
            const today = new Date();
            let start = today.setHours(9, 15, 0)
            let end = today.setHours(15, 30, 0)
            let now = today.getTime();
            // console.log(now > start && now < end)
            if (now > start && now < end) {
                console.log('Socket is closed. Reconnect will be attempted in 30 second.', e.reason);
                setTimeout(() => {
                    this.props.setWebSocket(this.websocket())
                }, 30000);
            }
        }

        ws.onerror = (err) => {
            console.error('Socket encountered error: ', err.message, 'Closing socket');
            ws.close();
        };
        return ws
    }

    componentDidMount() {

        this.props.setWebSocket(this.websocket())

    }

    render() {
        return null
    }
}


const mapStateToProps = (state) => {
    return {
        ws: state.websocket.ws
    };
};

const setOptionsTrend = (payload) => {
    return {
        type: WS_OPTION_TREND,
        payload
    }
}

const setOptionsRank = (payload) => {
    return {
        type: WS_OPTION_RANK,
        payload
    }
}

const setWebSocket = (payload) => {
    return {
        type: SET_WS,
        payload
    }
}
export default connect(mapStateToProps, { setOptionsTrend, setOptionsRank, setWebSocket })(Ws);


