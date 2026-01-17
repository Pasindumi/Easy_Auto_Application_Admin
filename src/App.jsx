import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard/Index';
import VehicleTypes from './pages/VehicleTypes/Index';
import VehicleTypeDetails from './pages/VehicleTypes/Details';
import Ads from './pages/Ads/Index';
import SystemLimits from './pages/Settings/SystemLimits';
import PricingPage from './pages/PricingPage';
import DiscountsPage from './pages/DiscountsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicle-types" element={<VehicleTypes />} />
            <Route path="/vehicle-types/:id" element={<VehicleTypeDetails />} />
            <Route path="/ads" element={<Ads />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/discounts" element={<DiscountsPage />} />
            <Route path="/settings/limits" element={<SystemLimits />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
