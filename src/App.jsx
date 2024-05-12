import React, { useEffect, useState } from "react";
import "./App.css";
import heroimg from "./assets/hero-image.png";
import Cookies from "universal-cookie";
import "remixicon/fonts/remixicon.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import googleIcon from "./assets/icons8-google.svg";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, db, provider} from "./Components/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import CurrentUserPage from "./Components/CurrentUser/CurrentUser";
import { GoogleAuthProvider } from "firebase/auth/cordova";

function App() {
  const cookies = new Cookies();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [currentForm, setCurrentForm] = useState("login");
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [userdata, setuserdata] = useState("")

  // Modify this line to destructure the object returned from useUserStore



  const switchToSignup = () => {
    setCurrentForm("signup");
  };

  const switchToLogin = () => {
    setCurrentForm("login");
  };

  const handleGoogleSignin = async (e) => {
    e.preventDefault();
    try {
      // const auth = getAuth();
      // const provider = new GoogleAuthProvider();
      const response = await signInWithPopup(auth, provider);
      cookies.set("auth-token", response._tokenResponse.refreshToken);

      toast.success("Successfully Logged In");
      setIsAuth(true);
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    if (email.length === 0 || password.length === 0) {
      toast.warning("Please fill all the fields");
    } else {
      try {
        const response = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        // setuserdata(response);
      
        cookies.set("auth-token", response._tokenResponse.refreshToken);
        toast.success("Successfully Logged In");
        // console.log(response.user.uid)
        setuserdata(response.user.uid);
        console.log(userdata)

        setIsAuth(true);
      } catch (error) {
        toast.error(`${error}`);
      }
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    if (email.length === 0 || password.length === 0 || username.length === 0) {
      toast.warning("Please fill all the fields");
    } else {
      try {
        const response = await createUserWithEmailAndPassword(auth, email, password);
        setuserdata(response.user.uid);


        await setDoc(doc(db, "users", response.user.uid), {
          username,
          email,
          id: response.user.uid,
          blocked: [],
        });
        await setDoc(doc(db, "userchats", response.user.uid), {
          chats:[]
             });
        toast.success(`Congratulations, You're Successfully Registered`);
      } catch (error) {
        toast.error(`Error during sign-up: ${error.message}`);
      }
    }
  };


  if (isAuth) {
    return <CurrentUserPage authUser={userdata} />;
  } else {
    return (
      <div id="main">
        <div id="hero">
          <div id="hero-content">
            <div id="blur-circle"></div>
            <h1>Synced</h1>
            <h5>Your Hub for Group Messaging 💬</h5>
            <p>
              Connect and collaborate effortlessly with Synced Messaging. Create
              public or private groups, chat in real-time, and stay synchronized
              with your teams, friends, and communities. 🚀
            </p>
            <img src={heroimg} alt="hero image" id="hero-image" />
          </div>
          <div id="hero-form">
            {currentForm === "login" && (
              <form
                id="loginform"
                className="container"
                onSubmit={handleLoginSubmit}
              >
                <h1>Welcome Back</h1>
                <input
                  className="inputs"
                  type="text"
                  placeholder="Email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className="inputs"
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button className="login-btn" type="submit">
                  Log in
                </button>
                <p>OR</p>
                <button className="login-btn" onClick={handleGoogleSignin}>
                  <img src={googleIcon} alt="googleicon" />
                  Log in with Google
                </button>
                <h4>
                  Don't have an account?{" "}
                  <a href="#" onClick={switchToSignup}>
                    Signup
                  </a>
                </h4>
              </form>
            )}
            {currentForm === "signup" && (
              <form
                id="signup"
                className="container"
                onSubmit={handleSignupSubmit}
              >
                <h1>Create an Account</h1>
                <input
                  className="inputs"
                  type="text"
                  placeholder="Name"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  className="inputs"
                  type="text"
                  placeholder="Email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className="inputs"
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button className="login-btn" type="submit">
                  Sign up
                </button>
                <p>OR</p>
                <button className="login-btn" onClick={handleGoogleSignin}>
                  <img src={googleIcon} alt="googleicon" /> Sign up with Google
                </button>
                <h4>
                  Already have an account?{" "}
                  <a href="#" onClick={switchToLogin}>
                    Login
                  </a>
                </h4>
              </form>
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
        </div>
      </div>
    );
  }
}

export default App;