import React, { useState } from 'react';
import "./Register.css";
import "../assets/style.css";
import "../assets/bootstrap.min.css";
import Header from '../Header/Header';
import person_icon from "../assets/person.png";
import email_icon from "../assets/email.png";
import password_icon from "../assets/password.png";
import confirm_icon from "../assets/password confirm.png";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const register = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("The passwords do not match.");
      return;
    }

    const res = await fetch("/djangoapp/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "userName": userName,
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "password": password,
      }),
    });

    const json = await res.json();
    if (json.status != null && json.status === "Authenticated") {
      sessionStorage.setItem('username', json.userName);
      sessionStorage.setItem('firstname', firstName);
      sessionStorage.setItem('lastname', lastName);
      window.location.href = "/";
    } else {
      alert("The user could not be registered. " + (json.error || ""));
    }
  };

  return (
    <div>
      <Header />
      <div className="register_container">
        <h1 className="header">Sign-up</h1>
        <form className="inputs" onSubmit={register}>
          <div className="input">
            <img src={person_icon} className="img_icon" alt="Username" />
            <input type="text" name="username" placeholder="Username"
              className="input_field" onChange={(e) => setUserName(e.target.value)} />
          </div>
          <div className="input">
            <img src={person_icon} className="img_icon" alt="First Name" />
            <input type="text" name="firstname" placeholder="First Name"
              className="input_field" onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="input">
            <img src={person_icon} className="img_icon" alt="Last Name" />
            <input type="text" name="lastname" placeholder="Last Name"
              className="input_field" onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="input">
            <img src={email_icon} className="img_icon" alt="Email" />
            <input type="email" name="email" placeholder="Email"
              className="input_field" onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="input">
            <img src={password_icon} className="img_icon" alt="Password" />
            <input type="password" name="psw" placeholder="Password"
              className="input_field" onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="input">
            <img src={confirm_icon} className="img_icon" alt="Confirm Password" />
            <input type="password" name="psw-confirm" placeholder="Confirm Password"
              className="input_field" onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <div className="submit_panel">
            <button type="submit" className="submit">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
