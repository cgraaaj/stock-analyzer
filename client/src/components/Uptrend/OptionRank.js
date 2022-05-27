import React from "react";
import { connect } from "react-redux"
import _ from "lodash"

import { getOptionRank } from "../../actions"
import { CHANGE_TAB, SELECT_PERIOD } from "../../actions/types"

import { Tab, Tabs, Box, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel } from '@mui/material';
import { CustomizedTables } from "../../utils/custMatUI"

class OptionRank extends React.Component {
    componentDidMount() {
        // if(_.isEmpty(this.props.sessions)){
        if (this.props.isManual) {
            this.props.getOptionRank()
        }
        // }
    }

    handleTabs = (e, value) => {
        this.props.onTabClick(value)
    }

    renderTabPanel = () => {
        return (<div>
            {
                !_.isEmpty(this.props.sessions) ? this.props.tabData.tab === 0 ?
                    CustomizedTables(this.props.tabData.tab, this.props.sessions[this.props.selectedPeriod]) :
                    CustomizedTables(this.props.tabData.tab, this.props.sessions[this.props.selectedPeriod]) :
                    null
            }
        </div>)
    }

    renderRank = () => {

        return <Box sx={{ width: '100%' }}>
            {/* print pe ratio */}
            <FormControl component="fieldset">
                <FormLabel component="legend">Period</FormLabel>
                <RadioGroup row aria-label="period" name="row-radio-buttons-group"
                    value={this.props.selectedPeriod}
                    onChange={(e) => this.props.onSelectPeriod(e.target.value)}
                >
                    <FormControlLabel value="5min" disabled control={<Radio />} label="5 min" />
                    <FormControlLabel value="15min" disabled={this.props.sessions ? _.isEmpty(this.props.sessions['15min']) : true} control={<Radio />} label="15 min" />
                    <FormControlLabel value="30min" disabled={this.props.sessions ? _.isEmpty(this.props.sessions['30min']) : true} control={<Radio />} label="30 min" />
                    <FormControlLabel value="60min" disabled={this.props.sessions ? _.isEmpty(this.props.sessions['60min']) : true} control={<Radio />} label="1 hr" />
                </RadioGroup>
            </FormControl>
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
        // return !_.isEmpty(this.props.sessions) ? <div className="ui segment">{this.renderRank()}</div> : null
        return <div className="ui segment">{this.renderRank()}</div>
    }
}

const mapStateToProps = (state) => {
    // let sessions = state.uptrend.optionRankData.sessions
    // console.log(state.uptrend.selectedPeriod)
    return {
        isManual: state.uptrend.isFetchManual,
        sessions: state.uptrend.isFetchManual ? state.uptrend.optionRankData.sessions : state.websocket.optionsRank.data.sessions,
        selectedPeriod: state.uptrend.selectedPeriod,
        tabData: state.uptrend.optionRankTabData
    };
};

const onTabClick = (payload) => {
    return {
        type: CHANGE_TAB,
        component: "RANK",
        payload
    }
}

const onSelectPeriod = (payload) => {
    return {
        type: SELECT_PERIOD,
        payload
    }
}

export default connect(mapStateToProps, {
    getOptionRank, onTabClick, onSelectPeriod
})(OptionRank);
