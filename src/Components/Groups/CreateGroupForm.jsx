// CreateGroupForm.js
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase-config";

const CreateGroupForm = ({ currentUser }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !groupDescription.trim() || groupMembers.length === 0) {
      return; // Validate input fields
    }

    try {
      const chatRef = collection(db, "chats");
      const newChatRef = await addDoc(chatRef, {
        groupName,
        groupDescription,
        createdAt: serverTimestamp(),
        messages: [],
        members: groupMembers.concat(currentUser.id), // Include current user as member
      });

      console.log("Group created:", newChatRef.id);
      // Clear form fields after successful creation
      setGroupName('');
      setGroupDescription('');
      setGroupMembers([]);
    } catch (error) {
      console.log("Error creating group:", error);
    }
  };

  return (
    <div>
      <h3>Create New Group</h3>
      <input type="text" placeholder="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
      <textarea placeholder="Group Description" value={groupDescription} onChange={(e) => setGroupDescription(e.target.value)} />
      {/* Input field for adding members */}
      <button onClick={handleCreateGroup}>Create Group</button>
    </div>
  );
};

export default CreateGroupForm;
