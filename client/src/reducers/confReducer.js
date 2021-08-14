import { FETCH_DATA, CHANGE_MODE, SET_FORM_VALUES,RESET } from "../actions/types";

const INTIAL_STATE = {
  label: "Index",
  indexList: [{ key: 's', value: "", text: '--Select--' }, { key: 'n', value: "NIFTY", text: 'NIFTY' }, { key: 'bn', value: "BANKNIFTY", text: 'BANKNIFTY' }, { key: 'fn', value: "FINNIFTY", text: 'FINNIFTY' }],
  index: "indices",
  expiryDates: [],
  data: {},
  refreshedAt: "",
  formValues: {
    mode: "INDEX",
    index: "",
    expiry: ""
  }
};

const confReducer = (state = INTIAL_STATE, action) => {

  switch (action.type) {
    case FETCH_DATA:
      console.log(action.payload.data)
      let expiryDates = action.payload.data.records.expiryDates.map((expDate, i) => ({
        key: i,
        value: expDate,
        text: expDate,
      }))
      expiryDates.unshift({ key: 's', value: "", text: '--Select--' })
      return { ...state, expiryDates, data: action.payload.data.records, refreshedAt: action.payload.data.records.timestamp };
    case CHANGE_MODE:
      console.log(action.payload.mode)
      if (action.payload.mode === INTIAL_STATE.formValues.mode) {
        return INTIAL_STATE
      } else {
        let indexList = action.payload.data.map((stock, i) => ({ key: i, value: stock, text: stock }))
        indexList.unshift({ key: 's', value: "", text: '--Select--' })
        return { ...INTIAL_STATE, formValues: { ...INTIAL_STATE.formValues, mode: action.payload.mode }, label: "Stock", index: 'equities', indexList }
      }
    case SET_FORM_VALUES:
      return { ...state, formValues: { ...state.formValues, mode: action.payload.mode, index: action.payload.index, expiry: action.payload.expiry} }
    case RESET:
      return INTIAL_STATE
    default:
      return state;
  }
};

export default confReducer
