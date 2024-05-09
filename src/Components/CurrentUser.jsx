import React, { useState, useEffect } from "react";
import "./currentUser.css";
import "remixicon/fonts/remixicon.css";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase-config";

function CurrentUser(props) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [presentUserName, setPresentUserName] = useState("");
  const messageRef = collection(db, "chats");
  const roomRef = collection(db, "rooms");


  useEffect(() => {
    // Fetch all public rooms
    const q = query(roomRef, where("type", "==", "public"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedPublicRooms = [];
      querySnapshot.forEach((doc) => {
        fetchedPublicRooms.push({ id: doc.id, ...doc.data() });
      });
      setPublicRooms(fetchedPublicRooms);
    });
  
    return unsubscribe; // Return the unsubscribe function
  }, []);
  useEffect(() => {
    setPresentUserName(props.authUser.displayName);

    const q = query(messageRef, orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, []);

  const renderPublicRooms = () => {
    return publicRooms.map((room) => (
      <div key={room.id} className="room">
        <p>{room.name}</p>
        <button onClick={() => joinRoom(room.id)}>Join</button>
      </div>
    ));
  };

  
  

  const handleSendMsg = async () => {
    if (!props.authUser) {
      console.error("Current user is not defined. Please log in first.");
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
      setNewMessage(""); // Clear input field after sending message
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };
  const createRoom = async (isPrivate) => {
    try {
      if (!props.authUser) {
        console.error("Current user is not defined. Please log in first.");
        return;
      }
  
      const roomType = isPrivate ? "private" : "public";
      const roomData = {
        owner: props.authUser.uid,
        type: roomType,
      };
  
      const roomDocRef = await addDoc(roomRef, roomData);
      console.log("Created room:", roomDocRef.id);
  
      // Add the current user as a member of the room
      const memberRef = collection(db, `rooms/${roomDocRef.id}/members`);
      await addDoc(memberRef, {
        userId: props.authUser.uid,
      });
      console.log("Joined room:", roomDocRef.id);
    } catch (error) {
      console.error("Error creating room: ", error);
    }
  };
  
  

  const joinRoom = async (roomId) => {
    try {
      if (!props.authUser) {
        console.error("Current user is not defined. Please log in first.");
        return;
      }

      const roomDocRef = doc(db, "rooms", roomId);
      const memberRef = collection(roomDocRef, "members");
      await addDoc(memberRef, {
        userId: props.authUser.uid,
      });
      console.log("Joined room:", roomId);
    } catch (error) {
      console.error("Error joining room: ", error);
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
            {/* Display all rooms here */}
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
    </div>
  );
}

export default CurrentUser;
