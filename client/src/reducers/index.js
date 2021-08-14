import { combineReducers } from "redux";

import ocReducer from "./ocReducer";
import confReducer from "./confReducer";
import uptrendReducer from './uptrendReducer'
export default combineReducers({
  conf: confReducer,
  oc: ocReducer,
  uptrend: uptrendReducer
});
