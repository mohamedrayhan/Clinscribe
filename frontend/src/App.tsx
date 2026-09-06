import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import NewConsultation from './pages/NewConsultation';
import AudioConsultation from './pages/AudioConsultation';
import TextConsultation from './pages/TextConsultation';
import SafetyReview from './pages/SafetyReview';
import Login from './pages/Login';
import Patients from './pages/Patients';
import PatientProfile from './pages/PatientProfile';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
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
            <Route path="records" element={<Navigate to="/patients" replace />} />
            <Route path="safety-review" element={<SafetyReview />} />
            <Route path="analytics" element={<div className="p-8">Analytics Coming Soon</div>} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
