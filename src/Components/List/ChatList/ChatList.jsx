import { useState, useEffect } from "react";
import "./chatlist.css";
import avatar from "../UserInfo/Images/avatar.png";
import AddUser from "../../AddUser/AddUser";
import useUserStore from "../../libraries/userStore";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore"; // Import getDoc
import { db } from "../../firebase-config";
import { useChatStore } from "../../libraries/chatStore.js";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [modifyuser, setModifyUser] = useState(false);
  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore(); // Destructure changeChat from useChatStore
  const [input, setInput] = useState("")




  const handleSelectChat = async (chat) => {
    // Change the parameter name from 'chats' to 'chat'
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });
    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );
    userChats[chatIndex].isSeen = true;
    const userChatRef = doc(db, "userchats", currentUser.id);
    try {
      await updateDoc(userChatRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user); // Pass chat.chatId and chat.user to changeChat
    } catch (error) {
      console.log(error);
    }
    // console.log(chat);
  };
  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (currentUser) {
          const docRef = doc(db, "userchats", currentUser.id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const items = docSnap.data().chats;
            const promises = items.map(async (item) => {
              if (item.recieverId) {
                const userDocRef = doc(db, "users", item.recieverId);
                const userdocSnap = await getDoc(userDocRef);
                const user = userdocSnap.data();
                return {
                  ...item,
                  user,
                };
              } else {
                console.log("recieverId is undefined:", item);
                return null;
              }
            });

            const chatData = await Promise.all(promises);
            const filteredChatData = chatData.filter((item) => item !== null);
            setChats(filteredChatData.sort((a, b) => b.updateAt - a.updatedAt));
          } else {
            console.error(
              "Document does not exist for currentUser:",
              currentUser
            );
          }
        } else {
          setChats([]);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats(); // Fetch initial chat data

    const unsubscribe = onSnapshot(
      doc(db, "userchats", currentUser.id),
      (snapshot) => {
        if (snapshot.exists()) {
          const items = snapshot.data().chats;
          const promises = items.map(async (item) => {
            if (item.recieverId) {
              const userDocRef = doc(db, "users", item.recieverId);
              const userdocSnap = await getDoc(userDocRef);
              const user = userdocSnap.data();
              return {
                ...item,
                user,
              };
            } else {
              console.log("recieverId is undefined:", item);
              return null;
            }
          });

          Promise.all(promises).then((chatData) => {
            const filteredChatData = chatData.filter((item) => item !== null);
            setChats(filteredChatData.sort((a, b) => b.updateAt - a.updatedAt));
          });
        } else {
          console.error(
            "Document does not exist for currentUser:",
            currentUser
          );
        }
      }
    );

    return () => {
      unsubscribe(); // Unsubscribe from the snapshot listener when the component unmounts
    };
  }, [currentUser]);

  const filterChats = chats.filter(c => c && c.user && c.user.username && c.user.username.toLowerCase().includes(input.toLowerCase()));

  // const filterChats = chats.filter(c => c && c.username && c.username.toLowerCase().includes(input.toLowerCase()));


  return (
    <div id="chatlist">
      <div id="searchbar">
        <div id="search-input">
          <i className="ri-search-line"></i>
          <input type="text" placeholder="Search" onChange={(e)=>setInput(e.target.value)} />
        </div>
        <i
          className={modifyuser ? "ri-subtract-line" : "ri-add-line"}
          id="add-button"
          onClick={() => setModifyUser((prev) => !prev)}
        ></i>
      </div>

      <div id="joined-users">
        {filterChats.map((chat) => (
          <div
            className="chat-users"
            key={chat.chatId}
            onClick={() => handleSelectChat(chat)}
            style={{ backgroundColor: chat.isSeen ? "transparent" : "blue" }}
          >
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
