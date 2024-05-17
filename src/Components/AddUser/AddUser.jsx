import { useState } from "react";
import "./addUser.css";
import { db } from "../firebase-config";
import avatar from "../List/UserInfo/Images/avatar.png";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore"; // Import necessary Firestore functions
import { ToastContainer, toast } from "react-toastify";
import useUserStore from "../libraries/userStore";

const AddUser = () => {
  const { currentUser } = useUserStore();
  const [users, setUsers] = useState([]);

  const handleAddUser = async () => {
    if (!users.length) return; // Ensure users is not empty

    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      // Assume the first user in the list is the one to be added (you can change this logic as needed)
      const newUser = users[0];

      // Check if the user already exists in the current user's chat list
      const userChatQuery = query(
        userChatsRef,
        where("receiverId", "==", newUser.id)
      );
      const userChatSnapshot = await getDocs(userChatQuery);
      if (!userChatSnapshot.empty) {
        // User is already registered, show toast and return
        toast.error("User is already registered.");
        return;
      }

      // Create a new chat document
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // Construct the chat object
      const chatObject = {
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: newUser.id,
        updatedAt: Date.now(),
      };

      // Add chat object to current user's userchats collection
      await setDoc(
        doc(userChatsRef, `${currentUser.id}_${newUser.id}`),
        chatObject
      );

      // Add chat object to the added user's userchats collection
      await setDoc(doc(userChatsRef, `${newUser.id}_${currentUser.id}`), {
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: currentUser.id,
        updatedAt: Date.now(),
      });

      console.log(
        "Chat successfully created and users added to each other's chat lists"
      );

      // Reset users state after adding user
      setUsers([]);
    } catch (error) {
      console.error("Error adding user: ", error);
      toast.error("Error adding user.");
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
        setUsers(querySnapshot.docs.map((doc) => doc.data())); // Update state with array of user data
      } else {
        // No users found
        setUsers([]);
        toast.error("No users found.");
      }
    } catch (error) {
      console.log(error);
      // Handle error
      toast.error("Error searching for users.");
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
      />
    </div>
  );
};

export default AddUser;
