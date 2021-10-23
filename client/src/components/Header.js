import React from "react";
import { NavLink } from "react-router-dom";
import { signOut } from "../actions"
import { connect } from "react-redux";

class Header extends React.Component {
  render() {
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
          <NavLink activeClassName="is-active" to={`/option_trend`} className="item">
            Option Trend
          </NavLink>
          <NavLink activeClassName="is-active" to={`/equity_trend`} className="item">
            Equity Trend
          </NavLink>
          <div className="right menu">
            <div className="item">
              <text>{`Hey, ${this.props.user.username}`}</text>
            </div>
            <div className="item">
              <button className="ui button" onClick={() => {
                this.props.signOut()
              }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.auth
  };
};

export default connect(mapStateToProps, {
  signOut
})(Header);

