import { useState, useEffect } from 'react';
import { Search, UserPlus, FileText, ArrowRight, X, Loader2, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPatients, createPatient } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Patient {
  id: number;
  name: string;
  dob?: string;
  gender?: string;
  contact?: string;
  medical_history?: string;
  consultation_count?: number;
  last_consultation_date?: string;
}

const Patients = () => {
  const { doctor } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Patient Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [addError, setAddError] = useState('');
  const [form, setForm] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    contact: '',
    medical_history: ''
  });

  useEffect(() => {
    loadPatients();
  }, [doctor?.id]);

  const loadPatients = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err: any) {
      console.error('Failed to fetch patients:', err);
      setError('Unable to load patient records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setAddError('Please enter the patient name.');
      return;
    }
    setIsSaving(true);
    setAddError('');
    try {
      await createPatient({
        name: form.name.trim(),
        dob: form.dob || undefined,
        gender: form.gender || undefined,
        contact: form.contact.trim() || undefined,
        medical_history: form.medical_history.trim() || undefined
      });
      setShowAddModal(false);
      setForm({
        name: '',
        dob: '',
        gender: 'Male',
        contact: '',
        medical_history: ''
      });
      await loadPatients();
    } catch (err: any) {
      setAddError(err.message || 'Failed to create patient record.');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateAge = (dobString?: string) => {
    if (!dobString) return '—';
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) || age < 0 ? '—' : age.toString();
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.contact && p.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patient Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Manage active patient profiles, historical visits, and medical records.</p>
        </div>
        <button 
          onClick={() => { setShowAddModal(true); setAddError(''); }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors self-start sm:self-auto"
        >
          <UserPlus size={15} />
          <span>Register Patient</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Search Bar & Summary Chip */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm transition"
            placeholder="Search patients by name or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
          <span>Active Registry:</span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-900">{filteredPatients.length}</span>
        </div>
      </div>

      {/* Patients Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <Loader2 className="animate-spin mx-auto mb-3 text-primary-600" size={24} />
            <span>Loading patient records...</span>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
              <FileText size={26} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No patients found</h3>
            <p className="text-slate-500 text-xs max-w-sm mb-6">
              {searchTerm 
                ? 'No registered patients matched your query.' 
                : 'No registered patients yet. Create a profile to start tracking clinical documentation.'}
            </p>
            <button 
              onClick={() => { setShowAddModal(true); setAddError(''); }}
              className="bg-primary-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-primary-500 shadow-sm"
            >
              Add New Patient
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/70 text-slate-500">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Patient Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">MRN Identifier</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Age / Sex</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Last Encounter</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Encounters</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredPatients.map((patient) => {
                  const age = calculateAge(patient.dob);
                  return (
                    <tr 
                      key={patient.id} 
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group" 
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-primary-50 border border-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                            {patient.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                            {patient.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                          #MRN-{patient.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-700">{age} yrs • {patient.gender || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-slate-500">{patient.contact || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-semibold text-slate-700">
                          {patient.last_consultation_date || 'No visits yet'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700 border border-primary-100">
                          <HeartPulse size={12} />
                          <span>{patient.consultation_count || 0} visits</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                        <span className="inline-flex items-center gap-1 text-primary-600 group-hover:text-primary-700">
                          <span>View Records</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus size={16} className="text-primary-600" />
                <span>Register New Patient</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="p-6 space-y-4">
              {addError && (
                <div className="text-rose-700 text-xs bg-rose-50 border border-rose-200 p-3 rounded-xl font-semibold">
                  {addError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Phone / Email
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-1234"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Medical History & Allergies
                </label>
                <textarea
                  rows={3}
                  placeholder="Hypertension, Penicillin allergy, Type 2 diabetes..."
                  value={form.medical_history}
                  onChange={(e) => setForm({ ...form, medical_history: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold hover:bg-primary-500 disabled:opacity-50 flex items-center gap-1.5 shadow-sm transition"
                >
                  {isSaving ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>{isSaving ? 'Creating...' : 'Save Patient Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
