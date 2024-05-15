import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const upload = async (file) => {
  const storage = getStorage();
  const date = new Date();
  const storageRef = ref(storage, `Images/${date + file.name}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

      },
      (error) => {
        reject("Something error: " + error.code); // Error message corrected
        // Handle unsuccessful uploads
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
}

export default upload;
