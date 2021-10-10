import {
    SELECT_TAB_HEADER
  } from "../actions/types";
  
  const INTIAL_STATE = {
    selectedTab:0
  };
  
  const headerReducer = (state = INTIAL_STATE, action) => {
    switch (action.type) {
      case SELECT_TAB_HEADER:
        return {
          ...state,
          selectedTab:action.payload
        };
      default:
        return state;
    }
  };
  
  export default headerReducer;
  