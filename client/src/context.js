import React from "react";

const AppContext = React.createContext();

function getUsername() {
  return localStorage.getItem("userName") || "Anon";
}

function getUserid() {
  let userid = /id=([^;]+)/.exec(document.cookie);
  if (!userid || !userid[1]) {
    return null;
  }
  return userid[1];
}

function AppProvider({ children }) {
  const [userid, setUserid] = React.useState(getUserid());
  const [userName, setUserName] = React.useState(getUsername());
  const [showNewTalkModal, setShowNewTalkModal] = React.useState(false);

  return (
    <AppContext.Provider
      value={{
        setShowNewTalkModal,
        showNewTalkModal,
        userName,
        setUserName,
        userid,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

function useAppContext() {
  return React.useContext(AppContext);
}

export { AppProvider, useAppContext };
