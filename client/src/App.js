import Login from "./pages/login/Login";
import Profile from "./pages/profile/Profile";
import Register from "./pages/register/Register";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Messenger from "./pages/messenger/Messenger";
import { ThemeContextProvider } from "./components/ThemeProvider";

function App() {
  const { user } = useContext(AuthContext);
  const y = useContext(AuthContext);

  return (
    <Router>
      <Switch>
        <ThemeContextProvider>
          <Route exact path="/">
            {user && user.token ? <Messenger /> : <Login result={y} />}
          </Route>
          <Route path="/login">
            {user !== null ? <Redirect to="/" /> : <Login />}
          </Route>
          <Route path="/register">
            {user && user.token ? <Redirect to="/" /> : <Register />}
          </Route>
          <Route path="/messenger">
            {!user ? <Redirect to="/" /> : <Messenger />}
          </Route>
          <Route path="/profile/:username">
            <Profile />
          </Route>
        </ThemeContextProvider>
      </Switch>
    </Router>
  );
}

export default App;
