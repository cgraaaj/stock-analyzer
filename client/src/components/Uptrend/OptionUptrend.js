import React from "react";
import { connect } from "react-redux";
import _ from "lodash"

import { getOptionValues } from "../../actions";

class OptionUptrend extends React.Component {

    componentDidMount() {
        this.props.getOptionValues()
    }

    populateRows = (options, header) => {
        options = header === "Call" ? options.sort((a, b) => a.callTrenddDiff > b.callTrenddDiff ? -1 : 1) : 
        options.sort((a, b) => a.putTrenddDiff > b.putTrenddDiff ? -1 : 1)
        console.log(options)
        let greenIndex = 120/options.length
        return options.map((option,i) =>
            <tr style={{ backgroundColor: `rgb(0,${greenIndex*(i+1)+80},0)` }} key ={i}>
                <td
                    data-tooltip={header === "Call" ? `Bullish:${option.options.calls.bullish} Bearish:${option.options.calls.bearish} ` : `Bullish:${option.options.puts.bullish} Bearish:${option.options.puts.bearish}`}
                    data-position="top right"
                    data-label={header}>
                    {option.name}
                </td>
            </tr>
        )
    }

    render() {
        return (<div className="ui segment">
            <div className="ui two column doubling grid container">
                <div className="column">
                    <table className="ui celled table">
                        <thead>
                            <tr>
                                <th>Call</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.populateRows(this.props.options.filter(option => option.callTrend), "Call")}
                        </tbody>
                    </table>
                </div>
                <div className="column">
                    <table className="ui celled table">
                        <thead>
                            <tr>
                                <th>Put</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.populateRows(this.props.options.filter(option => option.putTrend), "Put")}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>)
    }
}

const mapStateToProps = (state) => {

    return {
        optionTrend: state.uptrend.optionTrend,
        options: state.uptrend.options
    }
};

export default connect(mapStateToProps, { getOptionValues })(OptionUptrend);

