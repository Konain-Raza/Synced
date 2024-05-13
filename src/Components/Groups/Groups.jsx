import React, { useState } from 'react';
import { db } from '../firebase-config'; // Adjust the import path based on your project structure
import "./group.css"
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";

const Groups = ({ currentUser }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [groups, setGroups] = useState([]); // State to store groups

  const handleCreateGroup = async () => {
    try {
      const groupData = {
        name: groupName,
        description: groupDescription,
        creator: currentUser.id,
        members: [currentUser.id],
        createdAt: new Date(),
        lastMessage: '',
      };

      // Add the new group to the "groups" collection in Firestore
      const docRef = await addDoc(collection(db, "groups"), groupData);
      
      // Reset form fields after successful group creation
      setGroupName('');
      setGroupDescription('');

      console.log('Group created successfully with ID: ', docRef.id);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  // Function to handle searching groups
  const handleSearchGroups = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'groups'));
      const groupsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter groups based on search input
      const filteredGroups = groupsData.filter(group =>
        group.name.toLowerCase().includes(searchInput.toLowerCase())
      );
      
      setGroups(filteredGroups);
    } catch (error) {
      console.error('Error searching for groups:', error);
    }
  };

  // Function to handle joining a group
  const handleJoinGroup = async (groupId) => {
    try {
      const groupRef = doc(collection(db, 'groups'), groupId);

      // Update the members array to include the current user
      await updateDoc(groupRef, {
        members: [...groups.find(group => group.id === groupId).members, currentUser.id]
      });

      console.log('Joined group successfully');
      // Redirect or perform any other action after joining the group
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  return (
    <div id='groups'>
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <textarea
        placeholder="Group Description"
        value={groupDescription}
        onChange={(e) => setGroupDescription(e.target.value)}
      />
      <button onClick={handleCreateGroup}>Create Group</button>

      <div>
        <input
          type="text"
          placeholder="Search Groups"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button onClick={handleSearchGroups}>Search</button>
      </div>

      {/* Display the list of groups */}
      {groups.length > 0 && (
        <div>
          <h2>Groups:</h2>
          <ul>
            {groups.map((group) => (
              <li key={group.id}>
                <p>{group.name}</p>
                <button id='joingroup-btn' onClick={() => handleJoinGroup(group.id)}>Join</button>
                {/* Add other details of the group as needed */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Groups;
