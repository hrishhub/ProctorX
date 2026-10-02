import { useState } from "react";
import "./StudentAuth.css";

const API_URL = import.meta.env.VITE_API_URL;

function StudentAuth({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (event) => {
    event.preventDefault();

    if (!loginData.email || !loginData.password) {
      setMessage("Please enter email and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Invalid email or password."
        );

        setLoading(false);
        return;
      }

      if (
        data.role &&
        data.role !== "student"
      ) {
        setMessage(
          "Please use a student account."
        );

        setLoading(false);
        return;
      }

      localStorage.setItem(
        "studentToken",
        data.access_token
      );

      if (data.user) {
        localStorage.setItem(
          "studentUser",
          JSON.stringify(data.user)
        );
      }

      onLogin(data.access_token);

    } catch {
      setMessage(
        "Backend is not running."
      );
    }

    setLoading(false);
  };

  const register = async (event) => {
    event.preventDefault();

    if (
      !registerData.name ||
      !registerData.email ||
      !registerData.password ||
      !registerData.confirmPassword
    ) {
      setMessage(
        "Please fill all the fields."
      );
      return;
    }

    if (
      registerData.password !==
      registerData.confirmPassword
    ) {
      setMessage(
        "Passwords do not match."
      );
      return;
    }

    if (registerData.password.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: registerData.name,
            email: registerData.email,
            password: registerData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail ||
            "Registration failed."
        );

        setLoading(false);
        return;
      }

      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setLoginData({
        email: registerData.email,
        password: "",
      });

      setMode("login");

      setMessage(
        "Registration successful. Please sign in."
      );

    } catch {
      setMessage(
        "Backend is not running."
      );
    }

    setLoading(false);
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setMessage("");
  };

  if (mode === "register") {
    return (
      <div className="student-auth-page">
        <div className="student-auth-card">

          <div className="student-auth-logo">
            P
          </div>

          <h1>
            Student Registration
          </h1>

          <p className="student-auth-subtitle">
            Create your examination account
          </p>

          <form onSubmit={register}>

            <label>
              Full Name
            </label>

            <input
              type="text"
              value={registerData.name}
              onChange={(event) =>
                setRegisterData({
                  ...registerData,
                  name: event.target.value,
                })
              }
              placeholder="Enter your full name"
            />

            <label>
              Email
            </label>

            <input
              type="email"
              value={registerData.email}
              onChange={(event) =>
                setRegisterData({
                  ...registerData,
                  email: event.target.value,
                })
              }
              placeholder="Enter your email"
            />

            <label>
              Password
            </label>

            <input
              type="password"
              value={registerData.password}
              onChange={(event) =>
                setRegisterData({
                  ...registerData,
                  password: event.target.value,
                })
              }
              placeholder="Enter password"
            />

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              value={
                registerData.confirmPassword
              }
              onChange={(event) =>
                setRegisterData({
                  ...registerData,
                  confirmPassword:
                    event.target.value,
                })
              }
              placeholder="Confirm password"
            />

            {message && (
              <div className="student-auth-message">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="student-auth-button"
              disabled={loading}
            >
              {loading
                ? "Registering..."
                : "Register"}
            </button>

          </form>

          <div className="student-auth-switch">
            Already registered?

            <button
              type="button"
              onClick={() =>
                changeMode("login")
              }
            >
              Sign In
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="student-auth-page">

      <div className="student-auth-card">

        <div className="student-auth-logo">
          P
        </div>

        <h1>
          Candidate Login
        </h1>

        <p className="student-auth-subtitle">
          Sign in to your examination portal
        </p>

        <form onSubmit={login}>

          <label>
            Email
          </label>

          <input
            type="email"
            value={loginData.email}
            onChange={(event) =>
              setLoginData({
                ...loginData,
                email: event.target.value,
              })
            }
            placeholder="Enter your email"
          />

          <label>
            Password
          </label>

          <input
            type="password"
            value={loginData.password}
            onChange={(event) =>
              setLoginData({
                ...loginData,
                password: event.target.value,
              })
            }
            placeholder="Enter your password"
          />

          {message && (
            <div className="student-auth-message">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="student-auth-button"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>

        </form>

        <div className="student-auth-switch">
          New student?

          <button
            type="button"
            onClick={() =>
              changeMode("register")
            }
          >
            Register Here
          </button>
        </div>

      </div>

    </div>
  );
}

export default StudentAuth;
