import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Helmet } from "react-helmet";
import { API_BASE } from "./config/api";

const LoginPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "", visible: false });
  const [showPassword, setShowPassword] = useState(false);
  const alertRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  const showAlert = (message, type = "danger") => {
    setAlert({ message, type, visible: true });
    setTimeout(() => {
      if (alertRef.current) {
        gsap.to(alertRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.4,
          onComplete: () => {
            setAlert({ message: "", type: "", visible: false });
          },
        });
      }
    }, 1500);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
    if (alert.visible && alertRef.current) {
      gsap.fromTo(
        alertRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "bounce.out" }
      );
    }
  }, [alert.visible]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { username, password } = form;

    if (!username && !password)
      return showAlert("Username dan password tidak boleh kosong!", "danger");
    if (!username) return showAlert("Username tidak boleh kosong!", "danger");
    if (!password) return showAlert("Password tidak boleh kosong!", "danger");

    setLoading(true);

    try {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.msg || "Terjadi kesalahan saat login.";
    const type =
      res.status >= 500 ? "danger" : res.status >= 400 ? "warning" : "info";
    return showAlert(msg, type);
  }

  if (data.token) {
    localStorage.setItem("token", data.token);
    console.log("Token saved:", data.token);
  } else {
    return showAlert("Login berhasil tapi token tidak diterima.", "warning");
  }

  showAlert("Login berhasil!", "success");
  setTimeout(() => navigate("/dashboard"), 1500);
} catch (error) {
  showAlert("Gagal terhubung ke server.", "danger");
} finally {
  setLoading(false);
}
  };

  const google = () => {
    Swal.fire({
      title: "Google Login",
      text: "Fitur ini belum tersedia.\nMohon tunggu pembaruan selanjutnya.",
      icon: "info",
      confirmButtonText: "OK",
    });
  };

  const facebook = () => {
    Swal.fire({
      title: "Facebook Login",
      text: "Fitur ini belum tersedia.\nMohon tunggu pembaruan selanjutnya.",
      icon: "info",
      confirmButtonText: "OK",
    });
  };

  return (
    <>
      <Helmet>
        <title>Ocr Convert - Sign Up</title>
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 relative">
        {alert.visible && (
          <div
            ref={alertRef}
            className={`fixed top-6 transform z-9999 w-fit max-w-full px-6 py-3 rounded-md text-white text-sm font-medium text-center shadow-lg
            ${
              alert.type === "success"
                ? "bg-green-500"
                : alert.type === "warning"
                ? "bg-yellow-500"
                : "bg-red-500"
            }
          `}
          >
            {alert.message}
          </div>
        )}

        <div className="card-auth flex flex-col md:flex-col lg:flex-row w-full max-w-5xl bg-white shadow-md rounded-xl overflow-hidden lg:max-w-4xl md:max-w-2xl sm:w-full">
          <div className="hidden lg:block lg:w-1/2">
            <img
              src="/static/assets/login.svg"
              alt="Login Image"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-full lg:w-1/2 p-8">
            <h2 className="text-gray-900 text-2xl font-semibold mb-2 text-center">
              Login - <span className="text-indigo-600">Sign Up</span>
            </h2>
            <p className="leading-relaxed mb-5 text-gray-600 text-center">
              Masukan user dan password untuk login
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="@username"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="•••••••"
                  />
                  <span
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                    onClick={togglePassword}
                  >
                    <i
                      className={`bi ${
                        showPassword ? "bi-eye" : "bi-eye-slash"
                      }`}
                    />
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                  !form.username || !form.password
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={!form.username || !form.password}
                title={
                  !form.username && !form.password
                    ? "username and password has not been entered"
                    : !form.username
                    ? "username has not been entered"
                    : !form.password
                    ? "password has not been entered"
                    : ""
                }
              >
                Sign Up
              </button>
            </form>

            <div className="flex items-center my-4">
              <hr className="flex-grow border-t border-gray-300" />
              <span className="mx-2 text-gray-500 text-sm">
                Login dengan akun social media
              </span>
              <hr className="flex-grow border-t border-gray-300" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={google}
                className="w-full bg-indigo-400 text-white py-2 rounded-md hover:bg-indigo-500 transition duration-200"
              >
                <i className="bi bi-google me-1"></i> Google
              </button>
              <button
                onClick={facebook}
                className="w-full bg-indigo-400 text-white py-2 rounded-md hover:bg-indigo-500 transition duration-200"
              >
                <i className="bi bi-facebook me-1"></i> Facebook
              </button>
            </div>
          </div>
        </div>

        <p className="copyright mt-3 font-semibold font-sans text-center">
          Copyright © 2025 Yoma Solutions
        </p>

        <div className="custom-shape-divider-bottom-1752462819 absolute bottom-0 w-full">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
              className="shape-fill"
            ></path>
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
              className="shape-fill"
            ></path>
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
