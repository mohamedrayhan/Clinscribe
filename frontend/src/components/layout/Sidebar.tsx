import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, History, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-[240px] h-screen bg-surface border-r border-border flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-border">
        <h1 className="text-[18px] font-semibold text-text-primary tracking-tight">CLINSCRIBE</h1>
        <p className="text-[12px] text-text-secondary mt-1">Doctor Portal</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div>
          <h2 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2 px-3">Main</h2>
          <nav className="space-y-0.5">
            <NavItem to="/" icon={<LayoutDashboard size={16} />} label="Dashboard" />
            <NavItem to="/patients" icon={<Users size={16} />} label="Patients" />
            <NavItem to="/consultations/new" icon={<FileText size={16} />} label="Documentation" />
            <NavItem to="/records" icon={<History size={16} />} label="History" />
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <nav className="space-y-0.5 mb-4">
          <NavItem to="/settings" icon={<Settings size={16} />} label="Settings" />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-[14px] transition-colors duration-150 text-critical hover:bg-critical/10"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </nav>
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-medium">
            SF
          </div>
          <div>
            <p className="text-[13px] font-medium text-text-primary">Dr. Sarah Friday</p>
            <p className="text-[11px] text-text-secondary">Internal Medicine</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, icon, label }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => clsx(
        "flex items-center space-x-3 px-3 py-2 rounded-md text-[14px] transition-colors duration-150",
        isActive 
          ? "bg-accent/10 text-accent font-medium" 
          : "text-text-primary hover:bg-black/5"
      )}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default Sidebar;
