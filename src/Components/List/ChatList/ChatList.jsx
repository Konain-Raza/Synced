import { useState, useEffect, useRef } from "react";
import "./chatlist.css";
import avatar from "../UserInfo/Images/avatar.png";
import notificationSound from "../../../assets/Tunes/notification.mp3";
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
  const notificationAudio = new Audio(notificationSound);

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
        if (!currentUser) return; // Exit if currentUser is null
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
    console.log(currentUser);
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

  // Inside your component:

  // Create a ref to store the previous filterChats
  const previousFilterChatsRef = useRef([]);

  // Use the ref to compare the previous filterChats with the current filterChats
  useEffect(() => {
    // Compare the current filterChats with the previousFilterChats
    const newMessages = filterChats.filter(
      (chat) =>
        !previousFilterChatsRef.current.some(
          (prevChat) =>
            prevChat.chatId === chat.chatId && prevChat.isSeen === chat.isSeen
        )
    );

    // If there are new unseen messages, play the notification sound
    if (newMessages.length > 0) {
      toast.success(`New message from ${newMessages[0].user.username}`);
      const sound = new Audio(notificationAudio);
      sound.play();
    }

    // Update the previousFilterChatsRef with the current filterChats
    previousFilterChatsRef.current = filterChats;
  }, [filterChats, notificationAudio]);

  if (!currentUser) {
    return <div>Loading...</div>; // Render a loading indicator or a placeholder
  }

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
        {filterChats
          .sort((a, b) => a.isSeen - b.isSeen)
          .map((chat) => (
            <div
              className="chat-users"
              key={chat.chatId}
              onClick={() => handleSelectChat(chat)}
              style={{
                backgroundColor: chat.isSeen ? "white" : "#105ef3",
                color: chat.isSeen ? "black" : "white",
              }}
            >
              <img src={chat.user.avatar || avatar} alt="user-image" />
              <div id="name-msg">
                <h1>{chat.user.username}</h1>
                {(!isCurrentUserBlocked || !isRecieverBlocked) && (
                  <p>{chat.lastMessage}</p>
                )}
              </div>
            </div>
          ))}

        <ToastContainer
          position="top-center"
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
