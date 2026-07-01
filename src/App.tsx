import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/explorar" element={<ExplorePage />} />
      <Route path="/perfil" element={<ProfilePage />} />
      <Route path="/inicio" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

