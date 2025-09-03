import React, { createContext, useContext, useState } from 'react';
import api from "../api/client";

const AuthContext = createContext();
export const useAuth = ()=> useContext(AuthContext);


export default function AuthProvider({children}){
    const [user,setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    const login = async(email,password)=>{
        const {data} = await api.post('/auth/login',{email,password});
        localStorage.setItem("token",data.token);
        localStorage.setItem("user",JSON.stringify(data.user));
        setUser(data.user);
    }

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      };
      const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        
      };

      return (
        <AuthContext.Provider
            value={{user,login,register,logout}}
        >
            {children}
        </AuthContext.Provider>
      )
}