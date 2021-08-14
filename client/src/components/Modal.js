import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";

import Chart from "./BarCharts/Chart";

class Modal extends React.Component {
  renderChart = (data) =>{
    return (<div style={{
      paddingBottom: '56.25%', /* 16:9 */
      position: 'relative',
      height: 0
    }} >
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%'
      }}>
        <Chart chartData={data} />
      </div>
    </div>)
  }

  render() {
    return ReactDOM.createPortal(
      <div
        className="ui dimmer modals visible active"
        onClick={this.props.onDismiss}
      >
        <div
          className="ui standard modal visible active"
          onClick={(e) => e.stopPropagation()}
        >
          <i className="close icon" onClick={this.props.onDismiss}></i>
          {this.props.data ? (
            <React.Fragment>
              {this.renderChart(this.props.data)}
            </React.Fragment>
          ) : null}
        </div>
      </div>,
      document.querySelector("#modal")
    );
  }
}

const mapStateToProps = (state) => {
  return { };
};

export default connect(mapStateToProps, { })(Modal);
