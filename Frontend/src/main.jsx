import React, { createContext, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

export const Context = createContext({ isAuthorized: false });

const AppWrapper = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [token, setToken] = useState(null);
  const [owner, setOwner] = useState(() => {
    const storedUser = localStorage.getItem("owner");
    return storedUser ? storedUser : null;
  });
  useEffect(() => {
    const currUser = localStorage.getItem("owner");
    currUser ? setOwner[currUser] : null;
  }, []);

  const [user, setUser] = useState();

  return (
    <Context.Provider
      value={{
        isAuthorized,
        setIsAuthorized,
        user,
        setUser,
        owner,
        setOwner,
        token,
        setToken,
      }}
    >
      {children}
    </Context.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppWrapper>
    <App />
  </AppWrapper>
);
