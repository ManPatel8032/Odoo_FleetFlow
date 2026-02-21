import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/Login';
import ProtectedRoute from './components/ProtectedRoute';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* example protected route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div>Dashboard (private)</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);
