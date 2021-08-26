import { useContext, useRef } from "react";
import "./login.css";
import { loginCall } from "../../apiCalls";
import { AuthContext } from "../../context/AuthContext";
import { CircularProgress } from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import {Link} from 'react-router-dom';
import { ThemeContext } from "../../components/ThemeProvider";

const Login = ({result}) => {
  const email = useRef();
  const password = useRef();
  const { isFetching, dispatch } = useContext(AuthContext);
  const state = useContext(ThemeContext);

  const convoDesc = {
    color: state.theme.secondary,
  };
  const chatMsgInput = {
    background: state.theme.bgMenuSideBarColor,
    ...convoDesc
  }

  const handleClick = (e) => {
    e.preventDefault();
    loginCall(
      { email: email.current.value, password: password.current.value },
      dispatch
    );
  };

  return (
    <div className="login" style={chatMsgInput}>
      <div className="loginWrapper">
        <div className="loginTop">
          <h1 className="loginLogo"><img src="/assets/app-logo.png" alt="app logo" className="loginLogoImg" /> G5 Instant Chat</h1>
          <span className="loginDesc">
            <h4>Sign In</h4>
            <span>Sign in to continue.</span>
          </span>
        </div>
        <div className="loginFormContainer">
          <form className="loginBox" style={chatMsgInput} onSubmit={handleClick}>
        {result.error && (<Alert severity="error">Whoops! Username or Password is wrong — try again!</Alert>)}
            <input
              placeholder="Email"
              type="email"
              required
              className="loginInput" style={chatMsgInput}
              ref={email}
            />
            <input
              placeholder="Password"
              type="password"
              required
              minLength="6"
              className="loginInput" style={chatMsgInput}
              ref={password}
            />
            <button className="loginButton" type="submit" disabled={isFetching}>
              {isFetching ? (
                <CircularProgress size="20px" />
              ) : (
                "Sign in"
              )}
            </button>
            <span className="loginForgot">Forgot Password?</span>
              <div className="loginRegisterButton">
                Don't have account? <Link to="/register" style={{color: "inherit"}}>
                  Create a New Account
                  </Link>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;