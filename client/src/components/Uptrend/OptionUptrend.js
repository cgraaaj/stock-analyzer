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
  getOptionRank
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
    this.props.getOptionRank()
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
    this.props.resetTicker();
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

  renderData = (sessions, i) => sessions.map((data, j) => <td data-label={`Session ${sessions[j].session}`}>
    <div className="ui one column">
      <div className="row" style={{ color:"green"}}>{sessions[j].options.call[i].name}</div>
      <div className="row"style={{ color:"red"}}>{sessions[j].options.put[i].name}</div>
    </div>
  </td>
  )

  rendersRows = (sessions) => sessions[0].options.call.map((data, i) =>
    <tr>
      {this.renderData(sessions, i)}
    </tr>
  )

  handleWindowBeforeUnload = (ev) => {
    ev.preventDefault();
    ev.returnValue = "Do you want to cancel the request";
  };

  rankOptions = () => {
    return _.isEmpty(this.props.optionRankData) ? null : (
      <table class="ui celled table">
        <thead>
          <tr>
            {this.props.optionRankData.sessions.map(session => <th>Session {session.session}</th>)}
          </tr>
        </thead>
        <tbody>
          {this.rendersRows(this.props.optionRankData.sessions)}
          {/* {this.props.optionRankData.sessions.options.call.map((session, i) => <tr>
            <td data-label="Name">
              <div className="ui one column">
                <div className="row">{session.options.call[i].name}</div>
                <div className="row">{session.options.put[i].name}</div>
              </div>
            </td>
          </tr>)} */}
        </tbody>
      </table>
    );
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
            {this.rankOptions()}
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
    optionRankData: state.uptrend.optionRankData,
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
  getOptionRank
})(OptionUptrend);
