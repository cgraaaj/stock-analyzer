import { UPTREND, CHANGE_OPTION, CHANGE_DATE, OPTION_TREND, GET_OPTION_VALUES } from "../actions/types";
import _ from 'lodash'

const INTIAL_STATE = {
    data: [],
    dates: [],
    selectedDate: {},
    option: "nifty",
    uptrend: undefined,
    uptrendWithVolume: undefined,
    optionTrend: false,
    options: {call:[],put:[]}
};

const setUptrendData = (data, dateObj, option) => {
    console.log(data, dateObj, option)
    let selectedDateData = data.filter(data => data.date === dateObj.value)[0]
    console.log(selectedDateData)
    let uptrend = []
    let uptrendWithVolume = []
    uptrend = selectedDateData[option]['uptrend']
    uptrendWithVolume = selectedDateData[option]['vol_based']
    return { uptrend, uptrendWithVolume }
}

const uptrendReducer = (state = INTIAL_STATE, action) => {
    switch (action.type) {
        case UPTREND:
            console.log(action.payload)
            let dates = action.payload.map((dateObj, i) => ({ key: i, value: dateObj.date, text: dateObj.date }))
            let selectedDate = dates[0]
            return { ...state, data: action.payload, dates, selectedDate }
        case CHANGE_OPTION: {
            let { uptrend, uptrendWithVolume } = setUptrendData(state.data, state.selectedDate, action.payload)
            return { ...state, option: action.payload, uptrend, uptrendWithVolume }
        }
        case CHANGE_DATE: {
            let { uptrend, uptrendWithVolume } = setUptrendData(state.data, !_.isObject(action.payload) ? { key: 0, value: action.payload, text: action.payload } : action.payload, state.option)
            return { ...state, selectedDate: !_.isObject(action.payload) ? { key: 0, value: action.payload, text: action.payload } : action.payload, uptrend, uptrendWithVolume }
        }
        case OPTION_TREND: {
            return { ...state, optionTrend: action.payload }
        }
        case GET_OPTION_VALUES: 
            let call = action.payload.filter(option=>option.callTrend)
            console.log(call.length)
            let put = action.payload.filter(option=>option.putTrend)
            console.log(put.length)
            return { ...state, options:{call,put}}
        default:
            return state
    }

}

export default uptrendReducer