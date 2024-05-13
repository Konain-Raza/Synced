import React, { useState } from "react";
import "./settings.css";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage"; // Update import statement for Firebase Storage
import upload from "../libraries/Upload";
import { ToastContainer, toast } from "react-toastify";


const Settings = ({ currentUser, onUpdate }) => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: currentUser.avatar || "", // Set initial URL if available
  });

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSubmitSetting = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newname = formData.get("newname");
    const newstatus = formData.get("newstatus");
    let imageUrl; // Declare imageUrl variable here

    try {
      const userDocRef = doc(db, "users", currentUser.id);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        imageUrl = avatar.url; // Default to current avatar URL
        if (avatar.file) {
          imageUrl = await upload(avatar.file); // Upload new avatar if file is selected
        }
        await updateDoc(userDocRef, {
          avatar: imageUrl,
          username: newname,
          status: newstatus,
        });
      } else {
        await setDoc(userDocRef, {
          username: newname,
          status: newstatus,
        });
      }

      toast.success( `${currentUser.username} you data updated successfully!`);
      onUpdate({ ...currentUser, username: newname, avatar: imageUrl });
      

    } catch (error) {
      toast.error("Error updating user data:", error);
    }
  };

  return (
    <form id="settingsBox" onSubmit={handleSubmitSetting}>
      <input type="text" placeholder="New Name" name="newname" required/>
      <input type="text" placeholder="Status" name="newstatus" required />
      <label htmlFor="file" id="file-set">
        <img src={avatar.url} alt="" /> {/* Display the selected image */}
        Upload an Image
      </label>
      <input 
        type="file"
        id="file"
        name="image-url"
        style={{ display: "none" }}
        onChange={handleAvatar}
      />
      <button type="submit">Confirm</button>
      <ToastContainer
              position="bottom-right"
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
    </form>
  );
};

export default Settings;
