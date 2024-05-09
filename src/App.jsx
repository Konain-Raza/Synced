import React, { useState } from "react";
import "./App.css";
import heroimg from "./assets/hero-image.png";
import Cookies from "universal-cookie";
import 'remixicon/fonts/remixicon.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import googleIcon from "./assets/icons8-google.svg";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, db, provider } from "./firebase-config.js";
import { doc, setDoc } from "firebase/firestore";
import CurrentUserPage from "./Components/CurrentUser.jsx";

function App() {
  const cookies = new Cookies();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [currentForm, setCurrentForm] = useState("login");
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  
  const switchToSignup = () => {
    setCurrentForm("signup");
  };

  const switchToLogin = () => {
    setCurrentForm("login");
  };

  const handleGoogleSignin = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      cookies.set("auth-token", response.user.auth.currentUser.stsTokenManager.refreshToken);
      toast.success("Successfully Logged In");
      setIsAuth(true);
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  const handleLoginSubmit = async () => {
    if (email.length === 0 || password.length === 0) {
      toast.warning("Please fill all the fields");
    } else {
      try {
        const response = await signInWithEmailAndPassword(auth, email, password);
        cookies.set("auth-token", response.user.auth.currentUser.stsTokenManager.refreshToken);
        toast.success("Successfully Logged In");
        setIsAuth(true);
      } catch (error) {
        toast.error(`${error}`);
      }

      setUsername("");
      setEmail("");
      setPassword("");
    }
  };

  const handleSignupSubmit = async () => {
    if (email.length === 0 || password.length === 0) {
      toast.warning("Please fill all the fields");
    } else {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success(`Congratulations, Your'e Successfully Registered`);
      } catch (error) {
        toast.error("Error during sign-up:", error.msg);
      }
    }
  };

  if (isAuth) {
    return <CurrentUserPage authUser={auth} />;
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
              <div id="loginform" className="container">
                <h1>Welcome Back</h1>
                <input
                  className="inputs"
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className="inputs"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button id="login-btn" onClick={handleLoginSubmit}>
                  Log in
                </button>
                <p>OR</p>
                <button id="login-btn" onClick={handleGoogleSignin}>
                  <img src={googleIcon} alt="googleicon" />
                  Log in with Google
                </button>
                <h4>
                  Don't have an account?{" "}
                  <a href="#" onClick={switchToSignup}>
                    Signup
                  </a>
                </h4>
              </div>
            )}
            {currentForm === "signup" && (
              <div id="signup" className="container">
                <h1>Create an Account</h1>
                <input
                  className="inputs"
                  type="text"
                  placeholder="Name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  className="inputs"
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className="inputs"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button id="login-btn" onClick={handleSignupSubmit}>
                  Sign up
                </button>
                <p>OR</p>
                <button id="login-btn" onClick={handleGoogleSignin}>
                  <img src={googleIcon} alt="googleicon" /> Sign up with Google
                </button>
                <h4>
                  Already have an account?{" "}
                  <a href="#" onClick={switchToLogin}>
                    Login
                  </a>
                </h4>
              </div>
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
              transition:Bounce
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
