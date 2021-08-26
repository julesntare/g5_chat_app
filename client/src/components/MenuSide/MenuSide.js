import React, { useState, useContext, useEffect } from "react";
import "./menuSide.css";
import {
  Menu,
  ExitToApp,
  Brightness4Outlined,
  Brightness7Outlined,
  Group,
} from "@material-ui/icons";
import Avatar from "react-avatar";
import { ThemeContext } from "../ThemeProvider";
import RoomDialog from "../DialogBoxes/RoomDialog";

const MenuSide = ({ userProfile }) => {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const state = useContext(ThemeContext);
  // useEffect(() => {
  //   state. = localStorage.getItem("g5Theme");
  // }, [state]);

  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState();

  const menuSideBar = {
    background: state.theme.bgMenuSideBarColor,
  };
  const sideLogo = {
    fill: state.theme.fillLogo,
    color: state.theme.secondary,
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
    setSelectedValue(value);
  };

  return (
    <div className="menuSideBar" style={menuSideBar}>
      <div className="menuSideBarWrapper">
        <input type="checkbox" id="hamburgerMenuToggler" />
        <div className="menuSideBarItem">
          <div className="menuSideBarItemMenuLogo">
            <label htmlFor="hamburgerMenuToggler">
              <Menu style={sideLogo} />
            </label>
          </div>
        </div>
        <div className="menuSideBarItem menus">
          <div className="menuSideBarItemLogo">
            <Group style={sideLogo} />
          </div>
          <div
            className="menuSideBarItemDesc"
            style={sideLogo}
            onClick={handleClickOpen}
          >
            Create Room
          </div>
          <RoomDialog
            creator={userProfile._id}
            selectedValue={selectedValue}
            open={open}
            onClose={handleClose}
          />
        </div>
        <div className="menuSideBarItem menus">
          <div className="menuSideBarItemLogo">
            <ExitToApp style={sideLogo} />
          </div>
          <div
            className="menuSideBarItemDesc"
            style={sideLogo}
            onClick={logout}
          >
            Sign Out
          </div>
        </div>
        <div className="menuSideBarItem">
          <div className="menuSideBarItemPageMode">
            {state.theme.type === "light" ? (
              <Brightness4Outlined
                style={sideLogo}
                onClick={() => {
                  state.setTheme(state.theme.type);
                  localStorage.setItem("g5Theme", JSON.stringify("dark"));
                }}
                title="light theme"
              />
            ) : (
              <Brightness7Outlined
                onClick={() => {
                  state.setTheme(state.theme.type);
                  localStorage.setItem("g5Theme", JSON.stringify("light"));
                }}
                title="dark theme"
              />
            )}
          </div>
        </div>
        <div className="menuSideBarItem last">
          <div className="menuSideBarItemLogo">
            {userProfile.profilePicture ? (
              <img
                src={PF + userProfile.profilePicture}
                className="menuSideBarItemImg"
                alt="profile pic"
              />
            ) : (
              <Avatar
                name={userProfile.firstname + " " + userProfile.lastname}
                size="35"
                textSizeRatio={1.75}
                className="messageImg"
              />
            )}
          </div>
          <div className="menuSideBarItemDesc" style={sideLogo}>
            {userProfile.username}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuSide;
