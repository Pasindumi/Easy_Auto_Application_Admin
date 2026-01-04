import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for token
        const token = localStorage.getItem('adminToken');
        const adminData = localStorage.getItem('adminData');
        if (token && adminData) {
            setAdmin(JSON.parse(adminData));
        }
        setLoading(false);
    }, []);

    const login = (data, token) => {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(data));
        setAdmin(data);
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ admin, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
