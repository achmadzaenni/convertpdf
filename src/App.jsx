import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Convert from "./pages/Convert";
import Data from "./pages/Data";
import LoginPage from "./LoginPage";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<LoginPage setUser={setUser} />} />
          <Route path='/dashboard' element={<Dashboard user={user} />} />
          <Route path="/convert" element={<Convert />} />
          <Route path="/data" element={<Data />} />
        </Routes>
      </Router>

      <ToastContainer 
        position="top-right"
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
}

export default App;
