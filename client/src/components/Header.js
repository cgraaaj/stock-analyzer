import React from "react";
import { NavLink } from "react-router-dom";


class Header extends React.Component {
  render() {
    return (
      <div className="ui secondary  menu">
        <NavLink exact={true} activeClassName='is-active' to={`/`} className="item">
          Home
        </NavLink>
        <NavLink activeClassName='is-active' to={`/oc_analyze`} className="item">
          Option Chain
        </NavLink>
        <NavLink activeClassName='is-active' to={`/uptrend`} className="item">
          Uptrend
        </NavLink>
      </div>
    );
  }
}

export default Header;
