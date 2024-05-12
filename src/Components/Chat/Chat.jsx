import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import avatar from "../List/UserInfo/Images/avatar.png";
import { useEffect, useRef, useState } from "react";
import emoji from "./emoji.png";
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase-config";

// Chat.jsx

import useUserStore from "/src/Components/libraries/userStore.js";
import { useChatStore } from "../libraries/chatStore";

import { update } from "firebase/database";
const Chat = () => {
  // const { currentUser } = useUserStore();
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState("");
  const [blockedStatus, setBlockedStatus]  = useState(false)
  const [newmessage, setNewMessage] = useState("");
  const [image, setImage] = useState({
    file: null,
    url: "",
  });
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, changeBlock, isRecieverBlocked } =
    useChatStore();
  const handleEmojis = (e) => {
    setNewMessage(newmessage + e);
    setOpen(false);
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
      setBlockedStatus(!isRecieverBlocked)
     
    } catch (error) {
      console.log(error);
    }
  };
  const handleImage = async () => {
    if (!newmessage || !image.file) return; // Check if newmessage or image.file is empty

    try {
      const imageURL = await uploadImage(image.file); // Upload image
      setImage({
        file: image.file, // Keep the existing file
        url: imageURL, // Set the image URL
      });
      await updateDoc(doc(db, "chats", chatId), {
        // Update document with image URL
        messages: arrayUnion({
          senderId: currentUser.id,
          text: newmessage,
          createdAt: new Date(),
          img: imageURL, // Set the image URL directly
        }),
      });
    } catch (error) {
      console.error("Error handling image:", error); // Log error if any
    }
  };

  const handleSendMessage = async () => {
    if (!chatId || !newmessage) {
      return; // Exit if chatId or newmessage is undefined or null
    }
    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: newmessage,
          createdAt: new Date(),
        }),
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
              userChatsData.chats[chatIndex].lastMessage = newmessage;
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
      console.log(error);
    }
    setImage({
      file: null,
      url: "",
    });
    setNewMessage("");
  };
  return (
    <div id="chat">
      <div id="current-chatuserinfo">
        <div id="info-1">
          <img src={avatar} alt="user-image" />
          <div id="name-status">
            <h2>{user.username}</h2>
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
        {!blockedStatus&&
          chats?.messages?.map((message) => (
            <div
              className={
                message.senderId === currentUser.id ? "own-msg" : "other-msg"
              }
              key={message?.createdAt}
            >
              <img src={avatar} alt="" />
              {message.img && <img src={message.img} alt="chat-img" />}{" "}
              <div
                className={
                  message.senderId === currentUser.id
                    ? "own-msg-contain"
                    : "other-msg-contain"
                }
              >
                <p>{message.text}</p>
              </div>
            </div>
          ))}
        {image.url &&
          !blockedStatus && ( // Check if image URL is available and current user is not blocked
            <div className="own-msg">
              {/* Render the uploaded image */}
              <img src={image.url} alt="chat-img" />
            </div>
          )}

        <div ref={endRef}></div>
      </div>

      <div id="new-message-box">
        <div id="icons-box-3">
          <label htmlFor="file">
            <i className="ri-image-line"></i>
          </label>
          <input
            type="file"
            name="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImage}
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
          <img src={emoji} alt="" onClick={() => setOpen((prev) => !prev)} />
          <div id="emoji-container">
            <EmojiPicker open={open} onClick={handleEmojis} />
          </div>
        </div>
        <button
          id="sendmsg-btn"
          onClick={handleSendMessage}
          disabled={isCurrentUserBlocked || isRecieverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
