import "./currentUser.css";
import { useEffect, useState } from "react";
import Chat from "../Chat/Chat";
import List from "../List/List";
import Detail from "../Detail/Detail";
import userStore from "../libraries/userStore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase-config";

const CurrentUser = (props) => {
  const { currentUser, isLoading, fetchUserInfo } = userStore();
  const [user, setUser] = useState(props.authUser);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user)
        fetchUserInfo(user.uid);
        
      }
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);



  return (
    <div id="currentUser">
      <List />
      <Chat />
      <Detail />
    </div>
  );
};

export default CurrentUser;
