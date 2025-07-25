import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Helmet } from "react-helmet";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config/api";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const contentLeftRef = useRef(null);
  const contentRightRef = useRef(null);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      axios
        .get(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        })
        .then((res) => {
          setUser(res.data);
        })
        .catch((err) => {
          console.error("Gagal ambil user:", err);
          navigate("/");
        });
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Ocr Convert - Dashboard</title>
      </Helmet>
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-white py-8">
        <Navbar />
        <section className="text-gray-600 body-font w-full">
          <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
            <div
              ref={contentLeftRef}
              className="content-left lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center"
            >
              <Navbar />
              <h2 className="text-lg font-semibold text-indigo-800 mb-2">
                {user?.usernm
                  ? `Welcome, ${user.usernm
                      .toLowerCase()
                      .replace(/\b\w/g, (char) => char.toUpperCase())}!`
                  : "Loading user data..."}
              </h2>

              <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
                PDF to SQL <br className="hidden lg:inline-block" /> Data
                Extraction Tool
              </h1>
              <p className="mb-8 leading-relaxed text-left text-justify">
                Proyek ini bertujuan untuk membuat alat yang bisa mengambil data
                dari dokumen PDF dan mengubahnya ke format yang bisa digunakan
                di SQL. Karena beberapa PDF berbentuk gambar atau hasil scan,
                kita mungkin perlu menggunakan OCR (Optical Character
                Recognition) serta teknik untuk membersihkan dan menyusun data
                yang diambil.
              </p>

              <div className="flex justify-center">
                <button
                  onClick={() => navigate("/convert")}
                  className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                >
                  Convert
                </button>
                <button className="ml-4 inline-flex text-gray-700 bg-gray-100 border-0 py-2 px-6 focus:outline-none hover:bg-gray-200 rounded text-lg">
                  Get Apps
                </button>
              </div>
            </div>

            <div
              ref={contentRightRef}
              className="content-right lg:max-w-lg lg:w-full md:w-1/2 w-5/6"
            >
              <img
                className="object-cover object-center rounded"
                alt="hero"
                src="/static/assets/jumbroton.svg"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
