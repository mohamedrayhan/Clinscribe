import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctor } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Clinical Dashboard', subtitle: 'Overview & Analytics' };
    if (path.startsWith('/patients/')) return { title: 'Patient Profile', subtitle: 'Medical Record & History' };
    if (path === '/patients') return { title: 'Patients Directory', subtitle: 'Registered Patient Records' };
    if (path === '/consultations/new/audio') return { title: 'Live Audio Encounter', subtitle: 'Real-time Diarization & Transcription' };
    if (path === '/consultations/new/text') return { title: 'Process Clinical Transcript', subtitle: 'AI Fact Extraction & SOAP Generation' };
    if (path === '/consultations/new') return { title: 'New Clinical Encounter', subtitle: 'Start Audio or Text Documentation' };
    if (path === '/records' || path === '/history') return { title: 'Documentation History', subtitle: 'Archived Clinical Notes & Encounters' };
    if (path === '/settings') return { title: 'Physician Settings', subtitle: 'Account & Clinical Preferences' };
    return { title: 'Clinscribe AI', subtitle: 'Clinical Documentation' };
  };

  const { title, subtitle } = getPageTitle();

  const getInitials = (name?: string) => {
    if (!name) return 'DR';
    const clean = name.replace(/^Dr\.\s*/i, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || 'DR';
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 lg:px-8">
      {/* Left: Mobile Toggle & Page Title / Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-400 hidden sm:inline-block">Portal</span>
            <ChevronRight size={12} className="text-slate-300 hidden sm:inline-block" />
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h1>
          </div>
          <p className="text-[11px] text-slate-500 hidden md:block">{subtitle}</p>
        </div>
      </div>

      {/* Right: AI Engine Status + Quick New Encounter + Physician Avatar */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* AI Engine Status Pill */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-50 border border-slate-200/90 rounded-full px-3 py-1 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-600 font-medium text-[11px] flex items-center space-x-1">
            <Sparkles size={11} className="text-primary-500 mr-1 inline" />
            <span>Qwen2.5 1.5B</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-600 font-semibold">Online</span>
          </span>
        </div>

        {/* Quick Action Button */}
        {location.pathname !== '/consultations/new' && !location.pathname.startsWith('/consultations/new/') && (
          <button
            onClick={() => navigate('/consultations/new')}
            className="hidden md:flex items-center space-x-1.5 bg-primary-500 hover:bg-primary-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
          >
            <FileText size={14} />
            <span>New Encounter</span>
          </button>
        )}

        {/* Physician Profile Badge */}
        <div
          onClick={() => navigate('/settings')}
          className="flex items-center space-x-2.5 p-1 sm:pr-3 rounded-full sm:rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/80 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-sky-400 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
            {getInitials(doctor?.name)}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
              {doctor?.name || 'Physician'}
            </p>
            <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
              {doctor?.specialization || 'Clinical Practice'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
