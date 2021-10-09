import React from "react";
import { connect } from "react-redux"
import _ from "lodash"

import { getOptionRank } from "../../actions"
import { CHANGE_TAB } from "../../actions/types"

import { Tab, Tabs, Box } from '@mui/material';
import { CustomizedTables } from "../../utils/custMatUI"

class OptionRank extends React.Component {
    componentDidMount() {
        this.props.getOptionRank()
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

    renderRank = () => {
        return <Box sx={{ width: '100%' }}>
            {/* print pe ratio */}
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
        return !_.isEmpty(this.props.sessions)?<div className="ui segment">{this.renderRank()}</div>:null
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
        component: "RANK",
        payload: payload
    }
}

export default connect(mapStateToProps, {
    getOptionRank, onTabClick
})(OptionRank);
