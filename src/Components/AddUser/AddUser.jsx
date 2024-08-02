import { useState } from "react";
import "./addUser.css";
import { db } from "../firebase-config";
import avatar from "../List/UserInfo/Images/avatar.png";
import {
  collection,
  query,
  where,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import { arrayUnion } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import styles for Toastify
import useUserStore from "../libraries/userStore";

const AddUser = () => {
  const { currentUser } = useUserStore();
  const [users, setUsers] = useState([]);

  const handleAddUser = async (user) => {
    if (!user) return;

    const chatRef = collection(db, "chats");
    const UserchatsRef = collection(db, "userchats");

    try {
      if (!currentUser || !currentUser.id) {
        toast.error("Current user is not valid");
        return;
      }

      const currentUserChatsDoc = await getDoc(doc(UserchatsRef, currentUser.id));
      if (!currentUserChatsDoc.exists()) {
        toast.error("Current user chats document does not exist");
        return;
      }

      const currentUserChats = currentUserChatsDoc.data()?.chats || [];
      const userExists = currentUserChats.some(chat => chat.recieverId === user.id);

      if (userExists) {
        toast.error("User is already in the chat list");
        return;
      }

      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const chatObject = {
        chatId: newChatRef.id,
        lastMessage: "",
        recieverId: currentUser.id,
        updatedAt: Date.now(),
      };

      await updateDoc(doc(UserchatsRef, user.id), {
        chats: arrayUnion(chatObject),
      });

      await updateDoc(doc(UserchatsRef, currentUser.id), {
        chats: arrayUnion({
          ...chatObject,
          recieverId: user.id,
        }),
      });

      toast.success("User added to chat list");
    } catch (error) {
      toast.error("Error adding user: " + error.message);
    }
  };

  const handleSearchUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        toast.error("No user found with this username");
        setUsers([]);
      }
    } catch (error) {
      toast.error("Error searching user: " + error.message);
    }
  };

  return (
    <div id="addUser">
      <form onSubmit={handleSearchUser} id="search-add-user">
        <input type="text" name="username" placeholder="Enter username" />
        <button type="submit" id="search">
          Search
        </button>
      </form>
      {users.length > 0 && (
        <div id="all-users">
          {users.map((user) => (
            <div className="userDetail" key={user.id}>
              <img src={user.avatar || avatar} alt="user avatar" />
              <span>{user.username}</span>
              <button id="idUser" onClick={() => handleAddUser(user)}>
                Add user
              </button>
            </div>
          ))}
        </div>
      )}
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

export default AddUser;
