import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import EODAnalysis from "./EODAnalysis";
import SectorTrend from "./SectorTrend"
import { checkOptionTrend } from "../../actions";

class EquityTrend extends React.Component {
  // componentWillUnmount(){
  //     this.props.checkOptionTrend(false)
  // }
  refreshRef = React.createRef();
  render() {
    return (
      <div>
        <div className="ui segment">
          <div className="four column centered row">
            <div className="ui toggle checkbox">
              <input
                type="checkbox"
                name="option trend"
                disabled={this.props.isProgressing ? "disabled" : ""}
                checked={this.props.isEquityTrend}
                onClick={(e) => {
                  this.props.checkOptionTrend(e.target.checked);
                }}
              />
              <label>EOD Analysis</label>
            </div>
          </div>
        </div>
        {this.props.isEquityTrend ? (
          <EODAnalysis />
        ) : (
          <SectorTrend/>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isEquityTrend: state.uptrend.equityTrend,
  };
};

export default connect(mapStateToProps, { checkOptionTrend })(EquityTrend);
