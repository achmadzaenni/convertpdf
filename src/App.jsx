import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Convert from "./pages/Convert";
import Data from "./pages/Data";
import LoginPage from "./LoginPage";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path="/convert" element={<Convert />} />
        <Route path="/data" element={<Data />} />
      </Routes>
    </Router>

    <ToastContainer 
    position="top-right"  // ✅ Pojok kanan atas
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"/>
        </>
  );
}

export default App;
