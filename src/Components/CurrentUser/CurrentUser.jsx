import "./currentUser.css";
import { useEffect, useState } from "react";
import Chat from "../Chat/Chat";
import List from "../List/List";
import useUserStore from "../libraries/userStore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase-config";
import App from "../../App";
import { useChatStore } from "../libraries/chatStore";
  
const CurrentUser = (props) => {
  const { chatId } = useChatStore();
  const { currentUser, fetchUserInfo } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserInfo(user.uid);
        setIsLoading(false); // Set loading to false after user data is fetched
      }
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  // Render loading indicator if data is still loading
  if (isLoading) {
    return  <div className="loader"></div> ;
  }

  return (
    <div id="currentUser">
      <List currentUser={currentUser}/>
      {chatId ? <Chat currentUser={currentUser}/> : <div id="onboard">
        <h1>Welcome to Synced 🌟</h1>
        <p>

Get started by connecting with others! Add them to your chats and let the conversations flow. Share images 📷, messages 💬, and more to stay connected and build meaningful connections. Let Synced be your platform for fostering friendships and creating memories that last a lifetime.</p>
        
        </div>}
      {/* {chatId ? <Chat currentUser={currentUser}/> : <div width50% height 100%>Begin Chatting</div>} */}
    </div>
  );
}
  
export default CurrentUser;
