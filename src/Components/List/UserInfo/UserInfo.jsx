import "./userinfo.css";
import avatar from "./Images/avatar.png";
import useUserStore from "../../libraries/userStore";

const UserInfo = () => {
  const { currentUser } = useUserStore();

  // Add a conditional check to prevent errors if currentUser is null or undefined
  if (!currentUser) {
    return null; // Render nothing if currentUser is null or undefined
  }

  return (
    <div id="userinfo">
      <div className="user">
        <img src={avatar} alt="user-image" />
        <h2>{currentUser.username}</h2>
        <div id="icons-box">
          <i className="ri-more-fill"></i>
          <i className="ri-vidicon-fill"></i>
          <i className="ri-edit-box-line"></i>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
