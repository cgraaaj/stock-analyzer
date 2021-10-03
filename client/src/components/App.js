import React from "react";
import { Router, Route } from "react-router-dom";

import Home from "./Home";
import OptionChain from "./OptionChain";
import OptionChainTable from "./OptionChain/OptionChainTable";
import Uptrend from "./Uptrend";
import Header from "./Header";
import history from "../history";
import Login from '../components/Login'
import { connect } from "react-redux";

// https://media.merriam-webster.com/audio/prons/en/us/mp3/f/fucker01.mp3,

class App extends React.Component {
  render() {
    return (
      <div className="ui container" style={{ width: "98%" }}>
        <Router history={history} basename={"/stock-analyzer"}>
          {/* <Router history={history}> */}
          {this.props.isSignedIn ? <div>
            <Header />
            <Route path={`/`} exact component={Home}></Route>
            <Route path={`/oc_analyze`} component={OptionChain}></Route>
            <Route path={`/trend`} component={Uptrend}></Route>
            <Route
              path={`/option_chain_table`}
              component={OptionChainTable}
            ></Route>
            <Route path={`/login`} component={Login}></Route>
          </div> :
            <Login />
          }
        </Router>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    initialValues: {
    },
    isSignedIn: state.auth.isSignedIn,
  };
};

export default connect(mapStateToProps, {

})(App);
