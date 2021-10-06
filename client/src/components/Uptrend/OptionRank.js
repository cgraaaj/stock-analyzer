import React from "react";
import { connect } from "react-redux"
import _ from "lodash"

import { getOptionRank } from "../../actions"
import { CHANGE_TAB } from "../../actions/types"

import { Tab, Tabs, Box, Typography } from '@mui/material';
import { CustomizedTables } from "../../utils/custMatUI"

class OptionRank extends React.Component {
    componentDidMount() {
        this.props.getOptionRank()
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

    rankOptions = () => {
        let clickCounter = 1
        let totClick = 3
        return _.isEmpty(this.props.sessions) ? null : (

            <div className="ui one column grid">
                <div className="one column centered row">
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
                                    if (clickCounter % totClick === 1) {
                                        console.log(putEls)
                                        Array.from(putEls).forEach(putEl => putEl.style.display = 'none')
                                        clickCounter += 1
                                        console.log(clickCounter)
                                    } else if (clickCounter % totClick === 2) {
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
                    <table id="optionRankTable" style={{ display: 'none' }} className="ui celled table">
                        <thead>
                            <tr>
                                {this.props.sessions.map(session => <th>Session {new Date(session.time).toLocaleTimeString()}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {this.rendersRows(this.props.sessions)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    rankTable = () => {
        return _.isEmpty(this.props.sessions) ? null : (<div className="ui one column grid">
            <div className="ui top attached tabular menu">
                <div className="active item">Call</div>
                <div className="item">Put</div>
            </div>
            <div className="ui bottom attached active tab segment">
                <table id="optionRankTable" className="ui celled table">
                    <thead>
                        <tr>
                            {this.props.sessions.map(session => <th>Session {new Date(session.time).toLocaleTimeString()}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {this.rendersRows(this.props.sessions)}
                    </tbody>
                </table>
            </div>
        </div>)
    }

    handleTabs = (e, value) => {
        this.props.onTabClick(value)
    }

    renderTabPanel = () => {
        return (<div>
            {
                !_.isEmpty(this.props.sessions) ? this.props.tabData.tab === 0 ?
                    CustomizedTables(this.props.tabData.tab, this.props.sessions) :
                    CustomizedTables(this.props.tabData.tab, this.props.sessions) :
                    null
            }
        </div>)
    }

    rankMatUI = () => {
        return <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={this.props.tabData.tab} onChange={this.handleTabs} aria-label="basic tabs example">
                    <Tab label="Call" />
                    <Tab label="Put" />
                </Tabs>
            </Box>
            {this.renderTabPanel()}
        </Box>
    }

    render() {
        // return <div className="ui segment">{this.rankOptions()}</div>
        // return <div className="ui segment">{this.rankTable()}</div>
        return this.props.sessions?<div className="ui segment">{this.rankMatUI()}</div>:null
    }
}

const mapStateToProps = (state) => {
    let sessions = state.uptrend.optionRankData.sessions
    if (!_.isEmpty(state.uptrend.optionRankData)) {
        sessions = sessions.filter(session => session.session !== '1')
    }
    return {
        sessions,
        tabData: state.uptrend.optionRankTabData
    };
};

const onTabClick = (payload) => {
    return {
        type: CHANGE_TAB,
        payload: payload
    }
}

export default connect(mapStateToProps, {
    getOptionRank, onTabClick
})(OptionRank);
