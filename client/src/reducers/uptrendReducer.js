import { UPTREND, CHANGE_OPTION, CHANGE_DATE, EQUITY_TREND, GET_OPTION_VALUES, SET_PROGRESS } from "../actions/types";
import _ from 'lodash'

const INTIAL_STATE = {
    data: [],
    dates: [],
    selectedDate: {},
    option: "nifty",
    uptrend: undefined,
    uptrendWithVolume: undefined,
    equityTrend: false,
    options: [],
    progressBar: { progress: 0, isProgressing: false, isComplete: false }
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
        case EQUITY_TREND: {
            return { ...state, equityTrend: action.payload }
        }
        case GET_OPTION_VALUES:
            let options = action.payload.map(option => {
                let callTrendDiff = option.options.calls.bullish - option.options.calls.bearish
                let putTrendDiff = option.options.puts.bullish - option.options.puts.bearish
                return { ...option, callTrendDiff, putTrendDiff }
            })
            return { ...state, options }
        case SET_PROGRESS:
            return { ...state, progressBar: action.payload }
        default:
            return state
    }

}

export default uptrendReducer