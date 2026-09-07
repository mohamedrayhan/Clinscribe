import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import NewConsultation from './pages/NewConsultation';
import AudioConsultation from './pages/AudioConsultation';
import TextConsultation from './pages/TextConsultation';
import Login from './pages/Login';
import Patients from './pages/Patients';
import PatientProfile from './pages/PatientProfile';
import History from './pages/History';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-text-secondary text-sm">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3"></div>
        <span>Verifying clinical credentials...</span>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientProfile />} />
            <Route path="consultations/new" element={<NewConsultation />} />
            <Route path="consultations/new/audio" element={<AudioConsultation />} />
            <Route path="consultations/new/text" element={<TextConsultation />} />
            <Route path="records" element={<History />} />
            <Route path="history" element={<Navigate to="/records" replace />} />
            <Route path="safety-review" element={<Navigate to="/" replace />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
