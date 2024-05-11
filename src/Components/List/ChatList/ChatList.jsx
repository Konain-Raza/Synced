import { useState, useEffect } from "react";
import "./chatlist.css";
import avatar from "../UserInfo/Images/avatar.png";
import AddUser from "../../AddUser/AddUser";
import userStore from "../../libraries/userStore";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase-config";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const { currentUser } = userStore();

  const [modifyuser, setModifyUser] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const unsub = onSnapshot(
        doc(db, "userchats", currentUser.id),
        async (response) => {
          const items = response.data().chats;
          const promises = items.map(async (item) => {
            const userdocRef = doc(db, "users", item.recieverId);
            const userdocSnap = await getDoc(userdocRef);
            const user = userdocRef.data();
            return { ...item, user };
          });
          const chatsData = await Promise.all(promises);
          setChats(chatsData.sort((a,b)=>b.updatedAt - a.updatedAt));
        }
      );
      return () =>  {
        unsub();
      };
    }
  }, [currentUser]);

  return (
    <div id="chatlist">
      <div id="searchbar">
        <div id="search-input">
          <i className="ri-search-line"></i>
          <input type="text" placeholder="Search" />
        </div>
        <i
          className={modifyuser ? "ri-subtract-line" : "ri-add-line"}
          id="add-button"
          onClick={() => setModifyUser((prev) => !prev)}
        ></i>
      </div>

      <div id="joined-users">
        {chats.map((chat) => (
          <div className="chat-users" key={chat.chatId}>
            <img src={avatar} alt="user-image" />
            <div id="name-msg">
              <h1>{chat.user.username}</h1>
              <p>{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
      {modifyuser && <AddUser />}
    </div>
  );
};

export default ChatList;
