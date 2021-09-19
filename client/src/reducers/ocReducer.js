import {
  FETCH_DATA,
  ANALYZE_OPTIONS,
  SET_MODAL,
  GET_OPTION_CHAIN,
} from "../actions/types";

const INTIAL_STATE = {
  timeStamp: "",
  underlyingValue: 0,
  expiryDates: [],
  OCData: {},
  OIData: [],
  COIData: [],
  strikePrices: [],
  selectedMode: "",
  selectedIndex: "",
  selectedExpiry: "",
  OCTable: {},
  modal: {
    flag: false,
    data: [],
  },
};

const ocReducer = (state = INTIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_DATA:
      return { ...state, OCData: action.payload.data.records };
    case ANALYZE_OPTIONS:
      let filterData = action.payload.data.data.filter(
        (d) => d.expiryDate === action.payload.expiry
      );
      let OIData = filterData.map((d) => {
        let OI = {};
        OI["strikePrice"] = d.strikePrice;
        if (d.hasOwnProperty("CE")) {
          OI["CE"] = d.CE.openInterest;
        } else {
          OI["CE"] = 0;
        }
        if (d.hasOwnProperty("PE")) {
          OI["PE"] = d.PE.openInterest;
        } else {
          OI["PE"] = 0;
        }
        return OI;
      });
      let COIData = filterData.map((d) => {
        let COI = {};
        COI["strikePrice"] = d.strikePrice;
        if (d.hasOwnProperty("CE")) {
          COI["CE"] = d.CE.changeinOpenInterest;
        } else {
          COI["CE"] = 0;
        }
        if (d.hasOwnProperty("PE")) {
          COI["PE"] = d.PE.changeinOpenInterest;
        } else {
          COI["PE"] = 0;
        }
        return COI;
      });
      return {
        ...state,
        timeStamp: action.payload.data.timestamp,
        underlyingValue: action.payload.data.underlyingValue,
        expiryDates: action.payload.data.expiryDates,
        OIData,
        COIData,
        strikePrices: action.payload.data.strikePrices,
        selectedMode: action.payload.mode,
        selectedExpiry: action.payload.expiry,
        selectedIndex: action.payload.index,
      };
    case SET_MODAL:
      return {
        ...state,
        modal: action.payload,
      };
    case GET_OPTION_CHAIN:
      console.log(action.payload);
      return {
        ...state,
        OCTable: action.payload.data,
      };
    default:
      return state;
  }
};

export default ocReducer;
