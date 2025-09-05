import React, { createContext, useContext, useState } from 'react';
import api from "../api/client";
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const login = async (email, password) => {
    try {
      const { data, status } = await api.post('/auth/login', { email, password });
  
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
  
      if (status === 200) {
        setUser(data.user);
        return data.user; 
      }
  
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404 && error.response.data.message.includes("Register")) {
          toast.error("User does not exist. Please register first!");
        } else if (error.response.status === 404) {
          toast.error("Invalid credentials. Please try again!");
        } else if (error.response.status === 401) {
          toast.error("Unauthorized! Wrong password.");
        } else {
          toast.error(error.response.data.message || "Login failed!");
        }
      } else {
        toast.error("Network error. Try again later.");
      }
      return null;
    }
  };
  

  const register = async (name, email, password) => {
    try {
      const { data, status } = await api.post('/auth/register', { name, email, password });
  
      if (status === 201) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        toast.success("Registration successful! 🎉");
        return data.user;
      }
  
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          toast.error("Email already exists. Please login instead!");
        } else {
          toast.error(error.response.data.message || "Registration failed!");
        }
      } else {
        toast.error("Network error. Try again later.");
      }
      return null;
    }
  };
  

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success("Logout Successful");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
