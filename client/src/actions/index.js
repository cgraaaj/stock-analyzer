import history from "../history";
import { API } from "../utils/api";
import {} from '../utils/constants'
import axios from "axios";
import {
  FETCH_DATA,
  RESET_FETCH_DATA,
  CHANGE_MODE,
  ANALYZE_OPTIONS,
  SET_MODAL,
  NOTIFY,
  SET_FORM_VALUES,
  DOWNLOAD_DATA,
  GET_OPTION_CHAIN,
  UPTREND,
  CHANGE_OPTION,
  CHANGE_DATE,
  RESET,
  EQUITY_TREND,
  GET_OPTION_VALUES,
  SET_PROGRESS,
  RESET_PROGRESS,
  RESET_OPTIONTREND,
  RESET_EQUITYTREND,
  SELECTED_TICKER,
  FETCH_DATA_UPTREND,
  RESET_TICKER,
  GET_OPTION_RANK,
  UNSELECT_TICKER,
  SELECTED_EXPIRY,
  GET_EXPIRY
} from "./types";
import _ from "lodash";

export const fetchData = (page, index, symbol) => async (dispatch) => {
  let response = "";
  console.log(index, symbol);
  try {
    response = await API.get("/api/nse/option-chain", {
      params: {
        index,
        symbol,
      },
    });
    console.log(response.data);
    response = response.data;
  } catch (err) {
    console.log(err);
    response = err.response;
  }
  dispatch({
    type: page === "UPTREND" ? FETCH_DATA_UPTREND : FETCH_DATA,
    payload: { data: response },
  });
};

export const resetFetchData = () => {
  return {
    type: RESET_FETCH_DATA,
    payload: {},
  };
};

export const reset = () => {
  return {
    type: RESET,
    payload: {},
  };
};

export const changeMode = (mode) => async (dispatch) => {
  let response = "";
  if (mode !== "INDEX") {
    response = await API.get("/api/nse/equities");
    console.log(response.data);
    response = response.data;
  }
  dispatch({
    type: CHANGE_MODE,
    payload: {
      mode,
      data: response,
    },
  });
};

export const analyzeOptionChain = (data) => {
  console.log(data);
  history.push("/oc_analyze");
  return {
    type: ANALYZE_OPTIONS,
    payload: data,
  };
};

export const setModal = (modal) => {
  return {
    type: SET_MODAL,
    payload: modal,
  };
};

export const getOptionChain = (expiry, data) => async (dispatch) => {
  let response = "";
  console.log(expiry, data);
  try {
    response = await API.post(`/api/analyze/option-chain`, data, {
      params: {
        expiry,
      },
    });
    response = response.data;
    console.log(response);
  } catch (err) {
    console.log(err);
    response = err.response;
  }
  dispatch({
    type: GET_OPTION_CHAIN,
    payload: { data: response },
  });
};

export const downloadData = (index, expiry, data) => async (dispatch) => {
  let response = "";
  console.log(index, data);
  try {
    response = await API.post(`/api/analyze/download/${index}`, data, {
      params: {
        expiry,
      },
    });
    response = response.data;
    console.log(response);
  } catch (err) {
    console.log(err);
    response = err.response;
  }
  dispatch({
    type: DOWNLOAD_DATA,
    payload: { data: response },
  });
};

export const setFormValues = (formValues) => {
  return {
    type: SET_FORM_VALUES,
    payload: { ...formValues },
  };
};

export const getUptrend = () => async (dispatch) => {
  let response = "";
  try {
    response = await API.get(`/api/analyze/uptrend`);
    response = response.data;
    console.log(response);
  } catch (err) {
    console.log(err);
    // err response should be handled on server
    // response = err.response;
  }
  dispatch({
    type: UPTREND,
    payload: response,
  });
};

export const changeOption = (value) => {
  return {
    type: CHANGE_OPTION,
    payload: value,
  };
};

export const changeDate = (date) => {
  console.log(date);
  return {
    type: CHANGE_DATE,
    payload: date,
  };
};

export const checkOptionTrend = (value) => {
  return {
    type: EQUITY_TREND,
    payload: value,
  };
};

function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export const getOptionValues = (expiry) => async (dispatch) => {
  let response = "";
  try {
    let contentLength = await API.get(`/api/analyze/getContentLength`);
    response = await API.get(`/api/analyze/options`, {
      params: {
        expiry
      },
      onDownloadProgress: (progressEvent) => {
        const chunk = progressEvent.currentTarget.response;
        let res = [];
        chunk
          .split("\n")
          .forEach((obj) =>
            IsJsonString(obj) ? res.push(JSON.parse(obj)) : {}
          );
        let percentCompleted = Math.floor(
          (progressEvent.loaded / parseInt(contentLength.data)) * 100
        );
        console.log("completed: ", percentCompleted);
        dispatch({
          type: GET_OPTION_VALUES,
          payload: _.compact(res),
        });
        dispatch({
          type: SET_PROGRESS,
          payload: {
            progress: percentCompleted,
            isProgressing: true,
            isComplete: false,
            isLoaded: true
          },
        });
      },
    });
    // response = response.data
    // console.log(response)
  } catch (err) {
    console.log(err);
    response = err.response;
  }
  dispatch({
    type: SET_PROGRESS,
    payload: { progress: 100, isProgressing: false, isComplete: true,  isLoaded: true  },
  });
  console.log("Final over");
};

export const resetProgress = () => {
  return {
    type: RESET_PROGRESS,
  };
};

export const resetOptionTrend = () => {
  return {
    type: RESET_OPTIONTREND,
  };
};

export const resetEquityTrend = () => {
  return {
    type: RESET_EQUITYTREND,
  };
};

export const selectTicker = (data) => {
  return {
    type: SELECTED_TICKER,
    payload: data,
  };
};

export const unselectTicker = () => {
  return {
    type: UNSELECT_TICKER,
    payload: {}
  };
};

export const resetTicker = () => {
  return {
    type: RESET_TICKER,
  };
};

export const getExpiryDates = () => async(dispatch) => {
  let response =''
  let index = 'equities'
  let symbol = 'RELIANCE'
  try {
    response = await API.get("/api/nse/option-chain", {
      params: {
        index,
        symbol,
      },
    });
    console.log(response.data);
    response = response.data;
  } catch (err) {
    console.log(err);
    response = err.response;
  }
  dispatch({
    type:GET_EXPIRY,
    payload:{data:response}
  })
}

export const getOptionRank = () => async (dispatch) => {
  let response = "";
  try {
    response = await API.get(`/api/analyze/getOptionRank`);
    response = response.data;
    console.log(response);
  } catch (err) {
    console.log(err);
    // err response should be handled on server
    // response = err.response;
  }
  dispatch({
    type:GET_OPTION_RANK,
    payload:response
  })
  // this.getOptionValues()
}

export const selectExpiry = (expiry)=>{
  return{
    type:SELECTED_EXPIRY,
    payload:expiry
  }
}
