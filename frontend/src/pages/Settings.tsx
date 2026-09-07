import { useState, useEffect } from 'react';
import { User, Bell, Shield, LogOut, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/client';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { doctor, logout, updateDoctorState } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [editForm, setEditForm] = useState({
    name: doctor?.name || '',
    email: doctor?.email || '',
    phone: doctor?.phone || '',
    specialization: doctor?.specialization || '',
    hospital_name: doctor?.hospital_name || ''
  });

  useEffect(() => {
    if (doctor) {
      setEditForm({
        name: doctor.name || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        specialization: doctor.specialization || '',
        hospital_name: doctor.hospital_name || ''
      });
    }
  }, [doctor]);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      const updated = await updateProfile({
        name: editForm.name,
        specialization: editForm.specialization,
        hospital_name: editForm.hospital_name,
        phone: editForm.phone
      });
      updateDoctorState(updated);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Physician Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your credentials, clinic affiliation, and platform preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-60 shrink-0 space-y-1.5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-card">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'profile' ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <User size={15} className={activeTab === 'profile' ? 'text-primary-600' : 'text-slate-400'} />
            <span>Profile & Hospital</span>
          </button>
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'preferences' ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Bell size={15} className={activeTab === 'preferences' ? 'text-primary-600' : 'text-slate-400'} />
            <span>Preferences</span>
          </button>
          <button 
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'account' ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Shield size={15} className={activeTab === 'account' ? 'text-primary-600' : 'text-slate-400'} />
            <span>Security & Session</span>
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1 w-full rounded-2xl border border-slate-200/80 bg-white p-8 shadow-card">
          {successMsg && (
            <div className="mb-6 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-xl flex items-center space-x-2 text-xs font-bold">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 bg-rose-50 text-rose-700 border border-rose-200 px-4 py-3 rounded-xl text-xs font-semibold">
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Physician Profile</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Details printed on exported clinical notes and patient PDF documentation.</p>
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => { setIsEditing(true); }} 
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-primary-600 shadow-sm hover:bg-slate-50 transition"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Physician Name</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary-500 focus:bg-white" 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})} 
                    />
                  ) : (
                    <div className="text-xs font-bold text-slate-900 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">{doctor?.name || 'Dr. Physician'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                  <div className="text-xs text-slate-600 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    {doctor?.email || 'doctor@hospital.org'}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Email address serves as your cryptographic practitioner ID.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Medical Specialization</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary-500 focus:bg-white" 
                      value={editForm.specialization} 
                      onChange={e => setEditForm({...editForm, specialization: e.target.value})} 
                    />
                  ) : (
                    <div className="text-xs font-semibold text-slate-800 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">{doctor?.specialization || 'General Practice'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Hospital / Medical Center</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary-500 focus:bg-white" 
                      value={editForm.hospital_name} 
                      onChange={e => setEditForm({...editForm, hospital_name: e.target.value})} 
                    />
                  ) : (
                    <div className="text-xs font-semibold text-slate-800 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">{doctor?.hospital_name || 'Clinscribe Medical Center'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Office Contact Phone</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary-500 focus:bg-white" 
                      value={editForm.phone} 
                      onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                    />
                  ) : (
                    <div className="text-xs font-semibold text-slate-800 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">{doctor?.phone || 'Not specified'}</div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex space-x-2.5 pt-4 border-t border-slate-100">
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving} 
                    className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-primary-500 disabled:opacity-50 flex items-center space-x-1.5 shadow-sm transition"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button 
                    onClick={() => { setIsEditing(false); }} 
                    disabled={isSaving} 
                    className="bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-700 hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Encounter Preferences</h2>
              <p className="text-xs text-slate-500 mb-6">Configure AI verification triggers and automated export actions.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Safety Verification Badges</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Show real-time hallucination checking and negation rule alert badges.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-primary-600 w-4 h-4 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Auto-download PDF on Approval</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Automatically trigger PDF export download upon doctor documentation approval.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-primary-600 w-4 h-4 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Security & Session</h2>
              <p className="text-xs text-slate-500 mb-6">Manage session state and isolated practitioner security credentials.</p>
              
              <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-xs font-bold text-slate-900 mb-0.5">Doctor Identifier: #{doctor?.id}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your session is cryptographically signed and isolated to prevent cross-physician record exposure.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-rose-700 mb-1">Terminate Physician Session</h3>
                <p className="text-xs text-slate-500 mb-4">
                  End your current session. All temporary memory states and session keys will be purged.
                </p>
                <button 
                  onClick={handleLogout} 
                  className="inline-flex items-center space-x-2 bg-rose-50 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-rose-100 transition-colors shadow-sm"
                >
                  <LogOut size={15} />
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
