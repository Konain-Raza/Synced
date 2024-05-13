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
import { db } from "../firebase-config";
import upload from "../libraries/Upload";
import useUserStore from "/src/Components/libraries/userStore.js";
import { useChatStore } from "../libraries/chatStore";
import avatar from "../List/UserInfo/Images/avatar.png";
import toast from "react-hot-toast";

const Chat = () => {
  const { currentUser } = useUserStore();
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState("");
  const [blockedStatus, setBlockedStatus] = useState(false);
  const [newmessage, setNewMessage] = useState("");
  const [image, setImage] = useState({
    file: null,
    url: currentUser.avatar || "", // Set initial URL if available
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
      // setNewMessage(""); // Clear the message input
      // handleSendMessage(); // Trigger handleSendMessage after image upload
    } catch (error) {
      toast.error("Error handling image:", error);
    }
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
      setBlockedStatus(!isRecieverBlocked);
    } catch (error) {
      toast.log(error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatId || (!newmessage && !image.url)) {
      return; // Exit if chatId is undefined or null, and both newmessage and image are empty
    }
    let ImageUrl = null;

    try {
      if (image.file) {
        ImageUrl = await upload(image.file);
      }
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: newmessage,
          createdAt: new Date(),
          ...(ImageUrl && { image: ImageUrl }), // Corrected 'Ima' to 'ImageUrl'
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
      toast.log(error);
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
                  message.senderId === currentUser.id ? "own-msg" : "other-msg"
                }
              >
                <img src={avatar} alt="" />
                {message.image && <img src={message.image} alt="chat-img" />}
              </div>

              <div
                className={
                  message.senderId === currentUser.id
                    ? "own-msg-contain"
                    : "other-msg-contain"
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
            <label htmlFor="file" >
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
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
