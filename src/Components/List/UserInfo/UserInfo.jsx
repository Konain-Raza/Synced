import React, { useState } from "react";
import "./userinfo.css";
import avatar from "./Images/avatar.png";
import Settings from "../../Settings/Settings";
import Cookies from "universal-cookie";
import { signOut } from "firebase/auth"; // Import the signOut function

const UserInfo = ({ currentUser }) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [chatUser, setChatUser] = useState(currentUser); // Initialize chatUser state with currentUser
  const cookies = new Cookies();

  // Function to toggle settings visibility
  const toggleSettings = () => {
    setSettingsVisible((prev) => !prev);
  };

  // Callback function to update chatUser state
  const updateChatUser = (newUserData) => {
    setChatUser(newUserData);
  };

  // Function to handle user sign-out
  const handleLogout = async () => {
    try {
      await signOut(auth); // Assuming `auth` is your Firebase authentication instance
      cookies.remove("auth-token");
      window.location.reload();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div id="userinfo">
      <div className="user">
        <div id="name">
          <img src={chatUser.avatar || avatar} alt="user-image" />
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
