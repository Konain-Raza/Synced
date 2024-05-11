import { useState } from "react";
import "./addUser.css";
import { db } from "../firebase-config";
import avatar from "../List/UserInfo/Images/avatar.png";
import {
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  getDoc,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { arrayUnion } from "firebase/firestore/lite";
import userStore from "../libraries/userStore";

const AddUser = () => {
  const { currentUser } = userStore();

  const [users, setUsers] = useState(null);

const handleAddUser = async () => {
  if (!users) return; // Ensure users is not null
  const chatRef = collection(db, "chats");
  const UserchatsRef = collection(db, "userchats");
  try {
    const newChatRef = await addDoc(chatRef, { // Use addDoc to add a new document
      createdAt: serverTimestamp(),
      messages: [],
    });
    await updateDoc(doc(UserchatsRef, users.id), {
      chats: arrayUnion({
        chatId: newChatRef.id,
        lastmessage: "",
        recieverId: currentUser.id, // Use currentUser.id
        updatedAt: Date.now(),
      }),
    });
    await updateDoc(doc(UserchatsRef, currentUser.id), {
      chats: arrayUnion({
        chatId: newChatRef.id,
        lastmessage: "",
        recieverId: users.id,
        updatedAt: Date.now(),
      }),
    });
    console.log(newChatRef.id);
  } catch (error) {
    console.log(error);
  }
};


  const handleSearchuser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setUsers(querySnapshot.docs.map((doc) => doc.data()));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div id="addUser">
      <form onSubmit={handleSearchuser}>
        <input type="text" name="username" />
        <button type="submit" id="search">
          Search
        </button>
      </form>
      {users && (
        <div id="all-users">
          {users.map((user) => (
            <div className="userDetail" key={user.id}>
              <img src={avatar} alt="" />
              <span>{user.username}</span>
              <button id="addUser" onClick={handleAddUser}>
                Add user
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddUser;
