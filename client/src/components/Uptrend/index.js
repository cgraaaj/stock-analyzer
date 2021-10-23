import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import OptionUptrend from "./OptionUptrend";
import { checkOptionTrend } from "../../actions";

class Uptrend extends React.Component {
  // componentWillUnmount(){
  //     this.props.checkOptionTrend(false)
  // }
  render() {
    return (
      <div>
          <OptionUptrend refreshRef={this.refreshRef} />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isProgressing: state.uptrend.progressBar.isProgressing,
  };
};

export default connect(mapStateToProps, { checkOptionTrend })(Uptrend);
