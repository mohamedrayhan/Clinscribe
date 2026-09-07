import { useState } from 'react';
import { User, Bell, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Mock initial data
  const [profile, setProfile] = useState({
    name: 'Dr. Sarah Friday',
    email: 'sarah.friday@clinscribe.com',
    phone: '+1 (555) 123-4567',
    specialization: 'Internal Medicine'
  });

  const [editForm, setEditForm] = useState(profile);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setProfile(editForm);
      setIsSaving(false);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 800);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your account and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-md text-[14px] font-medium transition-colors ${activeTab === 'profile' ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-black/5 hover:text-text-primary'}`}
          >
            <User size={18} />
            <span>Profile</span>
          </button>
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-md text-[14px] font-medium transition-colors ${activeTab === 'preferences' ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-black/5 hover:text-text-primary'}`}
          >
            <Bell size={18} />
            <span>Preferences</span>
          </button>
          <button 
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-md text-[14px] font-medium transition-colors ${activeTab === 'account' ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-black/5 hover:text-text-primary'}`}
          >
            <Shield size={18} />
            <span>Account</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-surface border border-border rounded-lg p-8">
          {successMsg && (
            <div className="mb-6 bg-success/10 text-success border border-success/20 px-4 py-3 rounded-md flex items-center space-x-2 text-[14px]">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-text-primary">Profile Information</h2>
                {!isEditing && (
                  <button onClick={() => { setIsEditing(true); setEditForm(profile); }} className="text-[14px] text-accent font-medium hover:underline">
                    Edit Profile
                  </button>
                )}
              </div>
              
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1">Full Name</label>
                  {isEditing ? (
                    <input type="text" className="w-full px-3 py-2 border border-border rounded-md text-[14px]" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  ) : (
                    <div className="text-[15px] text-text-primary font-medium">{profile.name}</div>
                  )}
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1">Email Address</label>
                  {isEditing ? (
                    <input type="email" className="w-full px-3 py-2 border border-border rounded-md text-[14px]" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                  ) : (
                    <div className="text-[15px] text-text-primary font-medium">{profile.email}</div>
                  )}
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1">Phone Number</label>
                  {isEditing ? (
                    <input type="text" className="w-full px-3 py-2 border border-border rounded-md text-[14px]" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                  ) : (
                    <div className="text-[15px] text-text-primary font-medium">{profile.phone}</div>
                  )}
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1">Specialization</label>
                  {isEditing ? (
                    <input type="text" className="w-full px-3 py-2 border border-border rounded-md text-[14px]" value={editForm.specialization} onChange={e => setEditForm({...editForm, specialization: e.target.value})} />
                  ) : (
                    <div className="text-[15px] text-text-primary font-medium">{profile.specialization}</div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-8 flex space-x-3">
                  <button onClick={handleSave} disabled={isSaving} className="bg-accent text-white px-5 py-2 rounded-md font-medium text-[14px] hover:bg-accent/90 disabled:opacity-50">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => setIsEditing(false)} disabled={isSaving} className="bg-background border border-border px-5 py-2 rounded-md font-medium text-[14px] text-text-primary hover:bg-black/5">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-6">Preferences</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-medium text-text-primary">Email Notifications</h3>
                    <p className="text-[13px] text-text-secondary">Receive alerts for new safety flags.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-accent w-4 h-4 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-medium text-text-primary">Dark Mode</h3>
                    <p className="text-[13px] text-text-secondary">Switch to a dark UI theme.</p>
                  </div>
                  <input type="checkbox" className="accent-accent w-4 h-4 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-6">Account Settings</h2>
              
              <div className="mb-8 border-b border-border pb-8">
                <h3 className="text-[14px] font-medium text-text-primary mb-4">Change Password</h3>
                <div className="space-y-4 max-w-sm">
                  <input type="password" placeholder="Current Password" className="w-full px-3 py-2 border border-border rounded-md text-[14px]" />
                  <input type="password" placeholder="New Password" className="w-full px-3 py-2 border border-border rounded-md text-[14px]" />
                  <button className="bg-text-primary text-white px-5 py-2 rounded-md font-medium text-[14px] hover:bg-text-primary/90">
                    Update Password
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-[14px] font-medium text-critical mb-2">Logout</h3>
                <p className="text-[13px] text-text-secondary mb-4">Securely sign out of your account on this device.</p>
                <button onClick={handleLogout} className="flex items-center space-x-2 bg-critical/10 text-critical border border-critical/20 px-5 py-2 rounded-md font-medium text-[14px] hover:bg-critical/20 transition-colors">
                  <LogOut size={16} />
                  <span>Log out now</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
