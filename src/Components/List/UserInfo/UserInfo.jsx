import React, { useState } from "react";
import "./userinfo.css";
import avatar from "./Images/avatar.png";
import Settings from "../../Settings/Settings";
import Cookies from "universal-cookie";

const UserInfo = ({ currentUser }) => {
  const [logout, setlogout] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [chatUser, setChatUser] = useState(currentUser); // Initialize chatUser state with currentUser
  const cookies = new Cookies();

  // Function to toggle settings visibility
  const handleLogout = () => {
    cookies.remove("auth-token");
    window.location.reload();
  };
  const toggleSettings = () => {
    setSettingsVisible((prev) => !prev);
  };

  // Callback function to update chatUser state
  const updateChatUser = (newUserData) => {
    setChatUser(newUserData);
  };

  return (
    <div id="userinfo">
      <div className="user">
        <div id="name">
          <img src={chatUser.avatar} alt="user-image" />
          <h2>{chatUser.username}</h2>
        </div>
        <div id="icons-box">
          <i className="ri-logout-box-r-line" onClick={handleLogout}></i>
          <i className="ri-settings-3-line" onClick={toggleSettings}></i>
        </div>
      </div>
      {settingsVisible && (
        <Settings currentUser={currentUser} onUpdate={updateChatUser} />
      )}
    </div>
  );
};

export default UserInfo;
