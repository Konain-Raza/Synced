import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import avatar from "../List/UserInfo/Images/avatar.png";
import { useEffect, useState } from "react";
import emoji from "./emoji.png";
import { doc, onSnapshot } from "firebase/firestore";

const Chat = () => {
  // const { currentUser } = useUserStore();
  const [open, setOpen] = useState(false);
  const [newmessage, setNewMessage] = useState("");

  const handleEmojis = (e) => {
    setNewMessage(newmessage + e.emoji);
    setOpen(false);
  };
  return (
    <div id="chat">
      <div id="current-chatuserinfo">
        <div id="info-1">
          <img src={avatar} alt="user-image" />
          <div id="name-status">
            <h2>Konain Raza</h2>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit</p>
          </div>
        </div>
        <div id="icons-box-2">
          <i className="ri-phone-fill"></i>
          <i className="ri-vidicon-fill"></i>
          <i className="ri-information-2-fill"></i>
        </div>
      </div>
      <div id="whole-chat">
        <div className="own-msg">
          <img src={avatar} alt="" />
          <div className="own-msg-contain">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias
              neque aperiam dolorem perferendis, sapiente ipsam nobis incidunt
              soluta beatae placeat animi nemo mollitia deleniti ullam hic
              explicabo, laboriosam repellat? Mollitia.{" "}
            </p>

            <span id="timeofmsg">1min ago</span>
          </div>
        </div>
        <div className="other-msg">
          <img src={avatar} alt="" />
          <div className="other-msg-contain">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias
              neque aperiam dolorem perferendis, sapiente ipsam nobis incidunt
              soluta beatae placeat animi nemo mollitia deleniti ullam hic
              explicabo, laboriosam repellat? Mollitia.{" "}
            </p>

            <span id="timeofmsg">1min ago</span>
          </div>
        </div>
        <div className="own-msg">
          <img src={avatar} alt="" />
          <div className="own-msg-contain">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias
              neque aperiam dolorem perferendis, sapiente ipsam nobis incidunt
              soluta beatae placeat animi nemo mollitia deleniti ullam hic
              explicabo, laboriosam repellat? Mollitia.{" "}
            </p>

            <span id="timeofmsg">1min ago</span>
          </div>
        </div>
        <div className="other-msg">
          <img src={avatar} alt="" />
          <div className="other-msg-contain">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias
              neque aperiam dolorem perferendis, sapiente ipsam nobis incidunt
              soluta beatae placeat animi nemo mollitia deleniti ullam hic
              explicabo, laboriosam repellat? Mollitia.{" "}
            </p>

            <span id="timeofmsg">1min ago</span>
          </div>
        </div>
        <div className="own-msg">
          <img src={avatar} alt="" />
          <div className="own-msg-contain">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias
              neque aperiam dolorem perferendis, sapiente ipsam nobis incidunt
              soluta beatae placeat animi nemo mollitia deleniti ullam hic
              explicabo, laboriosam repellat? Mollitia.{" "}
            </p>

            <span id="timeofmsg">1min ago</span>
          </div>
        </div>
        <div className="other-msg">
          <img src={avatar} alt="" />
          <div className="other-msg-contain">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias
              neque aperiam dolorem perferendis, sapiente ipsam nobis incidunt
              soluta beatae placeat animi nemo mollitia deleniti ullam hic
              explicabo, laboriosam repellat? Mollitia.{" "}
            </p>

            <span id="timeofmsg">1min ago</span>
          </div>
        </div>
        <div className="own-msg">
          <img src={avatar} alt="" />
          <div className="own-msg-contain">
            <img src={avatar} alt="" id="chat-img" />
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias
              neque aperiam dolorem perferendis, sapiente ipsam nobis incidunt
              soluta beatae placeat animi nemo mollitia deleniti ullam hic
              explicabo, laboriosam repellat? Mollitia.{" "}
            </p>

            <span id="timeofmsg">1min ago</span>
          </div>
        </div>
        <div className="other-msg">
          <img src={avatar} alt="" />
          <div className="other-msg-contain">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias
              neque aperiam dolorem perferendis, sapiente ipsam nobis incidunt
              soluta beatae placeat animi nemo mollitia deleniti ullam hic
              explicabo, laboriosam repellat? Mollitia.{" "}
            </p>

            <span id="timeofmsg">1min ago</span>
          </div>
        </div>
      </div>
      <div id="new-message-box">
        <div id="icons-box-3">
          <i className="ri-image-line"></i>
          <i className="ri-vidicon-line"></i>
          <i className="ri-mic-line"></i>
        </div>
        <input
          type="text"
          id="msginput"
          placeholder="Enter your message"
          value={newmessage}
          onChange={(e) => setNewMessage(console.log(e.target.value))}
        />
        <div id="emoji">
          <img src={emoji} alt="" onClick={() => setOpen((prev) => !prev)} />
          <div id="emoji-container">
            <EmojiPicker open={open} onClick={handleEmojis} />
          </div>
        </div>
        <button id="sendmsg-btn">Send</button>
      </div>
    </div>
  );
};

export default Chat;
