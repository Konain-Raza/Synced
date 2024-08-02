import React, { useState, useEffect } from "react";
import "./userinfo.css";
import avatar from "./Images/avatar.png";
import Settings from "../../Settings/Settings";
import Cookies from "universal-cookie";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase-config";

const UserInfo = ({ currentUser }) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [chatUser, setChatUser] = useState(currentUser);
  const cookies = new Cookies();

  useEffect(() => {
    setChatUser(currentUser);
  }, [currentUser]);

  const toggleSettings = () => {
    setSettingsVisible((prev) => !prev);
  };

  const updateChatUser = (newUserData) => {
    setChatUser(newUserData);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
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
          <img src={chatUser?.avatar || avatar} alt="user-image" />
          <h2>{chatUser?.username || "Guest"}</h2>
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
