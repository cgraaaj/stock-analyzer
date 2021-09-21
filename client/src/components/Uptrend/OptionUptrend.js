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
  getOptionRank,
  unselectTicker,
  resetProgress
} from "../../actions";

class OptionUptrend extends React.Component {

  componentDidMount() {
    // this.props.resetProgress()
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
    this.onSelectTicker()
  }

  onSelectTicker = () => {
    if (!_.isEmpty(this.props.data) && this.props.selectedTicker.selected) {
      console.log(this.props.selectedTicker);
      const values = {
        mode: this.props.selectedTicker.mode,
        index: this.props.selectedTicker.index,
        expiry: this.props.expiryDates[0],
      };
      this.props.analyzeOptionChain({ ...values, data: this.props.data });
      this.props.getOptionChain(values.expiry, this.props.data);
      this.props.unselectTicker();
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
      document.getElementById("progressBar") &&
      this.props.progressBar.isLoaded
    ) {
      setTimeout(() => {
        document
          .getElementById("progressBarParent")
          .removeChild(document.getElementById("progressBar"));
        this.props.resetProgress()
      }, 1000);
    }
  }

  renderData = (sessions, i) => sessions.map((data, j) => <td key={j} data-label={`Session ${sessions[j].session}`}>
    <div className="ui one column">
      <div className="row callData" style={{ color: "green" }} >{sessions[j].options.call[i].name}</div>
      <div className="row putData" style={{ color: "red" }} >{sessions[j].options.put[i].name}</div>
    </div>
  </td>
  )

  rendersRows = (sessions) => sessions[0].options.call.map((data, i) =>
    <tr key={i}>
      {this.renderData(sessions, i)}
    </tr>
  )

  handleWindowBeforeUnload = (ev) => {
    ev.preventDefault();
    ev.returnValue = "Do you want to cancel the request";
  };

  rankOptions = () => {
    let clickCounter = 1
    return _.isEmpty(this.props.optionRankData) ? null : (
      <div className="ui segment">
        <div className="ui one column grid">
          <div class="one column centered row">
            <div className="column" >
              <div className="ui toggle checkbox">
                <input
                  type="checkbox"
                  name="rank options"
                  onClick={(e) => {
                    let el = document.getElementById("optionRankTable")
                    if (e.target.checked) {
                      el.style.display = ''
                    } else {
                      el.style.display = 'none'
                    }
                  }}
                />
                <label><text
                  style={{ cursor: "pointer" }}
                  data-tooltip="Click to toggle"
                  data-position="right center"
                  data-label="rankOptions"
                  onClick={() => {
                    let putEls = document.getElementsByClassName("putData")
                    let callEls = document.getElementsByClassName("callData")
                    if (clickCounter % 3 === 1) {
                      console.log(putEls)
                      Array.from(putEls).forEach(putEl => putEl.style.display = 'none')
                      clickCounter += 1
                      console.log(clickCounter)
                    } else if (clickCounter % 3 === 2) {
                      Array.from(callEls).forEach(callEl => callEl.style.display = 'none')
                      Array.from(putEls).forEach(putEl => putEl.style.display = '')
                      clickCounter += 1
                      console.log(clickCounter)
                    } else {
                      Array.from(callEls).forEach(callEl => callEl.style.display = '')
                      clickCounter += 1
                      console.log(clickCounter)
                    }
                  }}
                >Option's Rank</text></label>
              </div>
            </div>
          </div>
          <div className="row">
            {/* <div className="ui segment"  style={{width: "100%" }}> */}
            <table id="optionRankTable" style={{ display: 'none' }} className="ui celled table">
              <thead>
                <tr>
                  {this.props.optionRankData.sessions.map(session => <th>Session {session.session}</th>)}
                </tr>
              </thead>
              <tbody>
                {this.rendersRows(this.props.optionRankData.sessions)}
              </tbody>
            </table>
          </div>
        </div>
        {/* </div> */}
      </div>
    );
  };
  //table rows populate
  // populateRow = (options, header) => {
  //   options =
  //     header === "Call"
  //       ? options.sort((a, b) => (a.callTrendDiff > b.callTrendDiff ? -1 : 1))
  //       : options.sort((a, b) => (a.putTrendDiff > b.putTrendDiff ? -1 : 1));
  //   let greenIndex = 100 / options.length;
  //   return options.map((option, i) => (
  //     <tr
  //       style={{ backgroundColor: `rgb(0,${greenIndex * (i + 1) + 100},0)` }}
  //       key={i}
  //     >
  //       <td
  //         style={{ color: "white" }}
  //         data-tooltip={
  //           header === "Call"
  //             ? `Bullish:${option.options.calls.bullish} Bearish:${option.options.calls.bearish} `
  //             : `Bullish:${option.options.puts.bullish} Bearish:${option.options.puts.bearish}`
  //         }
  //         data-position="top center"
  //         data-label={header}
  //       >
  //         {option.name}
  //       </td>
  //     </tr>
  //   ));
  // };

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
          const selectedTicker = { mode: "EQUITY", index: option.name, selected: true };
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
        data-position="top center"
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
        <div className="ui one column grid">
          <div class="one column centered row">
            <div className="column">{header}</div>
          </div>
          <div className="row">
            {_.isEmpty(options) ? (
              <div className="ui active inverted dimmer centered inline loader">
                <div className="ui text loader">Loading</div>
              </div>
            ) : (
              <div className="ui segment" style={{ width: "100%" }}>
                <div className="ui ten column doubling grid">
                  {this.populateGridRow(options, header)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="ui segments">
        {_.isEmpty(this.props.options) ? null : this.props.progressBar.isLoaded ? (
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
        ) : null}
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
  getOptionRank,
  unselectTicker,
  resetProgress
})(OptionUptrend);
