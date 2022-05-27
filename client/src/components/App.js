import React from "react";
import { Router, Route } from "react-router-dom";

import Home from "./Home";
import OptionChain from "./OptionChain";
import Uptrend from "./Uptrend";
import EquityTrend from "./EquityTrend";
import OptionChainTable from "./OptionChain/OptionChainTable";
import Header from "./Header";
import history from "../history";
import Login from '../components/Login'
import Ws from '../components/Ws'
import { connect } from "react-redux";

// https://media.merriam-webster.com/audio/prons/en/us/mp3/f/fucker01.mp3,

class App extends React.Component {
  render() {
    return (
      <div className="ui container" style={{ width: "98%" }}>
        {/* <Router history={history} basename={"/stock-analyzer"}> */}
        <Router history={history}>
          {/* <Router history={history}> */}
          {this.props.isSignedIn ? <div>
            <Ws/>
            <Header />
            <Route path={`/login`} component={Login}></Route>
            <Route path={`/`} exact component={Home}></Route>
            <Route path={`/oc_analyze`} component={OptionChain}></Route>
            <Route path={`/option_trend`} component={Uptrend}></Route>
            <Route
              path={`/option_chain_table`}
              component={OptionChainTable}
            ></Route>
            <Route path={`/equity_trend`} component={EquityTrend}></Route>
            {/* <Route path="*" component={Home} /> */}
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

export default connect(mapStateToProps,{})(App);
