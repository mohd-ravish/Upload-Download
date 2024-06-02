import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Axios from "axios";

function Login() {
    const navigate = useNavigate();
    const [signupSection, setSignupSection] = useState(false);
    const [userSignupData, setUserSignupData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [userLoginData, setUserLoginData] = useState({
        email: "",
        password: "",
    })

    const handleSignupChange = (e) => {
        const { value, name } = e.target
        setUserSignupData((prev) => {
            return {
                ...prev, [name]: value
            }
        })
    }

    const handleLoginChange = (e) => {
        const { value, name } = e.target
        setUserLoginData((prev) => {
            return {
                ...prev, [name]: value
            }
        })
    }

    const handleSignupSubmit = async (event) => {
        event.preventDefault();
        if (Object.values(userSignupData).every(value => value.length > 0)) {
            await Axios.post("http://localhost:4500/signup", userSignupData)
                .then(res => {
                    if (res.data === "User registered") {
                        toast.success("User registered!", {
                            position: "top-center"
                        })
                        setSignupSection(false)
                        setUserSignupData({
                            email: "",
                            password: "",
                            confirmPassword: "",
                        })
                    }
                    else if (res.data === "Password and confirm password do not match") {
                        toast.error("Password and confirm password do not match!", {
                            position: "top-center"
                        })
                        setUserSignupData({
                            email: "",
                            password: "",
                            confirmPassword: "",
                        })
                    } else {
                        toast.error("Email already in use!", {
                            position: "top-center"
                        })
                        setUserSignupData({
                            email: "",
                            password: "",
                            confirmPassword: "",
                        })
                    }
                })
        }
    }

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        if (Object.values(userLoginData).every(value => value.length > 0)) {
            await Axios.post("http://localhost:4500/login", userLoginData)
                .then(res => {
                    if (res.data === "User not found") {
                        toast.error("User not found!", {
                            position: "top-center"
                        })
                        setUserLoginData({
                            email: "",
                            password: "",
                        })
                    }
                    else if (res.data === "Incorrect password") {
                        toast.error("Incorrect password!", {
                            position: "top-center"
                        })
                        setUserLoginData({
                            email: "",
                            password: "",
                        })

                    } else {
                        localStorage.setItem("token", res.data.token);
                        navigate("/download");
                    }
                })
        }
    }

    return (
        <div className="user-login-page">
            <div>
                <ToastContainer />
                <div class="form">
                    {signupSection ? (
                        <form action="" onSubmit={handleSignupSubmit}>
                            <h2>SignUp</h2>
                            <p>Email</p>
                            <input name="email" type="email" value={userSignupData.email} placeholder="Enter Email" onChange={handleSignupChange} autoComplete="off" required />
                            <p>Password</p>
                            <input name="password" type="password" value={userSignupData.password} placeholder="Enter Password" onChange={handleSignupChange} autoComplete="off" required />
                            <p>Confirm Password</p>
                            <input name="confirmPassword" type="password" value={userSignupData.confirmPassword} placeholder="Confirm Password" onChange={handleSignupChange} autoComplete="off" required />
                            <button type="submit">SignUp</button><br></br>
                            <m>Already registered? <m class="mssg" onClick={() => { setSignupSection(false) }} >Login</m></m>
                        </form>
                    ) : (
                        <form action="" onSubmit={handleLoginSubmit}>
                            <h2>Login</h2>
                            <p>Email</p>
                            <input name="email" type="email" value={userLoginData.email} placeholder="Enter Email" onChange={handleLoginChange} autoComplete="off" required />
                            <p>Password</p>
                            <input name="password" type="password" value={userLoginData.password} placeholder="Enter Password" onChange={handleLoginChange} autoComplete="off" required />
                            {/* <button type="submit" className="login-button">Login</button> */}
                            <button type="submit">Login</button><br></br>
                            <m>Not registered? <m class="mssg" onClick={() => { setSignupSection(true) }} >Create an account</m></m>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;