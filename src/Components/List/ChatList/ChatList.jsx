import { useState, useEffect } from "react";
import "./chatlist.css";
import avatar from "../UserInfo/Images/avatar.png";
import AddUser from "../../AddUser/AddUser";
import useUserStore from "../../libraries/userStore";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore"; // Import getDoc
import { db } from "../../firebase-config";
import { useChatStore } from "../../libraries/chatStore.js";
import { ToastContainer, toast } from "react-toastify";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [modifyuser, setModifyUser] = useState(false);
  const { currentUser } = useUserStore();
  const { changeChat, isCurrentUserBlocked, isRecieverBlocked } =
    useChatStore(); // Destructure changeChat, isCurrentUserBlocked, isRecieverBlocked from useChatStore
  const [input, setInput] = useState("");

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
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      toast.log(error);
    }
  };

  const filterChats = chats.filter(
    (c) =>
      c &&
      c.user &&
      c.user.username &&
      c.user.username.toLowerCase().includes(input.toLowerCase())
  );

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
                toast.error("recieverId is undefined:", item);
                return null;
              }
            });

            const chatData = await Promise.all(promises);
            const filteredChatData = chatData.filter((item) => item !== null);
            setChats(filteredChatData.sort((a, b) => b.updateAt - a.updatedAt));
          } else {
            toast.error(
              "Document does not exist for currentUser:",
              currentUser
            );
          }
        } else {
          setChats([]);
        }
      } catch (error) {
        toast.error("Error fetching chats:", error);
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
              toast.log("recieverId is undefined:", item);
              return null;
            }
          });

          Promise.all(promises).then((chatData) => {
            const filteredChatData = chatData.filter((item) => item !== null);
            setChats(filteredChatData.sort((a, b) => b.updateAt - a.updatedAt));
          });
        } else {
          toast.error("Document does not exist for currentUser:", currentUser);
        }
      }
    );

    return () => {
      unsubscribe(); // Unsubscribe from the snapshot listener when the component unmounts
    };
  }, [currentUser]);
  useEffect(() => {
    filterChats.forEach((chat) => {
      if (!chat.isSeen) {
        toast.success(`New message from ${chat.user.username}`);
      }
    });
  }, []);


  return (
    <div id="chatlist">
      <div id="searchbar">
        <div id="search-input">
          <i className="ri-search-line"></i>
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
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
            style={{
              backgroundColor: chat.isSeen ? "white" : "#105ef3",
              color: chat.isSeen ? "black" : "white"
            }}
            
          >
            <img src={chat.user.avatar || avatar} alt="user-image" />
            <div id="name-msg">
              <h1>{chat.user.username}</h1>
              {!isCurrentUserBlocked ||
                (!isRecieverBlocked && <p>{chat.lastMessage}</p>)}
            </div>
          </div>
        ))}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>

      {modifyuser && <AddUser />}
    </div>
  );
};

export default ChatList;
