import { SIGN_IN, SIGN_OUT } from "../actions/types";

const INTIAL_STATE = {
  isSignedIn: localStorage.getItem('isSignedIn'),
  public_id: null,
  username: null,
  email: null
};

const authReducer = (state = INTIAL_STATE, action) => {
  switch (action.type) {
    case SIGN_IN:
      // console.log(action.payload); 
      localStorage.setItem('isSignedIn',true)
      return { ...state, isSignedIn: true, ...action.payload };
    case SIGN_OUT:
      localStorage.clear()
      return {
        ...INTIAL_STATE,isSignedIn:false
      };
    default:
      return state;
  }
};

export default authReducer