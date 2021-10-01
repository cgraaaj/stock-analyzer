import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import fileDownload from "js-file-download";

import { setModal } from "../../actions";
import Chart from "../BarCharts/Chart";
import Modal from "../Modal";
import axios from "axios";
import { API } from "../../utils/api";

class OptionChain extends React.Component {
  renderChart = (data) => {
    return (
      <div
        style={{
          paddingBottom: "56.25%" /* 16:9 */,
          position: "relative",
          height: 0,
        }}
        onClick={this.onClickChart(data)}
      >
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
          }}
        >
          <Chart chartData={data} />
        </div>
      </div>
    );
  };

  renderTable = () => {
    let OCTableData = {};
    OCTableData["index"] = this.props.index;
    OCTableData["underlyingValue"] = this.props.underlyingValue;
    OCTableData["timeStamp"] = this.props.timeStamp;
    OCTableData["data"] = this.props.OCTable;
    console.log(OCTableData);
    sessionStorage.setItem("tableData", JSON.stringify(OCTableData));
    // let subDomain = /:\/\/([^\/]+)/.exec(window.location.href)[0];
    // console.log(window.location.pathname)
    window.open(`/stock-analyzer/option_chain_table`, "_blank");
  };

  onClickChart = (data) => (e) => {
    const modal = {
      flag: !this.props.modalFlag,
      data,
    };
    this.props.setModal(modal);
  };

  // have to move to actions/reducers
  downloadData = async (index, data) => {
    let response = "";
    try {
      response = await API.post(`/api/analyze/download/${index}`, data, {
        params: { expiry: this.props.selectedExpiry },
        responseType: "blob",
      });
      response = response.data;
      console.log(response);
      fileDownload(response, `${index}.xlsx`);
    } catch (err) {
      console.log(err);
      response = err.response;
    }
  };

  render() {
    return (
      <div>
        {_.isEmpty(this.props.OIData) && _.isEmpty(this.props.COIData) ? (
          <div className="ui two column centered grid">
            <h3>
              Please Choose the Stock/Index and Expiry Date for Option Chain
              Analysis
            </h3>
          </div>
        ) : (
          <div className="ui segments">
            <div className="ui segment">
              <div className="ui two column centered grid">
                <h4 style={{ margin: "10px" }}>
                  Underlying value of {this.props.index} is{" "}
                  {this.props.underlyingValue} as on {this.props.timeStamp}
                </h4>
                <div
                  data-tooltip="Trading View ideas"
                  data-position="right center"
                >
                  <svg
                    onClick={() => {
                      window.open(
                        `https://in.tradingview.com/ideas/${this.props.index.toLowerCase()}/?sort=recent`
                      );
                    }}
                    style={{ paddingTop: "15%", cursor: "pointer" }}
                    width="56"
                    height="40"
                    viewBox="0 0 56 40"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 22H7V11H0V4h14v18zM28 22h-8l7.5-18h8L28 22z"
                      fill="currentColor"
                    ></path>
                    <circle cx="20" cy="8" r="4" fill="currentColor"></circle>
                  </svg>
                </div>
              </div>
              <div className="ui two column centered grid">
              <h5 style={{ margin: "10px" , fontStyle:"italic"}}>
                  Currently Viewing {this.props.selectedExpiry} Expiry
                </h5>
                </div>
            </div>
            <div className="ui segment">
              {/* <div className="ui equal width grid">
                <div className="equal width row">
                  <div className="ui two column centered grid">
                    StrikePrice vs OI
                  </div>
                  <div className="ui two column centered grid">
                    StrikePrice vs CiOI
                  </div>
                </div>
                <div className="equal width row">
                  <div
                    className="column"
                    data-tooltip="Click To Enlarge"
                    data-position="top left"
                  >
                    {this.renderChart(this.props.OIData)}
                  </div>
                  <div
                    className="column"
                    data-tooltip="Click To Enlarge"
                    data-position="top right"
                  >
                    {this.renderChart(this.props.COIData)}
                  </div>
                </div>
              </div> */}
              <div className="ui two column doubling grid">
                <div className="column">
                  <div className="row">
                    <div className="ui one column centered grid">
                      <div className="row">StrikePrice vs OI</div>
                    </div>
                  </div>
                  <div
                    className="row"
                    data-tooltip="Click To Enlarge"
                    data-position="top left"
                  >
                    {this.renderChart(this.props.OIData)}
                  </div>
                </div>
                <div className="column">
                  <div className="row">
                    <div className="ui one column centered grid">
                      <div className="row">StrikePrice vs CiOI</div>
                    </div>
                  </div>
                  <div
                    className="row"
                    data-tooltip="Click To Enlarge"
                    data-position="top right"
                  >
                    {this.renderChart(this.props.COIData)}
                  </div>
                </div>
              </div>
            </div>
            <div className="ui segment">
              <div className="ui two column centered grid">
                <div className="right aligned column">
                  <button
                    type="button"
                    className="ui primary button"
                    onClick={() => {
                      this.renderTable();
                    }}
                  >
                    <i className="external alternate icon"></i>View Option Chain
                    data
                  </button>
                </div>
                <div className="column">
                  <button
                    type="button"
                    className="ui primary button"
                    onClick={() =>
                      this.downloadData(
                        this.props.selectedIndex,
                        this.props.OCData
                      )
                    }
                  >
                    <i className="save icon"></i>Save Option Chain data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {this.props.modal.flag && this.props.modal.data ? (
          <Modal
            data={this.props.modal.data}
            onDismiss={() => {
              this.props.setModal({
                flag: !this.props.modal.flag,
                data: [],
              });
            }}
          />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    underlyingValue: state.oc.underlyingValue,
    timeStamp: state.oc.timeStamp,
    index: state.oc.selectedIndex,
    OCData: state.oc.OCData,
    OIData: state.oc.OIData,
    COIData: state.oc.COIData,
    modal: state.oc.modal,
    selectedIndex: state.oc.selectedIndex,
    selectedExpiry: state.oc.selectedExpiry,
    OCTable: state.oc.OCTable,
  };
};

export default connect(mapStateToProps, { setModal })(OptionChain);
