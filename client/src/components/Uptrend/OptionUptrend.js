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
  selectExpiry,
  getSectors
} from "../../actions";

import { SELECT_SECTOR, CHANGE_TAB, DROPDOWN_INPUT_CHANGE } from "../../actions/types"

import { Autocomplete, TextField, Select, MenuItem, FormControl, InputLabel, Button, LinearProgress } from "@mui/material"
import { Tab, Tabs, Box } from '@mui/material';


class OptionUptrend extends React.Component {

  componentDidMount() {
    // this.props.resetProgress()
    this.props.getExpiryDates();
    this.props.getSectors()
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
    let el = document.getElementById("mui-progress-bar")
    el.style.display = ''
    this.props.getOptionValues(expiry)
  }

  expiryDropdown = () => {
    return <div className="segment">
      {/* <div className="four column centered row"> */}
      <div class="ui one column grid">
        <div className="ui two column row">
          <div class="ui one column grid">
            <div className="ui doubling two column row">
              <div className="column">
                {_.isEmpty(this.props.expiryDates) ? (
                  <FormControl sx={{ m: 1, minWidth: 80 }} disabled>
                    <InputLabel id="demo-simple-select-label">Expiry</InputLabel>
                    <Select
                      labelId="expiry-select-label-disabled"
                      id="expiry-select-id-disabled"
                      value={this.props.selectedExpiry}
                      label="Expiry"
                      autoWidth
                      onChange={this.onChangeExpiry}
                    >{this.props.expiryDates.map((expiryDate) => <MenuItem value={expiryDate}>{expiryDate}</MenuItem>)}
                    </Select>
                  </FormControl>
                ) : (
                  <FormControl sx={{ m: 1, minWidth: 80 }}>
                    <InputLabel id="demo-simple-select-label">Expiry</InputLabel>
                    <Select
                      labelId="expiry-select-label"
                      id="expiry-select-id"
                      value={this.props.selectedExpiry}
                      label="Expiry"
                      autoWidth
                      onChange={this.onChangeExpiry}
                    >{this.props.expiryDates.map((expiryDate) => <MenuItem value={expiryDate}>{expiryDate}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              </div>
              <div className="column">
                <Button
                  disabled={!(!this.props.progressBar.isProgressing && (this.props.selectedExpiry !== '--Select--'))}
                  variant="contained"
                  onClick={() => this.onClickSubmit(this.props.selectedExpiry)}
                >
                  Go
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  }

  populateGridRow = (options, header) => {
    options = options.filter((option) =>
      header === "Call" ? option.callTrend : option.putTrend
    );
    options =
      header === "Call"
        ? options.sort((a, b) => b.callTrendDiff - a.callTrendDiff)
        : options.sort((a, b) => b.putTrendDiff - a.putTrendDiff);
    let greenIndex = 100 / options.length;
    return options.map((option, i) => {
      let bullbearData = header === "Call"
        ? { bullish: option.options.calls.bullish, bearish: option.options.calls.bearish }
        : { bullish: option.options.puts.bullish, bearish: option.options.puts.bearish }
      return (
        <div
          onClick={() => {
            this.props.resetTicker();
            this.props.fetchData("UPTREND", "equities", option.name);
            const selectedTicker = { mode: "EQUITY", index: option.name, selected: true };
            this.props.selectTicker(selectedTicker);
          }}
          style={{
            // outline: bullbearData.bearish === 0? "1px solid #2185D0":null,
            // outlineOffset: bullbearData.bearish === 0?"-1px":null,
            // color: bullbearData.bearish === 0?"orange":"white",
            color: "white",
            backgroundColor: `rgb(0,${greenIndex * (i + 1) + 100},0)`,
            cursor: "pointer",
          }}
          key={i}
          data-tooltip={
            `Bullish:${bullbearData.bullish} Bearish:${bullbearData.bearish} `
          }
          data-position="top center"
          data-label={header}
          className="column"
        >
          <div className="row">{option.name}</div>
          <div className="row">value%</div>
        </div>)
    });
  };

  populateOption = (options, header) => {
    // sector filter
    if (!_.isEmpty(this.props.selectedSector)) {
      const selectedSector = header === "Call" ? this.props.selectedSector.call : this.props.selectedSector.put
      console.log(selectedSector)
      options = !_.isEmpty(selectedSector.value) ?
        options.filter(option => selectedSector.value.includes(option.name)) : options
    }
    // grade grouping
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
          <div className="doubling two column row">
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
            <div className="column">
              <Autocomplete
                options={this.props.sectors}
                isOptionEqualToValue={(option, value) => option.label === value.label}
                inputValue={this.props.tabData.tab === 0 ? this.props.selectedSector.call.input : this.props.selectedSector.put.input}
                onInputChange={(event, newInputValue) => {
                  console.log(newInputValue)
                  this.props.onDDInputChange(header, newInputValue)
                }}
                value={this.props.tabData.tab === 0 ? this.props.selectedSector.call : this.props.selectedSector.put}
                onChange={(event, newValue) => {
                  if (!_.isEmpty(newValue)) {
                    this.props.onSelectSector(header, newValue)
                  } else {
                    this.props.onSelectSector(header, { label: '', value: [] })
                  }
                }}
                id={header}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Sectors" />}
              />
            </div>
          </div>
          <div className="row">
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
          </div>
        </div>
      </div>
    );
  };

  handleTabs = (e, value) => {
    this.props.onTabClick(value)
  }

  renderTabPanel = () => {
    let el = document.getElementById("mui-progress-bar")
    el.style.display = 'none'
    return (<div>
      {
        this.props.tabData.tab === 0 ?
          this.populateOption(this.props.options, "Call") :
          this.populateOption(this.props.options, "Put")
      }
    </div>)
  }

  renderOptions = () => {
    return <Box sx={{ width: '100%' }}>
      {/* print pe ratio */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={this.props.tabData.tab} onChange={this.handleTabs} aria-label="basic tabs example" >
          <Tab label="Call" disabled ={_.isEmpty(this.props.options)}/>
          <Tab label="Put" disabled ={_.isEmpty(this.props.options)}/>
        </Tabs>
      </Box>
      {!_.isEmpty(this.props.options)
        ? this.renderTabPanel()
        : null}
        <LinearProgress id="mui-progress-bar" style={{ display: 'none' }} />
    </Box>

    // return <div>
    //   {this.populateOption(this.props.options, "Call")}
    //   {this.populateOption(this.props.options, "Put")}
    // </div>
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

const onSelectSector = (tab, payload) => {
  return {
    type: SELECT_SECTOR,
    tab,
    payload
  }
}

const onDDInputChange = (tab, payload) => {
  return {
    type: DROPDOWN_INPUT_CHANGE,
    tab,
    payload
  }
}

const onTabClick = (payload) => {
  return {
    type: CHANGE_TAB,
    component: "UPTREND",
    payload
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
    sectors: state.uptrend.sectors,
    selectedSector: state.uptrend.selectedSector,
    tabData: state.uptrend.optionUptrendTabData,
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
  selectExpiry,
  getSectors,
  onSelectSector,
  onTabClick,
  onDDInputChange
})(OptionUptrend);
