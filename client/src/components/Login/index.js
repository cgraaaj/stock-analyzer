import React from "react";
import { connect } from "react-redux";
import _ from "lodash";

import {
  signIn
} from "../../actions";
import { Form, Field, FormSpy } from "react-final-form";

class Login extends React.Component {
  componentDidMount() {
    
  }
  onSignIn = (values) => {
    console.log(values);
    this.props.signIn(values)
    // this.props.analyzeOptionChain({ ...values, data: this.props.data });
    // this.props.getOptionChain(values.expiry, this.props.data);
    // this.props.setFormValues(values);
  };

  onClickSignUp = () => {

  };

  renderError({ error, touched }) {
    if (touched && error) {
      return (
        <div className="header" style={{ color: "#9f3a38" }}>
          {error}
        </div>
      );
    }
  }

  validate = (formValues) => {
    const errors = {};
    console.log("asdfsdfasdf")
    if (!formValues.username) {
      errors.word = "Username required";
    }
    if (!formValues.password) {
      errors.word = "Password required";
    }
    return errors;
  };

  renderInput = ({ input, label, meta }) => {
    const className = `field ${meta.error && meta.touched ? "error" : " "}`;
    return (
      <div className="row">
        <div className="column">
          <div className={`ui right aligned container ${className}`}>
            <label>{label}</label>
          </div>
        </div>
        <div className="column" style={{width: "30%" }}>
          <input {...input} autoComplete="off" type={label === 'Password' ? 'password' : null} id={label} />
        </div>
        {this.renderError(meta)}
      </div>
    );
  };

  render() {
    let tnc = React.createRef();
    return (
      <div>
        <div className="ui segments">
          <div className="ui segment">
            <div className="ui one column centered grid">
              <div className="row">
                <h4 style={{ margin: "10px" }}>
                  Login Page
                </h4>
              </div>
            </div>
          </div>
          <div className="ui segment">
            <div className="ui one column centered grid">
              <div className="column">
                <div className="ui segment">
                  <Form
                    onSubmit={this.onSignIn}
                    initialValues={this.props.initialValues}
                    validate={this.validate}
                    render={({ handleSubmit, values }) => (
                      <form className="ui form error" onSubmit={handleSubmit}>
                        {/* <FormSpy
                          subscription={{ values: true }}
                          onChange={(state) => {
                            const { values } = state
                            this.exposeValues({ values })
                          }} /> */}
                        <div className="ui two column grid container">
                          <Field
                            name="username"
                            component={this.renderInput}
                            label="Username"
                          />
                          <Field
                            name="password"
                            component={this.renderInput}
                            label="Password"
                          />
                          <div className="row">
                            <div className="column"></div>
                            <div className="column">
                              <div class="ui checkbox">
                                <input type="checkbox" name="showpass" onClick={(e) => {
                                  let passEl = document.getElementById("Password")
                                  if (e.target.checked) {
                                    passEl.type = "text"
                                  } else {
                                    passEl.type = "password"
                                  }
                                }} />
                                <label>Show password</label>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="column">
                              <div className="ui right aligned container">
                                <button
                                  type="button"
                                  className={
                                    "ui secondary button"
                                    //   ? "ui secondary button"
                                    //   : "ui disabled button"
                                  }
                                  onClick={this.onClickSignUp}
                                >
                                  Sign Up
                                </button>
                              </div>
                            </div>
                            <div className="column">
                              <button
                                type="submit"
                                className={
                                  "ui primary button"
                                    // ? "ui primary button"
                                    // : "ui disabled button"
                                }
                              >
                                Sign In
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="ui segment">
            <p>
              Investment/Trading in securities Market is subject to market risk, past performance is not a guarantee of
              future performance. The risk of loss in trading and investment in Securities markets including Equites,
              Derivatives, commodity and Currency can be substantial.
              These are leveraged products that carry a substantial risk of loss up to your invested capital and may not
              be suitable for everyone. You should therefore carefully consider whether such trading is suitable for
              you in light of your financial condition. Please ensure that you understand fully the risks involved and
              do invest money according to your risk bearing capacity.
            </p>
            <p>
              Investment in markets is subject to market risk.
              Hence, <b>CGR Trades</b> are not
              liable for any losses in any case. All our services are nonrefundable.
            </p>
            <div class="ui slider checkbox" >
              <input type="checkbox" name="tearmsnconditions" ref={tnc} />
              <label>Accept terms and conditions</label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    initialValues: {
    },
  };
};

export default connect(mapStateToProps, {
  signIn
})(Login);
