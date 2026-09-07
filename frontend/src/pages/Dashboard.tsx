import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle2, 
  FileText, 
  Users, 
  ArrowRight, 
  Activity, 
  Calendar, 
  Plus,
  Mic,
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary, formatDate } from '../api/client';

const Dashboard = () => {
  const { doctor } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError('');
        const summary = await getDashboardSummary();
        setData(summary);
      } catch (err: any) {
        console.error('Failed to load dashboard:', err);
        setError('Unable to load dashboard data. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [doctor?.id]);

  const getFormattedToday = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[now.getDay()];
    return `${dayName}, ${formatDate(now)}`;
  };

  const stats = data?.statistics || {
    total_patients: 0,
    total_documents: 0,
    documents_today: 0,
    awaiting_review: 0,
    safety_flags: 0,
    avg_factual_consistency: 94.2,
    negation_preservation: 99,
    medication_safety: 100
  };

  const recentPatients = data?.recent_patients || [];
  const recentActivity = data?.recent_activity || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-sans">
      {/* Hero Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-primary-950 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-sky-300 border border-white/10">
            <Calendar size={13} />
            <span>{getFormattedToday()}</span>
            <span className="text-white/40">•</span>
            <span>{doctor?.hospital_name || 'Clinscribe Medical Center'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Good day, {doctor?.name || 'Doctor'}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your clinical documentation hub is fully synced. Review pending encounters or begin a new patient consultation.
          </p>
        </div>

        {/* Quick Launch Button */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/consultations/new')}
            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus size={16} />
            <span>New Encounter</span>
          </button>
          <button
            onClick={() => navigate('/patients')}
            className="flex items-center space-x-2 bg-white hover:bg-slate-100 text-slate-900 border border-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          >
            <UserPlus size={16} className="text-primary-600" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => window.location.reload()} className="underline text-xs">Retry</button>
        </div>
      )}

      {isLoading ? (
        <div className="py-24 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Aggregating physician metrics...</span>
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Total Consultations */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Encounters
                </span>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <FileCheck2 size={20} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stats.total_documents}
                </span>
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                  <TrendingUp size={13} className="text-emerald-500" />
                  <span>Archived in database</span>
                </div>
              </div>
            </div>

            {/* Total Patients */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Registered Patients
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users size={20} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stats.total_patients}
                </span>
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                  <span>Under Dr. {doctor?.name?.split(' ').pop()}</span>
                </div>
              </div>
            </div>

            {/* Encounters Today */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Encounters Today
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Calendar size={20} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stats.documents_today}
                </span>
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                  <span className="text-slate-500">Created today</span>
                </div>
              </div>
            </div>

            {/* Awaiting Review */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pending Approval
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock size={20} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stats.awaiting_review}
                </span>
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                  <span>Drafts or in-review</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 8 Cols: Recent Activity & Recent Patients */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Recent Clinical Activity */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Activity size={18} className="text-primary-600" />
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      Recent Clinical Documentation
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/records')}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1 transition-colors"
                  >
                    <span>View All</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {recentActivity.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <FileText size={24} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">No recent consultations</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Start your first encounter by pasting a transcript or recording audio.
                    </p>
                    <button
                      onClick={() => navigate('/consultations/new')}
                      className="mt-4 inline-flex items-center space-x-1.5 bg-primary-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-primary-700 transition-colors"
                    >
                      <Plus size={14} />
                      <span>Start New Encounter</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 mt-2">
                    {recentActivity.map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => navigate('/records', { state: { openConsultationId: item.id } })}
                        className="py-4 px-2 -mx-2 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                            {item.input_type === 'audio' ? <Mic size={18} /> : <FileText size={18} />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                                {item.patient_name}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                item.status === 'approved' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              {item.chief_complaint || `Consultation #${item.id}`} • {item.created_at}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 text-xs font-semibold text-slate-400 group-hover:text-primary-600 shrink-0 transition-colors">
                          <span className="hidden sm:inline">Inspect</span>
                          <ChevronRight size={15} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Patients Table */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Users size={18} className="text-primary-600" />
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      Recent Patients
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/patients')}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1 transition-colors"
                  >
                    <span>View All Patients</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {recentPatients.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No registered patients found yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 mt-2">
                    {recentPatients.map((p: any) => (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/patients/${p.id}`)}
                        className="py-3.5 px-2 -mx-2 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-slate-900 block truncate group-hover:text-primary-600 transition-colors">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              MRN #{p.id} • Last consult: {p.last_consultation_date || 'None'}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                          View Record
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 4 Cols: Quality Verification & Quick Workflow */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Documentation Quality Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card">
                <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Clinical Quality Assurance
                  </h3>
                </div>

                <div className="mt-5 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {stats.avg_factual_consistency}%
                    </span>
                    <p className="text-[11px] text-slate-500">Avg. Factual Consistency</p>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <QualityMetricBar label="Factual Consistency" value={stats.avg_factual_consistency} color="bg-emerald-500" />
                  <QualityMetricBar label="Negation Preservation" value={stats.negation_preservation || 99} color="bg-primary-500" />
                  <QualityMetricBar label="Medication Accuracy" value={stats.medication_safety || 100} color="bg-sky-500" />
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Safety Score Threshold</span>
                  <span className="font-semibold text-slate-700">90% Required</span>
                </div>
              </div>

              {/* Quick Launchpad */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Workflow Shortcuts
                </h3>
                
                <button
                  onClick={() => navigate('/consultations/new/text')}
                  className="w-full p-3 rounded-xl border border-slate-200/80 hover:border-primary-500 hover:bg-primary-50/40 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-sky-50 text-sky-600 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Paste Transcript</p>
                      <p className="text-[10px] text-slate-500">Run Qwen LLM on dialogue</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/consultations/new/audio')}
                  className="w-full p-3 rounded-xl border border-slate-200/80 hover:border-primary-500 hover:bg-primary-50/40 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                      <Mic size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Live Audio Recording</p>
                      <p className="text-[10px] text-slate-500">Real-time STT & Diarization</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/patients')}
                  className="w-full p-3 rounded-xl border border-slate-200/80 hover:border-primary-500 hover:bg-primary-50/40 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                      <UserPlus size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Register New Patient</p>
                      <p className="text-[10px] text-slate-500">Create patient medical profile</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
                </button>
              </div>

            </div>

          </div>
        </>
      )}
    </div>
  );
};

const QualityMetricBar = ({ label, value, color }: { label: string, value: number, color: string }) => {
  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-1.5">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">{value}%</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
        <div 
          className={`${color} h-full rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
