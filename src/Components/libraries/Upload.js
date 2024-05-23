import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const upload = async (file) => {
  if (file.type !== "image/jpeg" && file.type !== "image/png") {
    console.error("Unsupported file type. Please upload a JPG or PNG image.");
    return;
  }
  const storage = getStorage();
  const date = new Date();
  const storageRef = ref(storage, `Images/${date + file.name}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

      },
      (error) => {
        reject("Something error: " + error.code); // Error message corrected
        // Handle unsuccessful uploads
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
}

export default upload;
