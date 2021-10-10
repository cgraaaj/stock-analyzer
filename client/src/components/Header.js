import React from "react";
import { NavLink } from "react-router-dom";
import { signOut } from "../actions"
import { connect } from "react-redux";

class Header extends React.Component {
  render() {
    console.log(window.location.pathname)
    return (
      window.location.pathname === '/stock-analyzer/option_chain_table' ? null :
        <div className="ui secondary  menu">
          <NavLink
            exact={true}
            activeClassName="is-active"
            to={`/`}
            className="item"
          >
            Home
          </NavLink>
          <NavLink
            activeClassName="is-active"
            to={`/oc_analyze`}
            className="item"
          >
            Option Chain
          </NavLink>
          <NavLink activeClassName="is-active" to={`/trend`} className="item">
            Trend
          </NavLink>
          <div className="right menu">
            <button className="ui button" onClick={() => {
              this.props.signOut()
            }}>
              Sign Out
            </button>
          </div>
        </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    ...state
  };
};

export default connect(mapStateToProps, {
  signOut
})(Header);

