import React from "react";
import { Router, Route } from "react-router-dom";

import Home from "./Home";
import OptionChain from "./OptionChain";
import OptionChainTable from "./OptionChain/OptionChainTable"
import Uptrend from "./Uptrend";
import Header from "./Header";
import history from "../history";

// https://media.merriam-webster.com/audio/prons/en/us/mp3/f/fucker01.mp3,

const App = () => {
  return (
    <div className="ui container">
      <Router history={history} basename={"/stock-analyzer"}>
        <div>
          <Header />
          <Route path={`/`} exact component={Home}></Route>
          <Route path={`/oc_analyze`} component={OptionChain}></Route>
          <Route path={`/uptrend`} component={Uptrend}></Route>
          <Route path={`/option_chain_table`} component={OptionChainTable}></Route>
        </div>
      </Router>
    </div>
  );
};

export default App;
