import { WS_OPTION_RANK, WS_OPTION_TREND, WS_OPTION_DATA,SET_WS } from "../actions/types";

const INTIAL_STATE = {
  ws:{},
  optionsTrend: { lastUpdated: '', timeTaken: '', data: {} },
  optionsRank: {data:{sessions:[]}}
};

const websocketReducer = (state = INTIAL_STATE, action) => {
  switch (action.type) {
    case WS_OPTION_TREND:
      let data = action.payload.data
      let lastUpdated= action.payload.last_updated
      let timeTaken= action.payload.time_taken
      data = data.map((option) => {
        let callTrendDiff =
          option.options.calls.bullish - option.options.calls.bearish;
        let putTrendDiff =
          option.options.puts.bullish - option.options.puts.bearish;
        return { ...option, callTrendDiff, putTrendDiff };
      });
      return { ...state, optionsTrend: { ...action.payload,lastUpdated,timeTaken, data } }
    case WS_OPTION_RANK:
      return { ...state, optionsRank: { ...action.payload } };
    case SET_WS:
      return{
        ...state,ws: action.payload
      }
    default:
      return state;
  }
};

export default websocketReducer