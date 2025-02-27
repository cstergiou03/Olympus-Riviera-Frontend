import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/loginModal.css";
import { useAuth } from "../Context/AuthContext";

function LoginModal({ isOpen, onClose, setLoggedIn }) {
    const [googleError, setGoogleError] = useState("");
    const googleSignInButtonRef = useRef(null);
    const googleSignUpButtonRef = useRef(null);

    const navigate = useNavigate();
    const { login } = useAuth();
    const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);

    useEffect(() => {
        if (!window.google || !window.google.accounts) {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = () => {
                setIsGoogleScriptLoaded(true);
            };
            document.body.appendChild(script);
        } else {
            setIsGoogleScriptLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (isOpen && isGoogleScriptLoaded) {
            initializeGoogleButtons();
        }
    }, [isOpen, isGoogleScriptLoaded]);

    const initializeGoogleButtons = () => {
        if (googleSignInButtonRef.current) {
            googleSignInButtonRef.current.innerHTML = "";
            window.google.accounts.id.initialize({
                client_id: "8002692462-0m4n72frcfp3obipnla4297prlmgs2rm.apps.googleusercontent.com",
                callback: handleGoogleSignIn,
            });
            window.google.accounts.id.renderButton(
                googleSignInButtonRef.current,
                { theme: "outline", size: "large", text: "signin_with" }
            );
        }

        if (googleSignUpButtonRef.current) {
            googleSignUpButtonRef.current.innerHTML = "";
            window.google.accounts.id.initialize({
                client_id: "8002692462-0m4n72frcfp3obipnla4297prlmgs2rm.apps.googleusercontent.com",
                callback: handleGoogleSignUp,
            });
            window.google.accounts.id.renderButton(
                googleSignUpButtonRef.current,
                { theme: "outline", size: "large", text: "signup_with" }
            );
        }
    };

    const handleGoogleSignIn = async (response) => {
        if (response.credential) {
            try {
                const jwt_token = response.credential;
                localStorage.setItem("googleCredential", jwt_token); // Αποθήκευση στο localStorage
                
                const apiResponse = await fetch("https://discover-hellas-springboot-backend.onrender.com/api/user/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ jwt_token }),
                });
    
                const data = await apiResponse.json();
                if (apiResponse.ok) {
                    login(data.jwt_token);
                    sessionStorage.setItem("loggedIn", "true");
                    location.reload();
                    onClose();
                } else {
                    const role = "REGISTERED";
                    const requestBody = { jwt_token, role };
    
                    const registerResponse = await fetch(
                        "https://discover-hellas-springboot-backend.onrender.com/api/user/register",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(requestBody),
                        }
                    );
    
                    if (registerResponse.ok) {
                        const registerData = await registerResponse.json();
                        login(registerData.jwt_token);
                        sessionStorage.setItem("userToken", registerData.jwt_token);
                        sessionStorage.setItem("loggedIn", "true");
                        location.reload();
                        onClose();
                    } else {
                        setGoogleError("Registration failed. Please try again.");
                    }
                }
            } catch (error) {
                console.error("Login error:", error);
                setGoogleError("Something went wrong with Google login. Please try again.");
            }
        } else {
            setGoogleError("Something went wrong with Google login. Please try again.");
        }
    };            

    const handleGoogleSignUp = async (response) => {
        if (response.credential) {
            const jwt_token = response.credential;
            localStorage.setItem("googleCredential", jwt_token); // Αποθήκευση στο localStorage
            const role = "PROVIDER";
            const requestBody = { jwt_token, role };

            try {
                const apiResponse = await fetch(
                    "https://discover-hellas-springboot-backend.onrender.com/api/user/register",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestBody),
                    }
                );

                const data = await apiResponse.json();
                if (apiResponse.ok) {
                    sessionStorage.setItem("userToken", data.jwt_token);
                    sessionStorage.setItem("loggedIn", "true");
                    login(data.jwt_token);
                    alert("Ο χρήστης δημιουργήθηκε με επιτυχία μπορείτε πλέον να συνδεθείτε");
                } else {
                    setGoogleError("Registration failed. Please try again.");
                }
            } catch (error) {
                console.error("Sign-Up error:", error);
                setGoogleError("Something went wrong during registration. Please try again.");
            }
        } else {
            setGoogleError("Something went wrong during registration. Please try again.");
        }
    };

    return (
        isOpen && (
            <div className="login-modal-overlay">
                <div className="login-modal-content">
                    <button className="close-btn" onClick={onClose}>X</button>
                    <h2>Σύνδεση</h2>
                    <div ref={googleSignInButtonRef}></div>

                    <h2 style={{ marginTop: "20px" }}>Εγγραφή σαν Πάροχος</h2>
                    <div ref={googleSignUpButtonRef}></div>

                    {googleError && <p style={{ color: "red" }}>{googleError}</p>}
                </div>
            </div>
        )
    );
}

export default LoginModal;
