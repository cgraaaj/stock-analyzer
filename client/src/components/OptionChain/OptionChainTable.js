import React from "react";
import { connect } from "react-redux";
class OptionChainTable extends React.Component {
  componentWillUnmount() {
    sessionStorage.removeItem("tableData");
  }

  renderData = (rowData) => {
    let headers = Object.keys(rowData);
    return headers.map((header, i) => (
      <td key={i} data-label={header}>
        {rowData[header]}
      </td>
    ));
  };

  renderRows = (data) => {
    return data.map((row, i) => <tr key={i}>{this.renderData(row)}</tr>);
  };

  render() {
    let headers = Object.keys(this.props.tableData[0]);
    return (
      <div style={{ marginTop: "10px"}}>
        <div className="ui segments">
          <div className="ui segment">
            <div className="ui two column centered grid">
              <h4 style={{ margin: "10px" }}>
                Underlying value of {this.props.index} is{" "}
                {this.props.underlyingValue} as on {this.props.timeStamp}
              </h4>
            </div>
            <div className="ui two column centered grid">
              <h5 style={{ margin: "10px" , fontStyle:"italic"}}>
                  Currently Viewing {this.props.selectedExpiry} Expiry
                </h5>
                </div>
          </div>
          <div className="ui segment">
            <div style={{ height: "550px", overflow: "auto" }}>
              <table className="ui celled table" style={{ borderTop: "none" }}>
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    boxSizing: "border-box",
                  }}
                >
                  <tr>
                    {headers.map((header, i) => (
                      <th key={i}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>{this.renderRows(this.props.tableData)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  let tableData = JSON.parse(sessionStorage.getItem("tableData"));
  console.log(tableData);
  return {
    tableData: tableData.data,
    index: tableData.index,
    underlyingValue: tableData.underlyingValue,
    timeStamp: tableData.timeStamp,
    selectedExpiry: tableData.selectedExpiry,
  };
};

export default connect(mapStateToProps, {})(OptionChainTable);
