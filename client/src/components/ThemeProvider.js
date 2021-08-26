import React, { useState } from "react";

export const ThemeContext = React.createContext({
  theme: {
    type: "light",
    primary: "#fff",
    text: "black",
  },
  setTheme: () => {},
});

export const ThemeContextProvider = (props) => {
  const theme = {
    light: {
      type: "light",
      primary: "#fff",
      secondary: "#0b121d",
      text: "#111",
      bgMenuSideBarColor: "#fff",
      chatTabsColor: "#0b121d",
      fillLogo: "#0b121d",
    },
    dark: {
      type: "dark",
      primary: "#070c13",
      secondary: "#fff",
      text: "#fff",
      bgMenuSideBarColor: "#0b121d",
      chatTabsColor: "#fff",
      fillLogo: "#fff",
    },
  };

  const setTheme = (type) => {
    setState({ ...state, theme: type === "dark" ? theme.light : theme.dark });
  };

  const initState = {
    theme: theme.light,
    setTheme: setTheme,
  };
  const [state, setState] = useState(initState);

  return (
    <ThemeContext.Provider value={state}>
      {props.children}
    </ThemeContext.Provider>
  );
};
