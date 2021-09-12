import React from "react";
import { connect } from "react-redux";
import _ from "lodash"
import EquityUptrend from "./EquityUptrend";
import OptionUptrend from "./OptionUptrend";
import { checkOptionTrend } from "../../actions";

class Uptrend extends React.Component {
    // componentWillUnmount(){
    //     this.props.checkOptionTrend(false)
    // }
    render() {
        return (<div className="ui container">
            <div className="ui segment">
                <div className="four column centered row">
                    <div className="ui toggle checkbox">
                        <input type="checkbox" name="option trend" disabled={this.props.isProgressing ? "disabled" : ""} checked={this.props.isEquityTrend} onClick={(e) => { this.props.checkOptionTrend(e.target.checked) }} />
                        <label>Equity Trend</label>
                    </div>
                </div>
            </div>{
                this.props.isEquityTrend ?  <EquityUptrend />:<OptionUptrend />
            }
        </div>)
    }
}

const mapStateToProps = (state) => {
    return {
        isEquityTrend: state.uptrend.equityTrend,
        isProgressing: state.uptrend.progressBar.isProgressing
    }
};

export default connect(mapStateToProps, { checkOptionTrend })(Uptrend);

