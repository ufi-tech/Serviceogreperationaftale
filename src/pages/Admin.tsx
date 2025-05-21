import React, { useState, useEffect } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { FaLock, FaUnlock, FaUserCog } from 'react-icons/fa';
import AdminDashboard from '../admin/AdminDashboard';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // I en rigtig applikation ville du tjekke om brugeren er autentificeret ved komponent mount
  useEffect(() => {
    // Simulerer tjek af local storage eller en token
    const savedAuth = localStorage.getItem('admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simpel autentificering til demo
    if (username === 'admin' && password === 'password') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
    } else {
      setError('Ugyldigt brugernavn eller adgangskode');
    }
    
    // Ryd felter
    setUsername('');
    setPassword('');
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
      {/* Admin Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Administrationspanel</h1>
        
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FaUnlock className="mr-2" />
            Log ud
          </button>
        ) : null}
      </div>
      
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-md p-6">
          <div className="text-center mb-6">
            <FaUserCog className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-xl font-semibold text-gray-900">Admin Login</h2>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Brugernavn
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={handleInputChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Adgangskode
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleInputChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaLock className="mr-2" />
              Log ind
            </button>
          </form>
        </div>
      ) : (
        <div>
          <AdminDashboard />
        </div>
      )}
    </div>
  );
};

export default Admin;
