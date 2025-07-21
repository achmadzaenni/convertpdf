import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) =>
    location.pathname === path
      ? "text-white bg-blue-700 md:bg-transparent md:text-blue-700 md:font-semibold md:border-b-2 md:border-blue-700"
      : "text-gray-400 dark:text-white hover:bg-gray-700 hover:border hover:border-white md:hover:bg-transparent md:hover:text-blue-700 md:border-0";

  const handleToggle = () => setMenuOpen((prev) => !prev);

  const handleNavClick = (path) => {
    navigate(path);
    setMenuOpen(false);
  };
const handleLogout = () => {
  toast.warn(() => (
    <div>
      <p className="mb-2 font-semibold">Apakah ingin keluar?</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            toast.dismiss("logout-confirmation");
            toast.success("Berhasil logout", {
              position: "top-right",
              icon: "success",
              autoClose: 3000,
            });
            localStorage.removeItem("token");
            setTimeout(() => {
              navigate("/");
            }, 1200);
          }}
          className="text-white px-3 py-1 rounded text-sm flex items-left gap-1"
        >
          ✔️
        </button>
      </div>
    </div>
  ), {
    position: "top-right",
    autoClose: false,
    closeOnClick: false,
    closeButton: true,
    draggable: false,
    icon: "warning",
    toastId: "logout-confirmation",
  });
};


  return (
    <nav className="bg-gray-900 fixed top-0 left-0 w-full z-50 border-b border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white">
        {/* Logo */}
        <div
          onClick={() => navigate("/dashboard")}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <img
            src="/static/assets/logo.png"
            className="w-10 h-10 text-white p-1 bg-indigo-500 rounded-full"
            alt="Logo"
          />
          <span className="text-2xl font-semibold text-white hidden sm:inline">
            Converter
          </span>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex flex-row items-center space-x-8 text-white text-sm font-medium">
          {[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Convert", path: "/convert" },
            { label: "Data", path: "/data" },
          ].map((item) => (
            <li key={item.path}>
              <button
                onClick={() => handleNavClick(item.path)}
                className={`px-3 py-2 rounded transition duration-200 ${isActive(
                  item.path
                )}`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Logout + Mobile Toggle */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
              onClick={handleLogout}
            className="hidden md:block text-white bg-gray-700 hover:bg-gray-800 font-medium rounded px-4 py-2 text-sm w-fit sm:w-auto whitespace-nowrap"
          >
            Log Out
          </button>
          <button
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-400 rounded-lg md:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
            onClick={handleToggle}
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-200 ${
          menuOpen ? "block" : "hidden"
        } bg-gray-800 w-full`}
      >
        <ul className="flex flex-col text-white text-sm font-medium p-4 space-y-2">
          {[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Convert", path: "/convert" },
            { label: "Data", path: "/data" },
          ].map((item) => (
            <li key={item.path}>
              <button
                onClick={() => handleNavClick(item.path)}
                className={`block w-full text-left px-3 py-2 rounded ${isActive(
                  item.path
                )}`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex justify-end p-4 border-t border-gray-700">
          <button
              onClick={handleLogout}
            className="px-3 py-2 rounded text-white bg-gray-700 hover:bg-gray-800 font-medium"
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
