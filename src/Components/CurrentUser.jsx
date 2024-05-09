import React, { useState, useEffect } from "react";
import "./currentUser.css";
import "remixicon/fonts/remixicon.css";
import { ToastContainer, toast } from "react-toastify";

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase-config";

function CurrentUser(props) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [presentUserName, setPresentUserName] = useState("");
  const [publicRooms, setPublicRooms] = useState([]); // Added state for public rooms
  const messageRef = collection(db, "chats");
  const roomRef = collection(db, "rooms");

  useEffect(() => {
console.log(props.authUser)


    const messageQuery = query(messageRef, orderBy("timestamp"));
    const roomQuery = query(roomRef);

    const messageUnsubscribe = onSnapshot(messageQuery, (querySnapshot) => {
      const fetchedMessages = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(fetchedMessages);
    });

    const roomUnsubscribe = onSnapshot(roomQuery, (querySnapshot) => {
      const fetchedRooms = [];
      querySnapshot.forEach((doc) => {
        fetchedRooms.push({ id: doc.id, ...doc.data() });
      });
      const publicRooms = fetchedRooms.filter((room) => room.type === "public");
      setPublicRooms(publicRooms); // Set public rooms
    });

    return () => {
      messageUnsubscribe();
      roomUnsubscribe();
    };
  }, []);

  const handleSendMsg = async () => {
    if (!props.authUser) {
      tost.error("Current user is not defined. Please log in first.");
      return;
    }

    if (!newMessage.trim()) {
      console.error("Message is empty.");
      return;
    }

    try {
      await addDoc(messageRef, {
        message: newMessage,
        user: presentUserName,
        timestamp: new Date().getTime(),
      });
      console.log("Message sent:", newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const joinRoom = async (roomId) => {
    try {

      const roomMemberRef = collection(db, "rooms", roomId, "members");
      await addDoc(roomMemberRef, {
        userId: props.authUser.currentUser.uid // Use props.authUser.uid instead of currentUser.uid
      });
      console.log("Joined room:", roomId);
    } catch (error) {
      console.error("Error joining room: ", error);
    }
  };

  const createRoom = async (isPrivate) => {
    try {
      if (!props.authUser) {
        console.error("Current user is not defined. Please log in first.");
        return;
      }
      const userId = props.authUser.currentUser.uid;
      if (!userId) {
        console.error("User ID is missing in props.authUser.");
        return;
      }

      const roomType = isPrivate ? "private" : "public";
      const roomData = {
        owner: userId,
        type: roomType,
      };
      const roomDocRef = await addDoc(roomRef, roomData);
      console.log("Created room:", roomDocRef.id);

      const memberRef = collection(db, `rooms/${roomDocRef.id}/members`);
      await addDoc(memberRef, {
        userId: userId,
      });
      console.log("Joined room:", roomDocRef.id);
    } catch (error) {
      console.error("Error creating room: ", error);
    }
  };


  return (
    <div id="currentUserPage">
      <div id="nav-bar">
        <div id="profile-bg">
          <img src="#" alt="" />
        </div>
        <div className="icon-bg">
          <i className="ri-account-circle-line"></i>
        </div>
        <div className="icon-bg">
          <i className="ri-account-circle-line"></i>
        </div>
        <div className="icon-bg">
          <i className="ri-account-circle-line"></i>
        </div>
      </div>
      <div id="rooms">
        <div id="rooms-header">
          <h1>Rooms</h1>
          <button onClick={() => createRoom(false)}>Create Public Room</button>
          <button onClick={() => createRoom(true)}>Create Private Room</button>
        </div>
        <div id="joined-rooms">
          <h2>Joined Rooms</h2>
          {/* Display joined rooms here */}
        </div>
        <div id="all-rooms">
          <h2>All Rooms</h2>
          {publicRooms.map((room) => (
            <div key={room.id} className="room">
              <p>{room.id}</p>{" "}
            
              <button onClick={() => joinRoom(room.id)}>Join</button>
            </div>
          ))}
        </div>
      </div>
      <div id="chat">
        <h1>Chats</h1>
        <div id="whole-chat">
          {messages.map((message) => (
            <div className="message" key={message.id}>
              <p id="username">{message.user}</p>
              <p id="msg-wrap">
                <span id="message-text">{message.message}</span>
                <br />
                <span id="time">
                  {new Date(message.timestamp).toLocaleString()}
                </span>
              </p>
            </div>
          ))}
        </div>
        <div id="new-message-box">
          <input
            type="text"
            id="msginput"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
            }}
          />
          <button id="sendmsg-btn" onClick={handleSendMsg}>
            Send
          </button>
        </div>
      </div>
      <ToastContainer
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              transition:Bounce
            />
    </div>
  );
}

export default CurrentUser;
