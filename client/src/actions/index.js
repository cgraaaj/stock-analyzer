import history from "../history";
import jwtDecode from 'jwt-decode';
import { API } from "../utils/api";
import { } from '../utils/constants'

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
  GET_EXPIRY,
  SIGN_IN,
  SIGN_OUT,
  GET_SECTORS
} from "./types";
import _, { method } from "lodash";

const onError = (dispatch,err)=>{
  console.log(err)
  if(err.response){
  console.log(err.response.data)
  if (err.response.status === 401) {
    dispatch({
      type: SIGN_OUT,
      payload: {}
    })
    history.push('/login')
  }
}
}

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
    dispatch({
      type: page === "UPTREND" ? FETCH_DATA_UPTREND : FETCH_DATA,
      payload: { data: response },
    });
  } catch (err) {
    onError(dispatch,err)
  }
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
    try {
      response = await API.get("/api/nse/equities");
      console.log(response.data);
      response = response.data;
      dispatch({
        type: CHANGE_MODE,
        payload: {
          mode,
          data: response,
        },
      });
    } catch (err) {
      onError(dispatch,err)
    }
  }
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
    dispatch({
      type: GET_OPTION_CHAIN,
      payload: { data: response },
    });
  } catch (err) {
    onError(dispatch,err)
  }
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
    dispatch({
      type: DOWNLOAD_DATA,
      payload: { data: response },
    });
  } catch (err) {
    onError(dispatch,err)
  }
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
    dispatch({
      type: UPTREND,
      payload: response,
    });
  } catch (err) {
    onError(dispatch,err)
  }
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
    dispatch({
      type: SET_PROGRESS,
      payload: { progress: 100, isProgressing: false, isComplete: true, isLoaded: true },
    });
    console.log("Final over");
  } catch (err) {
    onError(dispatch,err)
  }
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

export const getExpiryDates = () => async (dispatch) => {
  let response = ''
  try {
    response = await API.get("/api/nse/getOptionExpiries");
    console.log(response.data);
    response = response.data;
    dispatch({
      type: GET_EXPIRY,
      payload: { data: response }
    })
  } catch (err) {
    onError(dispatch,err)
  }
}

export const getOptionRank = () => async (dispatch) => {
  let response = "";
  try {
    response = await API.get(`/api/analyze/getOptionRank`);
    response = response.data;
    console.log(response);
    dispatch({
      type: GET_OPTION_RANK,
      payload: response
    })
  } catch (err) {
    console.log(err)
    onError(dispatch,err)
  }
  // this.getOptionValues()
}

export const selectExpiry = (expiry) => {
  return {
    type: SELECTED_EXPIRY,
    payload: expiry
  }
}

export const signIn = (credentials) => async (dispatch) => {
  let response = "";
  try {
    response = await API.post("/api/login", {
      username: credentials.username,
      password: credentials.password
    });
    console.log(response.data)
    const accessToken = response.data.access_token
    //get user details from user api
    const {username,is_admin} = jwtDecode(accessToken)
    const payload={
      username,
      isAdmin:is_admin
    }
    dispatch({
      type: SIGN_IN,
      payload
    })
    history.push('/')
  }
  catch (err) {
    onError(dispatch,err)
  }
}

export const signOut = () => async (dispatch) => {
  let response = ""
  try {
    response = await API.post("/api/logout");
    console.log(response)
    dispatch({
      type: SIGN_OUT,
      payload: {}
    })
  }
  catch (err) {
    console.log(err)
  }
}

export const getSectors = () => async (dispatch) => {
  try {
    const response = await API.get("/api/analyze/getSectors")
    console.log(response)
    dispatch({
      type: GET_SECTORS,
      payload: {data:response.data}
    })
  }
  catch (err) {
    console.log(err)
  }
}
