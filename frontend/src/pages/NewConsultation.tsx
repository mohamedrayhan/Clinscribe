import { useState, useEffect } from 'react';
import { Mic, FileText, ArrowRight, UserCheck, UserPlus, Sparkles, Activity, ShieldCheck, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPatients } from '../api/client';
import { useAuth } from '../context/AuthContext';

const NewConsultation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { doctor } = useAuth();
  const state = location.state as { patientId?: number, patientName?: string } || {};

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    state.patientId ? state.patientId.toString() : ''
  );
  const [patientReference, setPatientReference] = useState<string>(
    state.patientName || ''
  );

  useEffect(() => {
    getPatients().then(data => {
      setPatients(data);
      if (state.patientId) {
        const found = data.find((p: any) => p.id === state.patientId);
        if (found) {
          setSelectedPatientId(found.id.toString());
          setPatientReference(found.name);
        }
      }
    }).catch(err => console.warn('Could not load patients list:', err));
  }, [state.patientId, doctor?.id]);

  const handlePatientSelect = (val: string) => {
    setSelectedPatientId(val);
    if (val === 'walkin' || !val) {
      setPatientReference('Walk-in Patient');
    } else {
      const found = patients.find(p => p.id.toString() === val);
      if (found) {
        setPatientReference(found.name);
      }
    }
  };

  const getPayloadState = () => {
    const pid = selectedPatientId && selectedPatientId !== 'walkin' ? parseInt(selectedPatientId) : undefined;
    return {
      patientId: pid,
      patientName: patientReference.trim() || 'Unknown Patient'
    };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 p-8 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-400/30 bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-300 mb-4 backdrop-blur-sm">
            <Sparkles size={13} className="text-primary-400" />
            <span>AI-Assisted Encounter Capture</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start New Clinical Encounter
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Select an existing patient profile or walk-in patient, then launch real-time ambient speech transcription or paste a clinical consultation transcript.
          </p>
        </div>
      </div>

      {/* Patient Selection Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-lg">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              <UserCheck size={16} className="text-primary-600" />
              <span>Patient Assignment</span>
            </label>
            <div className="relative">
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
              >
                <option value="">-- Choose an Existing Patient --</option>
                <option value="walkin">Walk-in / Unregistered Patient</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id.toString()}>
                    {p.name} (MRN #{p.id}) {p.gender ? `• ${p.gender}` : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <ChevronRight size={16} className="rotate-90" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center pt-2 sm:pt-6">
            <span className="text-xs font-medium text-slate-400">or</span>
            <button
              type="button"
              onClick={() => navigate('/patients')}
              className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50/70 px-4 py-2.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100/80 hover:border-primary-300"
            >
              <UserPlus size={15} />
              <span>Register New Patient</span>
            </button>
          </div>
        </div>

        {selectedPatientId && selectedPatientId !== 'walkin' && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-800">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <div>
              Active patient: <span className="font-bold text-emerald-950">{patientReference}</span>. Clinical documentation and SOAP notes will be permanently archived under this record.
            </div>
          </div>
        )}
      </div>

      {/* Encounter Mode Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* Audio Option */}
        <div 
          onClick={() => navigate('/consultations/new/audio', { state: getPayloadState() })}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-card-hover"
        >
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-rose-500/5 blur-2xl group-hover:bg-rose-500/10 transition" />
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white">
            <Mic size={26} />
          </div>
          
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 mb-3">
            <Activity size={12} className="text-rose-500" />
            <span>Live Microphone / Audio</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">
            Audio Consultation
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Ambient streaming audio with real-time speech-to-text diarization. Automatically differentiates physician and patient dialogue and extracts SOAP documentation.
          </p>

          <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:text-primary-700 transition-colors">
            <span>Start live recording session</span>
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1.5" />
          </div>
        </div>

        {/* Text Option */}
        <div 
          onClick={() => navigate('/consultations/new/text', { state: getPayloadState() })}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-card-hover"
        >
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary-500/5 blur-2xl group-hover:bg-primary-500/10 transition" />
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-600 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white">
            <FileText size={26} />
          </div>
          
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 mb-3">
            <Sparkles size={12} className="text-primary-500" />
            <span>Qwen2.5-1.5B AI Pipeline</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">
            Text Transcript
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Paste raw physician-patient dialogue or upload consultation notes to generate structured clinical findings, duration, negation checks, and comprehensive SOAP notes.
          </p>

          <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:text-primary-700 transition-colors">
            <span>Paste transcript & generate</span>
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1.5" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewConsultation;
