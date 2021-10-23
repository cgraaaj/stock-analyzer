import { SIGN_IN, SIGN_OUT } from "../actions/types";

const INTIAL_STATE = {
  isSignedIn: JSON.parse(localStorage.getItem('user')) ? JSON.parse(localStorage.getItem('user'))['isSignedIn'] : null,
  public_id: null,
  username: JSON.parse(localStorage.getItem('user')) ? JSON.parse(localStorage.getItem('user'))['username'] : null,
  email: null,
  isAdmin: JSON.parse(localStorage.getItem('user')) ? JSON.parse(localStorage.getItem('user'))['isAdmin'] : null
};

const authReducer = (state = INTIAL_STATE, action) => {
  switch (action.type) {
    case SIGN_IN:
      // console.log(action.payload); 
      console.log(action.payload)
      const user = { username: action.payload.username, isAdmin: action.payload.isAdmin, isSignedIn: true }
      localStorage.setItem('user', JSON.stringify(user))
      return { ...state, isSignedIn: true, ...action.payload };
    case SIGN_OUT:
      localStorage.clear()
      return {
        ...INTIAL_STATE, isSignedIn: false
      };
    default:
      return state;
  }
};

export default authReducer