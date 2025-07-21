import React, { useEffect } from "react";
import Swal from "sweetalert2";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";

const Dashboard = ({ user }) => {
useEffect(() => {
  const MySwal = Swal.mixin({});
  document.title = "Dashboard - PDF to SQL Converter";

  gsap.from(".content-left", {
    opacity: 0,
    x: -50,
    duration: 0.8,
    delay: 0.2,
  });
  gsap.from(".content-right", {
    opacity: 0,
    x: 50,
    duration: 0.8,
    delay: 0.2,
  });

  if (user) {
    MySwal.fire({
      title: `Welcome, ${user.usernm || "User"}!`,
      text: "Selamat datang di PDF to SQL Converter!",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  }
}, [user]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-white">
      <Navbar />
      <section className="text-gray-600 body-font">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <div className="content-left lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
              PDF to SQL <br className="hidden lg:inline-block" /> Data Extraction Tool
            </h1>
            <p className="mb-8 leading-relaxed text-left text-justify">
              Alat ini mengambil data dari PDF dan mengubahnya ke format SQL.
              Cocok untuk dokumen hasil scan menggunakan OCR, dengan hasil yang bersih dan siap pakai.
            </p>
            <div className="flex justify-center">
              <a
                href="/convert"
                className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
              >
                Convert
              </a>
              <button
                className="ml-4 inline-flex text-gray-700 bg-gray-100 border-0 py-2 px-6 focus:outline-none hover:bg-gray-200 rounded text-lg"
              >
                Get Apps
              </button>
            </div>
          </div>
          <div className="content-right lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
            <img src="/static/assets/jumbroton.svg" alt="Jumbotron" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
