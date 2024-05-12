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
import { storage } from "../firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import useUserStore from "/src/Components/libraries/userStore.js";
import { useChatStore } from "../libraries/chatStore";

import { update } from "firebase/database";

// Chat.jsx
// Assuming you have a Firebase storage instance set up

const uploadImage = async (file) => {
  try {
    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef); // Get the download URL
    return downloadURL;
  } catch (error) {
    throw new Error("Error uploading image: " + error.message);
  }
};

const Chat = () => {
  // const { currentUser } = useUserStore();
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState("");
  const [blockedStatus, setBlockedStatus] = useState(false);
  const [newmessage, setNewMessage] = useState("");
  const [image, setImage] = useState({
    file: null,
    url: "",
  });
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, changeBlock, isRecieverBlocked } =
    useChatStore();
  const handleEmojis = (e) => {
    console.log(e.emoji); // Log only the emoji character
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
      setBlockedStatus(!isRecieverBlocked);
    } catch (error) {
      console.log(error);
    }
  };
  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageURL = await uploadImage(file);
      setImage({
        file: file,
        url: imageURL,
      });
      setNewMessage(""); // Clear the message input
    } catch (error) {
      console.error("Error handling image:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatId || (!newmessage && !image.url)) {
      return; // Exit if chatId is undefined or null, and both newmessage and image are empty
    }
    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: newmessage,
          createdAt: new Date(),
          img: image.url,
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
        {!blockedStatus &&
          chats?.messages?.map((message) => (
            <div
              className={
                message.senderId === currentUser.id ? "other-msg" : "own-msg"
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
          <i className="ri-user-smile-line"onClick={() => setOpen((prev) => !prev)}></i>
            {/* <img src={emoji} alt=""  /> */}
            <div id="emoji-container">
              {open && <EmojiPicker onEmojiClick={handleEmojis} />}
            </div>
          </div>
        </div>

        <button
          type="submit"
          id="sendmsg-btn"
          onClick={handleSendMessage}
          disabled={isCurrentUserBlocked || isRecieverBlocked}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
