import {
  UPTREND,
  CHANGE_OPTION,
  CHANGE_DATE,
  EQUITY_TREND,
  GET_OPTION_VALUES,
  SET_PROGRESS,
  RESET_OPTIONTREND,
  RESET_EQUITYTREND,
  SELECTED_TICKER,
  FETCH_DATA_UPTREND,
  RESET_TICKER,
  GET_OPTION_RANK,
  UNSELECT_TICKER,
  RESET_PROGRESS
} from "../actions/types";
import _ from "lodash";

const INTIAL_STATE = {
  data: [],
  dates: [],
  selectedDate: {},
  option: "nifty",
  uptrend: undefined,
  uptrendWithVolume: undefined,
  equityTrend: false,
  options: [],
  progressBar: { progress: 0, isProgressing: false, isComplete: false, isLoaded:true },
  selectedTicker: {},
  tickerData: {},
  optionRankData: []
};

const setUptrendData = (data, dateObj, option) => {
  console.log(data, dateObj, option);
  let selectedDateData = data.filter((data) => data.date === dateObj.value)[0];
  console.log(selectedDateData);
  let uptrend = [];
  let uptrendWithVolume = [];
  uptrend = selectedDateData[option]["uptrend"];
  uptrendWithVolume = selectedDateData[option]["vol_based"];
  return { uptrend, uptrendWithVolume };
};

const uptrendReducer = (state = INTIAL_STATE, action) => {
  switch (action.type) {
    case UPTREND:
      console.log(action.payload);
      let dates = action.payload.map((dateObj, i) => ({
        key: i,
        value: dateObj.date,
        text: dateObj.date,
      }));
      let selectedDate = dates[0];
      return { ...state, data: action.payload, dates, selectedDate };
    case CHANGE_OPTION: {
      let { uptrend, uptrendWithVolume } = setUptrendData(
        state.data,
        state.selectedDate,
        action.payload
      );
      return { ...state, option: action.payload, uptrend, uptrendWithVolume };
    }
    case CHANGE_DATE: {
      let { uptrend, uptrendWithVolume } = setUptrendData(
        state.data,
        !_.isObject(action.payload)
          ? { key: 0, value: action.payload, text: action.payload }
          : action.payload,
        state.option
      );
      return {
        ...state,
        selectedDate: !_.isObject(action.payload)
          ? { key: 0, value: action.payload, text: action.payload }
          : action.payload,
        uptrend,
        uptrendWithVolume,
      };
    }
    case EQUITY_TREND: {
      return { ...state, equityTrend: action.payload };
    }
    case GET_OPTION_VALUES:
      let options = action.payload.map((option) => {
        let callTrendDiff =
          option.options.calls.bullish - option.options.calls.bearish;
        let putTrendDiff =
          option.options.puts.bullish - option.options.puts.bearish;
        return { ...option, callTrendDiff, putTrendDiff };
      });
      return { ...state, options };
    case SET_PROGRESS:
      return { ...state, progressBar: action.payload };
    case RESET_PROGRESS:
      return { ...state, progressBar:  {...state.progressBar, isLoaded:false}};
    case RESET_OPTIONTREND:
      return {
        ...state,
        options: INTIAL_STATE.options,
        progressBar: INTIAL_STATE.progressBar,
      };
    case RESET_EQUITYTREND:
      return {
        ...state,
        data: INTIAL_STATE.data,
        dates: INTIAL_STATE.dates,
        selectedDate: INTIAL_STATE.selectedDate,
        option: INTIAL_STATE.option,
        uptrend: INTIAL_STATE.uptrend,
        uptrendWithVolume: INTIAL_STATE.uptrendWithVolume,
      };
    case SELECTED_TICKER:
      return { ...state, selectedTicker: action.payload };
    case UNSELECT_TICKER:
      return { ...state, selectedTicker: {...state.selectedTicker, selected:false} };
    case FETCH_DATA_UPTREND:
      return {
        ...state,
        tickerData: action.payload.data.records,
        refreshedAt: action.payload.data.records.timestamp,
      };
    case RESET_TICKER:
      return {
        ...state,
        tickerData: INTIAL_STATE.tickerData,
        selectedTicker: INTIAL_STATE.selectedTicker,
      };
    case GET_OPTION_RANK:
      let optionRankData = action.payload[0]
      return {
        ...state,
        optionRankData
      }
    default:
      return state;
  }
};

export default uptrendReducer;
