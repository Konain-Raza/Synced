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
  updateDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import { arrayUnion } from "firebase/firestore";
import useUserStore from "../libraries/userStore";

const AddUser = () => {
  const { currentUser } = useUserStore();

  const [users, setUsers] = useState([]);

  const handleAddUser = async () => {
    if (!users.length) return; // Ensure users is not empty
    const chatRef = collection(db, "chats");
    const UserchatsRef = collection(db, "userchats");
    try {
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
  
      // Construct the chat object
      const chatObject = {
        chatId: newChatRef.id,
        lastmessage: "",
        recieverId: currentUser.id,
        updatedAt: Date.now(),
      };
  
      // Update userchats for the user being added
      await updateDoc(doc(UserchatsRef, users[0].id), {
        chats: arrayUnion(chatObject),
      });
  
      // Update userchats for the current user
      await updateDoc(doc(UserchatsRef, currentUser.id), {
        chats: arrayUnion({ 
          ...chatObject,
          recieverId: users[0].id, // Switch the sender and receiver
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
        console.log(users)
        setUsers(querySnapshot.docs.map(doc => doc.data())); // Update state with array of user data
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div id="addUser">
      <form onSubmit={handleSearchuser} id="search-add-user">
        <input type="text" name="username" />
        <button type="submit" id="search">
          Search
        </button>
      </form>
      {users.length > 0 && (
        <div id="all-users">
          {users.map((user) => (
            <div className="userDetail" key={user.id}>
              <img src={user.avatar || avatar} alt="" />
              <span>{user.username}</span>
              <button id="idUser" onClick={handleAddUser}>
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