import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from './config/api';

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '', visible: false });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  const showAlert = (message, type = 'danger') => {
    setAlert({ message, type, visible: true });
    setTimeout(() => setAlert({ ...alert, visible: false }), 1500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { username, password } = form;
    if (!username && !password) return showAlert('Username dan password tidak boleh kosong!', 'danger');
    if (!username) return showAlert('Username tidak boleh kosong!', 'danger');
    if (!password) return showAlert('Password tidak boleh kosong!', 'danger');

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        const msg = err?.msg || 'Terjadi kesalahan saat login.';
        const type = res.status >= 500 ? 'danger' : res.status >= 400 ? 'warning' : 'info';
        return showAlert(msg, type);
      }

      showAlert('Login berhasil!', 'success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } catch (error) {
      showAlert('Gagal terhubung ke server.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const google = () => {
    Swal.fire({
      title: 'Google Login',
      text: 'Fitur ini belum tersedia.\nMohon tunggu pembaruan selanjutnya.',
      icon: 'info',
      confirmButtonText: 'OK',
    });
  };

  const facebook = () => {
    Swal.fire({
      title: 'Facebook Login',
      text: 'Fitur ini belum tersedia.\nMohon tunggu pembaruan selanjutnya.',
      icon: 'info',
      confirmButtonText: 'OK',
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg relative">
        {alert.visible && (
          <div
            className={`absolute top-0 left-0 w-full p-3 text-white text-sm font-medium rounded-t-md ${
              alert.type === 'success'
                ? 'bg-green-500'
                : alert.type === 'warning'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            } animate-bounce-in`}
          >
            {alert.message}
          </div>
        )}

        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm text-gray-600 mb-1">Username</label>
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
            <label htmlFor="password" className="block text-sm text-gray-600 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
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
                <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`} />
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={!form.username || !form.password || loading}
            className={`w-full bg-indigo-500 text-white py-2 rounded-md flex items-center justify-center gap-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-600'
            } transition duration-200`}
            title={!form.username || !form.password ? 'Mohon isi dahulu form-nya' : ''}
          >
            {!loading ? (
              <span>Login</span>
            ) : (
              <img
                src="/static/assets/Animation.gif"
                alt="loading"
                className="w-6 h-6"
              />
            )}
          </button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-2 text-gray-500 text-sm">Login dengan akun social media</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={google}
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-200"
          >
            <i className="bi bi-google me-1"></i>
            <span className="hidden sm:inline">Google</span>
          </button>
          <button
            onClick={facebook}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            <i className="bi bi-facebook me-1"></i>
            <span className="hidden sm:inline">Facebook</span>
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500 font-semibold">© 2025 Yoma Solutions</p>
    </div>
  );
};

export default LoginPage;
