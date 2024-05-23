import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";

import { db } from "../firebase-config";
import upload from "../libraries/Upload";
import useUserStore from "/src/Components/libraries/userStore.js";
import { useChatStore } from "../libraries/chatStore";
import avatar from "../List/UserInfo/Images/avatar.png";

const Chat = () => {
  const { currentUser } = useUserStore();
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [blockedStatus, setBlockedStatus] = useState(false);
  const [newmessage, setNewMessage] = useState("");
  const [image, setImage] = useState({
    file: null,
    url: "", // Set initial URL if available
  });

  const handleimage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    try {
      const imageURL = await upload(file);
      setImage({
        file: file,
        url: imageURL,
      });
  
      if (chatId) {
        await handleSendMessage(null, "", imageURL); // Call handleSendMessage with the image URL
      } else {
        toast.warn("chatId is not defined. Cannot send message.");
      }
    } catch (error) {
      toast.error("Error handling image:", error);
      toast.error("Error handling image");
    }
  };
  
  
  const handleSendMessage = async (e, messageText = newmessage, imageUrl) => {
    if (e) e.preventDefault();
  
    if (!chatId || (!messageText && !imageUrl)) {
      toast.warn("Both newmessage and image are empty.");
      return;
    }
  
    try {
      const messageData = {
        senderId: currentUser.id,
        text: messageText,
        createdAt: new Date(),
      };
  
      if (imageUrl) {
        messageData.image = imageUrl;
      }
  
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(messageData),
      });
  
      const userIDs = [currentUser.id, user.id];
      for (const id of userIDs) {
        const userChatRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatRef);
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          if (userChatsData && userChatsData.chats) {
            const chatIndex = userChatsData.chats.findIndex(
              (c) => c.chatId === chatId
            );
            if (chatIndex !== -1) {
              userChatsData.chats[chatIndex].lastMessage = messageText;
              userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
              userChatsData.chats[chatIndex].updatedAt = Date.now();
              await updateDoc(userChatRef, {
                chats: userChatsData.chats,
              });
            }
          }
        }
      }
    } catch (error) {
      toast.error("Error sending message:", error);
      toast.error("Error sending message");
    }
  
    setImage({
      file: null,
      url: "",
    });
    setNewMessage("");
  };
  


  const { chatId, user, isCurrentUserBlocked, changeBlock, isRecieverBlocked } =
    useChatStore();

  const handleEmojis = (e) => {
    setNewMessage((prevMessage) => prevMessage + e.emoji);
    setOpen(false); // Close the emoji picker
  };

  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChats(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  const handleBlock = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isRecieverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
      setBlockedStatus(!blockedStatus);
      setBlockedStatus(!isRecieverBlocked);
    } catch (error) {
      toast.error(error);
    }
  };
  useEffect(() => {
    const fetchBlockStatus = async () => {
      if (user && currentUser) {
        const userDocRef = doc(db, "users", currentUser.id);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setBlockedStatus(userData.blocked?.includes(user.id) || false);
        }
      }
    };

    fetchBlockStatus();

    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChats(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId, currentUser, user]);

  

  return (
    <div id="chat">
      <div id="current-chatuserinfo">
        <div id="info-1">
          <img src={user.avatar || avatar} alt="user-image" />
          <div id="name-status">
            <h2>{user.username}</h2>
            {user.status && <p>{user.status}</p>}
          </div>
        </div>
        <div id="icons-box-2">
          <button id="block-btn" onClick={handleBlock}>
            {isCurrentUserBlocked
              ? "You're Blocked!"
              : isRecieverBlocked
              ? "Unblock User"
              : "Block User"}
          </button>
        </div>
      </div>
      <div id="whole-chat">
        {isCurrentUserBlocked || isRecieverBlocked ? (
          <div id="blockeddiv">
            <h2>{isCurrentUserBlocked ? "You're Blocked!" : "Unblock User"}</h2>
          </div>
        ) : (
          !blockedStatus &&
          chats?.messages?.map((message) => (
            <div
              className={
                message.senderId === currentUser.id ? "other-msg" : "own-msg"
              }
              key={message?.createdAt}
            >
              <div
                className={
                  message.senderId === currentUser.id ? "other-msg" : "own-msg"
                }
              >
                <img src={avatar} alt="" />
                {message.image && <img src={message.image} alt="chat-img" id="chat-img"/>}
              </div>

              <div
                className={
                  message.senderId === currentUser.id
                    ? "other-msg-contain"
                    : "own-msg-contain"
                }
              >
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          ))
        )}
        <div ref={endRef}></div>
      </div>

      <form id="new-message-box" type="submit" onSubmit={handleSendMessage}>
        <div id="msg-type">
          <div id="icons-box-3">
            <label htmlFor="file">
              <i className="ri-image-line"></i>
            </label>
            <input
              type="file"
              name="file"
              id="file"
              style={{ display: "none" }}
              onChange={handleimage}
            />
          </div>
          <input
            type="text"
            id="msginput"
            placeholder={
              isCurrentUserBlocked || isRecieverBlocked
                ? "You can't send a message"
                : "Type a message"
            }
            value={newmessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isCurrentUserBlocked || isRecieverBlocked}
          />

          <div id="emoji">
            <i 
            disabled={isCurrentUserBlocked || isRecieverBlocked}
              className="ri-user-smile-line"
              onClick={() => setOpen((prev) => !prev)}
            ></i>
            <div id="emoji-container">
              {open && <EmojiPicker onEmojiClick={handleEmojis} />}
            </div>
          </div>
        </div>

        <button
          type="submit"
          id="sendmsg-btn"
          disabled={isCurrentUserBlocked || isRecieverBlocked}
        >
          <i className="ri-send-plane-2-line"></i>
        </button>
      </form>
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
  );
};

export default Chat;
