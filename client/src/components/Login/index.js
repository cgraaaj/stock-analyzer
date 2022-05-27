import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import Button from '@mui/material/Button';
import {custTheme} from "../../utils/custMatUI"
import { ThemeProvider } from "@mui/material/styles"
import Checkbox from '@mui/material/Checkbox'
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
        <div className="column">
          <input {...input} autoComplete="off" type={label === 'Password' ? 'password' : null} id={label} />
        </div>
        {this.renderError(meta)}
      </div>
    );
  };

  render() {
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
                        <ThemeProvider theme={custTheme}>
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
                            <Checkbox label="Show Password" onClick={(e) => {
                                  let passEl = document.getElementById("Password")
                                  if (e.target.checked) {
                                    passEl.type = "text"
                                  } else {
                                    passEl.type = "password"
                                  }
                                }}/>
                                <label>Show password</label>
                            </div>
                          </div>
                          <div className="row">
                            <div className="column">
                              <div className="ui right aligned container">
                                <Button
                                  type="button"
                                  variant="contained"
                                  color="secondary"
                                  onClick={this.onClickSignUp}
                                >
                                  Sign Up
                                </Button>
                              </div>
                            </div>
                            <div className="column">
                              <Button
                                type="submit"
                                variant="contained"
                              >
                                Sign In
                              </Button>
                            </div>
                          </div>
                          </ThemeProvider>
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
              Hence, <b>CGR Trades</b> and <b>MC Holdings Pvt. Ltd</b> are not
              liable for any losses in any case. All our services are nonrefundable.
            </p>
          </div>
          <div className="ui segment">
          <div className="ui one column centered grid">
              <div className="row">
              <audio id="scam" src="resource/rhtih.mp3"></audio>
                <h4 style={{ margin: "10px" ,cursor: "pointer"}} onClick={()=>{
                  document.getElementById("scam").play()
                }}>
                  "Risk hai toh ishq hai..." inspired from MCVenkie
                </h4>
              </div>
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
