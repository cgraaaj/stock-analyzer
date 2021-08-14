import React from "react"
import { connect } from "react-redux";
class OptionChainTable extends React.Component {

  componentWillUnmount() {
    sessionStorage.removeItem("tableData");
  }

  renderData = (data, row) => {
    let headers = Object.keys(data)
    return headers.map((header, i) => <td key={i} data-label={header}>{data[header][row]}</td>)
  }

  renderRows = (data, rows) => {
    return rows.map((row, i) => <tr key={i}>{this.renderData(data, i)}</tr>)
  }

  render() {
    let headers = Object.keys(this.props.tableData)
    let rows = Object.keys(this.props.tableData[headers[0]])
    return (
      <div className="ui container">
        <div className="ui segments">
          <div className="ui segment">
            <div className="ui two column centered grid">
              <h4 style={{margin:"10px"}} >Underlying value of  {this.props.index} is {this.props.underlyingValue} as on {this.props.timeStamp}</h4>
            </div>
          </div>
          <div className="ui segment">
            <div style={{ height: "550px", overflow: "auto" }}>
              <table className="ui celled table" style={{ borderTop: "none" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 1, boxSizing: "border-box" }}>
                  <tr>
                    {headers.map((header, i) => <th key={i}>{header}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {this.renderRows(this.props.tableData, rows)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
const mapStateToProps = (state) => {
  let tableData = JSON.parse(sessionStorage.getItem('tableData'))
  console.log(tableData)
  return {
    tableData: tableData.data,
    index: tableData.index,
    underlyingValue: tableData.underlyingValue,
    timeStamp: tableData.timeStamp
  };
};

export default connect(mapStateToProps, {})(OptionChainTable);