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
  resetProgress,
  getExpiryDates,
  selectExpiry
} from "../../actions";

class OptionUptrend extends React.Component {

  componentDidMount() {
    // this.props.resetProgress()
    this.props.getExpiryDates();
    // if (_.isEmpty(this.props.options) && !_.isEmpty(this.props.expiryDates)) {
    //   this.props.getOptionValues(this.props.expiryDates[0]);
    // }
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
    this.onSelectTicker()
  }

  onSelectTicker = () => {
    if (!_.isEmpty(this.props.data) && this.props.selectedTicker.selected) {
      console.log(this.props.selectedTicker);
      const values = {
        mode: this.props.selectedTicker.mode,
        index: this.props.selectedTicker.index,
        expiry: this.props.selectedExpiry,
      };
      this.props.analyzeOptionChain({ ...values, data: this.props.data });
      this.props.getOptionChain(values.expiry, this.props.data);
      this.props.unselectTicker();
    }
  };

  onClickRefresh = () => {
    this.props.resetTicker();
    this.props.resetOptionTrend();
    this.props.getOptionValues(this.props.selectedExpiry);
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

  handleWindowBeforeUnload = (ev) => {
    ev.preventDefault();
    ev.returnValue = "Do you want to cancel the request";
  };

  onChangeExpiry = (e) => {
    let expiry = e.target.value
    this.props.selectExpiry(expiry)
  }

  onClickSubmit = (expiry) => {
    this.props.resetOptionTrend();
    let els = document.getElementsByClassName("optionLoader")
    Array.from(els).forEach(el => el.style.display = '')
    this.props.getOptionValues(expiry)
  }

  expiryDropdown = () => {
    return <div className="segment">
      {/* <div className="four column centered row"> */}
      <div class="ui equal width grid">
        <div className="ui three column row">
          <div className="column">
            Expiry
          </div>
          <div className="column">
            {_.isEmpty(this.props.expiryDates) ? (
              <div className="ui disabled dropdown">
                Select <i className="dropdown icon"></i>
                <div className="menu">
                  <div className="item">Choice 1</div>
                </div>
              </div>
            ) : (
              <select
                className="ui search dropdown"
                onChange={
                  // label === "Expiry"
                  // ? (e) => this.onChangeExpiry(e, input)
                  // : (e) => this.onChangeIndex(e, input)
                  (e) => this.onChangeExpiry(e)
                }
                defaultValue={_.isEmpty(this.props.selectedExpiry) ? this.props.expiryDates[0] : this.props.selectedExpiry}
              >
                {this.props.expiryDates.map((expiryDates) => (
                  <option key={expiryDates} value={expiryDates}>
                    {expiryDates}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="column">
            <button
              type="submit"
              className={!this.props.progressBar.isProgressing && (this.props.selectedExpiry !== '--Select--') ?
                "ui primary button" :
                "ui disabled button"
              }
              onClick={() => this.onClickSubmit(this.props.selectedExpiry)}
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  }
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
    let gradeOptions = options.reduce((optionsGrade, option) => {
      let headerGrade = header === 'Call' ? option.options.calls.grade : option.options.puts.grade
      let grade = (optionsGrade[headerGrade] || [])
      grade.push(option)
      optionsGrade[headerGrade] = grade
      return optionsGrade
    }, {})
    // sort by grades
    gradeOptions = Object.keys(gradeOptions).sort().reduce((obj, key) => {
      obj[key] = gradeOptions[key];
      return obj;
    }, {});
    return (
      <div className="ui segment">
        <div className="ui one column grid">
          <div className="two column equal width row">
            {/* <div classname="column">
            {header}
            </div> */}
            <div className="column">
              <div className="ui toggle checkbox">
                <input
                  type="checkbox"
                  name={`${header}PercentView`}
                  // disabled={this.props.progressBar.isProgressing ? "disabled" : ""}
                  onClick={(e) => {
                    let percentViewEl = document.getElementById(`${header}PercentView`)
                    let liquidityViewEl = document.getElementById(`${header}LiquidityView`)
                    if (e.target.checked) {
                      liquidityViewEl.style.display = 'none'
                      percentViewEl.style.display = ''
                    } else {
                      percentViewEl.style.display = 'none'
                      liquidityViewEl.style.display = ''
                    }
                  }}
                />
                <label>{header} Grade View</label>
              </div>
            </div>
          </div>
          <div className="row">
            {_.isEmpty(options) ? (
              <div className="ui active inverted dimmer centered inline loader optionLoader" style={{ display: 'none' }}>
                <div className="ui text loader">Loading</div>
              </div>
            ) : (
              <div className="ui segments" style={{ width: "100%" }}>
                <div className="ui segment" id={`${header}LiquidityView`}>
                  <div className="ui ten column doubling grid">
                    {this.populateGridRow(options, header)}
                  </div>
                </div>
                <div className="ui segment" style={{ display: 'none' }} id={`${header}PercentView`} >
                  {Object.keys(gradeOptions).map(grade => <div className="ui one column grid">
                    <div className="row"> Grade {grade}</div>
                    <div className="row">
                      <div className="ui segment" style={{ width: "100%" }}>
                        <div className="ui ten column doubling grid">
                          {this.populateGridRow(gradeOptions[grade], header)}
                        </div>
                      </div>
                    </div>
                  </div>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  renderOptions = () => {
    return <div>
      {this.populateOption(this.props.options, "Call")}
      {this.populateOption(this.props.options, "Put")}
    </div>
  }

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
            {this.expiryDropdown()}
            {this.renderOptions()}
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
    expiryDates: state.uptrend.expiryDates,
    data: state.uptrend.tickerData,
    selectedTicker: state.uptrend.selectedTicker,
    selectedExpiry: state.uptrend.selectedExpiry,
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
  resetProgress,
  getExpiryDates,
  selectExpiry
})(OptionUptrend);
