import "./userinfo.css";
import avatar from "./Images/avatar.png";
import useUserStore from "../../libraries/userStore";

const UserInfo = ({ currentUser }) => {
  // const { currentUser } = useUserStore();

  // Add a conditional check to prevent errors if currentUser is null or undefined
  if (!currentUser) {
    return null; // Render nothing if currentUser is null or undefined
  } else {
    // console.log()
  }

  return (
    <div id="userinfo">
      <div className="user">
        <div id="name">
        <img src={avatar} alt="user-image" />
        <h2>{currentUser.username}</h2>
        </div>
        <div id="icons-box">
          <i class="ri-settings-3-line"></i>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
