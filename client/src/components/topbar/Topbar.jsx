import React, {useState, useEffect} from 'react';
import "./topbar.css";
import { Chat, ExitToApp } from "@material-ui/icons";
import {CircularProgress} from "@material-ui/core";
import { Link, Redirect } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useHistory } from "react-router";

const Topbar = () => {
  const { user } = useContext(AuthContext);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const history = useHistory();
  const [logoutProgress, setLogoutProgress] = useState(false);

  const handleLogout = e => {
    // setLogoutProgress(true);
    localStorage.clear("user");
    history.push("/login");
  }

  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">ICA</span>
        </Link>
      </div>
      <div className="topbarRight">
        <div className="topbarIcons">
          <div className="topbarIconItem">
            <Chat />
            <span className="topbarIconBadge">2</span>
          </div>
        </div>
        <div className="topbar-profile-title">
          <img
            src={
              user.profilePicture
                ? PF + user.profilePicture
                : PF + "person/noAvatar.png"
            }
            alt=""
            className="topbarImg"
          />
          <span> {user.username}</span>
        </div>
        <div className="topbar-profile-title logout" onClick={(e)=>handleLogout(e)}>
          <ExitToApp/>
            {logoutProgress ? <CircularProgress color="white" size="20px" />:
            <span>Logout</span>}
        </div>
      </div>
    </div>
  );
}

export default Topbar;