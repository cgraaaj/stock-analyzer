import React from "react";
import { connect } from "react-redux";
import _ from "lodash"

import { getOptionValues } from "../../actions";

class OptionUptrend extends React.Component {

    componentDidMount() {
        this.props.getOptionValues()
    }

    populateRows = (options, header) => {
        options = header === "Call" ? options.sort((a, b) => a.callTrendDiff > b.callTrendDiff ? -1 : 1)
            : options.sort((a, b) => a.putTrendDiff > b.putTrendDiff ? -1 : 1)
        let greenIndex = 100 / options.length
        return options.map((option, i) =>
            <tr style={{ backgroundColor: `rgb(0,${greenIndex * (i + 1) + 100},0)` }} key={i}>
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
            {/* <div>
                <iframe src={"http://localhost:3051/stock-analyzer/stock-analyzer/api/analyze/options"} height={500} width={500} />
            </div> */}
            <div className={this.props.progressBar.isComplete?`ui active progress success`:`ui active progress`} data-percent={this.props.progressBar.progress}>
                <div className="bar" style={{width:`${this.props.progressBar.progress}%`,transitionDuration:"5000ms"}}>
                    <div className="progress">{`${this.props.progressBar.progress}%`}</div>
                </div>
                <div className="label">{this.props.progressBar.isComplete?"Its done":"Analyzing Options"}</div>
            </div>
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
        options: state.uptrend.options,
        progressBar: state.uptrend.progressBar
    }
};

export default connect(mapStateToProps, { getOptionValues })(OptionUptrend);

