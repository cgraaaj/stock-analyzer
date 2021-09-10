import React from "react";
import { connect } from "react-redux";
import _ from "lodash"

import { getOptionValues } from "../../actions";

class OptionUptrend extends React.Component {

    componentDidMount() {
        this.props.getOptionValues()
    }

    populateItems = (items) => {
        return items.map((item, i) =>
            <div className="item" key={i}>
                {_.isObject(item) ? `${item.name}` : item}
            </div>
        )
    }

    populteRows = (options)=>{
        return options.map(option =>
            <tr>
                {option.callTrend? <td data-label="Call">{option.name}</td>:null}
                {option.putTrend? <td data-label="Put">{option.name}</td>:null}
            </tr>
        )
    }

    render() {
        return (<div className="ui segment">
            
            <table className="ui celled table">
                <thead>
                    <tr><th>Call</th>
                        <th>Put</th>
                    </tr></thead>
                <tbody>
                    {this.populteRows(this.props.options)}
                </tbody>
            </table>
        </div>)
    }
}

const mapStateToProps = (state) => {

    return {
        optionTrend: state.uptrend.optionTrend,
        options: state.uptrend.options.call
    }
};

export default connect(mapStateToProps, { getOptionValues })(OptionUptrend);

