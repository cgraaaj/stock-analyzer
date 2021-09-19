import React from "react";
import { connect } from "react-redux";
import _ from "lodash";

import {
  fetchData,
  getOptionValues,
  resetOptionTrend,
  selectTicker,
  analyzeOptionChain,
  getOptionChain,
  resetTicker,
} from "../../actions";

class OptionUptrend extends React.Component {
  componentDidMount() {
    if (_.isEmpty(this.props.options)) {
      this.props.getOptionValues();
    }
    window.addEventListener("beforeunload", this.handleWindowBeforeUnload);
    this.unmountProgressBar();
    this.props.refreshRef.current.addEventListener(
      "click",
      this.onClickRefresh
    );
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.handleWindowBeforeUnload);
  }

  componentDidUpdate() {
    this.unmountProgressBar();
    this.onSelectTicker();
  }

  onSelectTicker = () => {
    if (!_.isEmpty(this.props.data)) {
      console.log(this.props.selectedTicker);
      const values = {
        mode: this.props.selectedTicker.mode,
        index: this.props.selectedTicker.index,
        expiry: this.props.expiryDates[0],
      };
      this.props.analyzeOptionChain({ ...values, data: this.props.data });
      this.props.getOptionChain(values.expiry, this.props.data);
    }
  };

  onClickRefresh = () => {
    this.props.resetOptionTrend();
    this.props.getOptionValues();
  };

  unmountProgressBar() {
    if (
      this.props.progressBar.isComplete &&
      document.getElementById("progressBar")
    ) {
      setTimeout(() => {
        document
          .getElementById("progressBarParent")
          .removeChild(document.getElementById("progressBar"));
      }, 1000);
    }
  }

  handleWindowBeforeUnload = (ev) => {
    ev.preventDefault();
    ev.returnValue = "Do you want to cancel the request";
  };
  //table rows populate
  populateRow = (options, header) => {
    options =
      header === "Call"
        ? options.sort((a, b) => (a.callTrendDiff > b.callTrendDiff ? -1 : 1))
        : options.sort((a, b) => (a.putTrendDiff > b.putTrendDiff ? -1 : 1));
    let greenIndex = 100 / options.length;
    return options.map((option, i) => (
      <tr
        style={{ backgroundColor: `rgb(0,${greenIndex * (i + 1) + 100},0)` }}
        key={i}
      >
        <td
          style={{ color: "white" }}
          data-tooltip={
            header === "Call"
              ? `Bullish:${option.options.calls.bullish} Bearish:${option.options.calls.bearish} `
              : `Bullish:${option.options.puts.bullish} Bearish:${option.options.puts.bearish}`
          }
          data-position="top right"
          data-label={header}
        >
          {option.name}
        </td>
      </tr>
    ));
  };

  populateGridRow = (options, header) => {
    options = options.filter((option) =>
      header === "Call" ? option.callTrend : option.putTrend
    );
    options =
      header === "Call"
        ? options.sort((a, b) => b.callTrendDiff - a.callTrendDiff)
        : options.sort((a, b) => b.putTrendDiff - a.putTrendDiff);
    let greenIndex = 100 / options.length;
    return options.map((option, i) => (
      <div
        onClick={() => {
          this.props.resetTicker();
          this.props.fetchData("UPTREND", "equities", option.name);
          const selectedTicker = { mode: "EQUITY", index: option.name };
          this.props.selectTicker(selectedTicker);
        }}
        style={{
          color: "white",
          backgroundColor: `rgb(0,${greenIndex * (i + 1) + 100},0)`,
          cursor: "pointer",
        }}
        key={i}
        data-tooltip={
          header === "Call"
            ? `Bullish:${option.options.calls.bullish} Bearish:${option.options.calls.bearish} `
            : `Bullish:${option.options.puts.bullish} Bearish:${option.options.puts.bearish}`
        }
        data-position="top right"
        data-label={header}
        className="column"
      >
        <div className="row">{option.name}</div>
        <div className="row">value%</div>
      </div>
    ));
  };

  populateOption = (options, header) => {
    return (
      <div className="ui segment">
        <div className="ui one column grid container">
          <div className="row">
            <div className="ui grid">
              <div className="left floated column">{header}</div>
            </div>
          </div>
          <div className="row">
            <div className="ui container">
              {_.isEmpty(options) ? (
                <div className="ui active inverted dimmer">
                  <div className="ui text loader">Loading</div>
                </div>
              ) : (
                <div className="ui eight column doubling grid">
                  {this.populateGridRow(options, header)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="ui segments">
        {_.isEmpty(this.props.options) ? null : (
          <div id="progressBarParent">
            <div id="progressBar" className="ui segment">
              <div
                className={
                  this.props.progressBar.isComplete
                    ? `ui active progress success`
                    : `ui active progress`
                }
                data-percent={this.props.progressBar.progress}
              >
                <div
                  className="bar"
                  style={{
                    width: `${this.props.progressBar.progress}%`,
                    transitionDuration: "1000ms",
                  }}
                >
                  <div className="progress">{`${this.props.progressBar.progress}%`}</div>
                </div>
                <div className="label">
                  {this.props.progressBar.isComplete
                    ? "Its done"
                    : "Analyzing Options"}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="ui segment">
          <div className="ui segments">
            {this.populateOption(this.props.options, "Call")}
            {this.populateOption(this.props.options, "Put")}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    options: state.uptrend.options,
    progressBar: state.uptrend.progressBar,
    expiryDates: state.uptrend.tickerData.expiryDates,
    data: state.uptrend.tickerData,
    selectedTicker: state.uptrend.selectedTicker,
  };
};

export default connect(mapStateToProps, {
  fetchData,
  getOptionValues,
  resetOptionTrend,
  selectTicker,
  analyzeOptionChain,
  getOptionChain,
  resetTicker,
})(OptionUptrend);
