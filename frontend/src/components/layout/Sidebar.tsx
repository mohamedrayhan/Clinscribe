import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  History, 
  Settings, 
  LogOut, 
  Activity, 
  Stethoscope, 
  X 
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { doctor, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

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
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-50 w-[260px] h-full bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out shrink-0",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-sky-500 flex items-center justify-center text-white shadow-sm">
              <Stethoscope size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[17px] font-bold tracking-tight text-slate-900 font-sans block leading-none">
                CLINSCRIBE
              </span>
              <span className="text-[10px] font-semibold text-primary-600 uppercase tracking-wider block mt-1">
                Clinical Intelligence
              </span>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {/* Main Group */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Clinical Portal
              </span>
            </div>
            <nav className="space-y-1">
              <NavItem 
                to="/" 
                icon={<LayoutDashboard size={18} />} 
                label="Dashboard" 
                onClick={onClose} 
              />
              <NavItem 
                to="/patients" 
                icon={<Users size={18} />} 
                label="Patients" 
                onClick={onClose} 
              />
              <NavItem 
                to="/consultations/new" 
                icon={<FileText size={18} />} 
                label="New Encounter" 
                onClick={onClose} 
              />
              <NavItem 
                to="/records" 
                icon={<History size={18} />} 
                label="Clinical History" 
                onClick={onClose} 
              />
            </nav>
          </div>

          {/* Settings & Preferences */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Account & Preferences
              </span>
            </div>
            <nav className="space-y-1">
              <NavItem 
                to="/settings" 
                icon={<Settings size={18} />} 
                label="Settings" 
                onClick={onClose} 
              />
            </nav>
          </div>

          {/* Model Status Card */}
          <div className="px-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-primary-50/50 border border-slate-200/90 text-xs space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 flex items-center space-x-1.5">
                  <Activity size={13} className="text-primary-500" />
                  <span>LoRA Inference</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Fine-tuned Qwen2.5 weights loaded for strict SOAP generation.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Doctor Profile & Logout */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                {getInitials(doctor?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {doctor?.name || 'Physician'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {doctor?.hospital_name || 'Clinscribe Clinic'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => clsx(
        "flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group",
        isActive
          ? "bg-primary-50 text-primary-700 font-semibold shadow-xs"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
      )}
    >
      <span className="text-slate-400 group-hover:text-primary-600 transition-colors">
        {icon}
      </span>
      <span>{label}</span>
    </NavLink>
  );
};

export default Sidebar;
