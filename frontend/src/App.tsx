import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import NewConsultation from './pages/NewConsultation';
import AudioConsultation from './pages/AudioConsultation';
import TextConsultation from './pages/TextConsultation';
import SafetyReview from './pages/SafetyReview';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="consultations/new" element={<NewConsultation />} />
          <Route path="consultations/new/audio" element={<AudioConsultation />} />
          <Route path="consultations/new/text" element={<TextConsultation />} />
          <Route path="records" element={<div className="p-8">Clinical Records Coming Soon</div>} />
          <Route path="safety-review" element={<SafetyReview />} />
          <Route path="analytics" element={<div className="p-8">Analytics Coming Soon</div>} />
          <Route path="settings" element={<div className="p-8">Settings Coming Soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
