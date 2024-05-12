import React from 'react';
import "./settings.css";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase-config";

const Settings = ({ currentUser, onUpdate }) => {
  const handleSubmitSetting = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newname = formData.get("newname");
    const newstatus = formData.get("newstatus");
    const newimage = formData.get("image-url");
  
    try {
      const userDocRef = doc(db, "users", currentUser.id);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, {
          username: newname,
          status: newstatus,
        });
      } else {
        await setDoc(userDocRef, {
          username: newname,
          status: newstatus,
        });
      }
  
      console.log("User data updated successfully!");

      // Call the callback function with the updated user data
      onUpdate({ ...currentUser, username: newname }); // Update the username in the chatUser state

    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };
  
  return (
    <form id="settingsBox" onSubmit={handleSubmitSetting}>
      <input type="text" placeholder="New Name" name="newname" />
      <input type="text" placeholder="Status" name="newstatus" />
      <input type="file" name="image-url" />
      <button type="submit">Confirm</button>
    </form>
  );
};

export default Settings;
