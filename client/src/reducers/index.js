import { combineReducers } from "redux";

import ocReducer from "./ocReducer";
import confReducer from "./confReducer";
import uptrendReducer from "./uptrendReducer";
import authReducer from "./authReducer";
import headerReducer from "./headerReducer";
import websocketReducer from "./websocketReducer";

export default combineReducers({
  conf: confReducer,
  oc: ocReducer,
  uptrend: uptrendReducer,
  auth: authReducer,
  header: headerReducer,
  websocket:websocketReducer
});
