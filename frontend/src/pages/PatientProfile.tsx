import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Clock, FileText, Loader2, Download, Eye, X } from 'lucide-react';
import { getPatient, updatePatient, getPatientConsultations, getConsultationDetail, formatDate, formatDateTime } from '../api/client';
import { generateAndDownloadPDF } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';

interface Patient {
  id: number;
  doctor_id: number;
  name: string;
  dob?: string;
  gender?: string;
  contact?: string;
  medical_history?: string;
  created_at?: string;
}

const PatientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { doctor } = useAuth();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Patient>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Selected consultation modal view
  const [selectedConsultation, setSelectedConsultation] = useState<any | null>(null);
  const [, setIsLoadingNote] = useState(false);

  useEffect(() => {
    if (id) {
      loadPatientData();
    }
  }, [id, doctor?.id]);

  const loadPatientData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [patientData, consultsData] = await Promise.all([
        getPatient(id!),
        getPatientConsultations(id!)
      ]);
      setPatient(patientData);
      setEditForm(patientData);
      setConsultations(consultsData);
    } catch (err: any) {
      console.error('Failed to fetch patient data:', err);
      setError('Unable to load patient profile or unauthorized access.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updatePatient(id!, editForm);
      setPatient(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update patient:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenNote = async (consultationId: number) => {
    setIsLoadingNote(true);
    try {
      const detail = await getConsultationDetail(consultationId);
      setSelectedConsultation(detail);
    } catch (err) {
      console.error('Failed to load note:', err);
    } finally {
      setIsLoadingNote(false);
    }
  };

  const handleDownloadPDF = (recordDetail: any) => {
    if (!recordDetail) return;
    const soap = recordDetail.soap || {
      subjective: 'Not documented.',
      objective: 'Not documented.',
      assessment: 'Not documented.',
      plan: 'Not documented.'
    };

    generateAndDownloadPDF({
      patientName: patient?.name || recordDetail.patient_reference || 'Patient',
      patientAge: patient?.dob ? `${formatDate(patient.dob)} / ${patient?.gender || '—'}` : '—',
      patientId: `MRN-${patient?.id || recordDetail.id}`,
      doctorName: doctor?.name || 'Attending Physician',
      hospitalName: doctor?.hospital_name || 'Clinscribe Medical Center',
      date: formatDate(recordDetail.created_at),
      time: new Date(recordDetail.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      soap: {
        subjective: soap.subjective || 'Not documented.',
        objective: soap.objective || 'Not documented.',
        assessment: soap.assessment || 'Not documented.',
        plan: soap.plan || 'Not documented.'
      }
    });
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-text-secondary text-sm">
        <Loader2 className="animate-spin mx-auto mb-3 text-accent" size={24} />
        <span>Loading patient profile...</span>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <div className="p-4 bg-critical/10 border border-critical/20 text-critical text-sm rounded-md mb-4 font-medium">
          {error || 'Patient not found or belongs to another physician.'}
        </div>
        <button
          onClick={() => navigate('/patients')}
          className="bg-accent text-white px-4 py-2 rounded-md text-xs font-medium"
        >
          Back to Patients List
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button 
            onClick={() => navigate('/patients')} 
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{patient.name}</h1>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
                #MRN-{patient.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enrolled: {formatDate(patient.created_at)} • Attending Physician: <span className="font-semibold text-slate-700">{doctor?.name}</span>
            </p>
          </div>
        </div>

        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 self-start sm:self-auto"
          >
            <Edit2 size={13} />
            <span>Edit Demographics</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Demographic & Medical Info */}
        <div className="col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Patient Demographics</h3>
              <span className="text-[11px] font-semibold text-slate-400">Verified</span>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:border-primary-500 focus:bg-white" 
                    value={editForm.name || ''} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date of Birth</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:border-primary-500 focus:bg-white" 
                    value={editForm.dob || ''} 
                    onChange={(e) => setEditForm({...editForm, dob: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Gender</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:border-primary-500 focus:bg-white" 
                    value={editForm.gender || ''} 
                    onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Details</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:border-primary-500 focus:bg-white" 
                    value={editForm.contact || ''} 
                    onChange={(e) => setEditForm({...editForm, contact: e.target.value})} 
                  />
                </div>
                <div className="pt-2 flex space-x-2">
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving} 
                    className="flex-1 bg-primary-600 text-white py-2 rounded-xl hover:bg-primary-500 text-xs font-semibold flex justify-center items-center space-x-1 shadow-sm transition"
                  >
                    {isSaving ? <Loader2 size={13} className="animate-spin" /> : null}
                    <span>Save Profile</span>
                  </button>
                  <button 
                    onClick={() => { setIsEditing(false); setEditForm(patient); }} 
                    disabled={isSaving} 
                    className="flex-1 bg-slate-100 border border-slate-200 py-2 rounded-xl hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-slate-400 font-semibold mb-0.5">Date of Birth:</div>
                  <div className="text-xs font-bold text-slate-800">{formatDate(patient.dob)}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-semibold mb-0.5">Gender:</div>
                  <div className="text-xs font-bold text-slate-800">{patient.gender || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-semibold mb-0.5">Contact Phone / Email:</div>
                  <div className="text-xs font-bold text-slate-800">{patient.contact || 'Not specified'}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Medical History & Allergies</h3>
            {isEditing ? (
              <textarea 
                className="w-full p-3 border border-slate-200 rounded-xl text-xs h-32 bg-slate-50 focus:outline-none focus:border-primary-500 focus:bg-white resize-none" 
                value={editForm.medical_history || ''} 
                onChange={(e) => setEditForm({...editForm, medical_history: e.target.value})}
                placeholder="Enter past conditions, allergies, or prior surgeries..."
              />
            ) : (
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {patient.medical_history || <span className="text-slate-400 italic">No prior medical history recorded.</span>}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Historical Clinical Consultations */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Encounter History ({consultations.length})
            </h2>
            <button 
              onClick={() => navigate('/consultations/new', { state: { patientId: patient.id, patientName: patient.name }})} 
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-500 transition"
            >
              <span>+ New Encounter</span>
            </button>
          </div>
          
          {consultations.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-card">
              <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Clock size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No Consultations Yet</h3>
              <p className="text-slate-500 mb-6 text-xs max-w-sm mx-auto">
                Begin an ambient audio recording or text transcript consultation for {patient.name}.
              </p>
              <button 
                onClick={() => navigate('/consultations/new', { state: { patientId: patient.id, patientName: patient.name }})} 
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-500 transition"
              >
                <FileText size={14} />
                <span>Start Clinical Encounter</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {consultations.map(c => (
                <div 
                  key={c.id} 
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card hover:border-primary-300 transition-all group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={15} className="text-primary-600 shrink-0" />
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary-600 transition-colors">Clinical Encounter #{c.id}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${c.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {c.status}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase border border-slate-200/60">
                        {c.input_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Timestamp: <span className="font-semibold text-slate-600">{formatDateTime(c.created_at)}</span>
                    </p>
                    {c.chief_complaint && (
                      <p className="text-xs text-slate-600 mt-2 italic line-clamp-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{c.chief_complaint}..."
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => handleOpenNote(c.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                    >
                      <Eye size={13} />
                      <span>Inspect</span>
                    </button>
                    <button 
                      onClick={async () => {
                        const detail = await getConsultationDetail(c.id);
                        handleDownloadPDF(detail);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 shadow-sm hover:bg-primary-100 transition"
                    >
                      <Download size={13} />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected SOAP Note Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Encounter Documentation for {patient.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consultation #{selectedConsultation.id} • {formatDateTime(selectedConsultation.created_at)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadPDF(selectedConsultation)}
                  className="inline-flex items-center gap-1.5 bg-primary-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-primary-500 shadow-sm transition"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setSelectedConsultation(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/30 p-5 space-y-4">
                <div>
                  <span className="inline-block font-bold text-xs px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 mb-1.5">
                    S • SUBJECTIVE
                  </span>
                  <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap pl-2">
                    {selectedConsultation.soap?.subjective || 'Not documented.'}
                  </p>
                </div>

                <div className="border-t border-slate-200/60 pt-3">
                  <span className="inline-block font-bold text-xs px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1.5">
                    O • OBJECTIVE
                  </span>
                  <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap pl-2">
                    {selectedConsultation.soap?.objective || 'Not documented.'}
                  </p>
                </div>

                <div className="border-t border-slate-200/60 pt-3">
                  <span className="inline-block font-bold text-xs px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 mb-1.5">
                    A • ASSESSMENT
                  </span>
                  <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap pl-2">
                    {selectedConsultation.soap?.assessment || 'Not documented.'}
                  </p>
                </div>

                <div className="border-t border-slate-200/60 pt-3">
                  <span className="inline-block font-bold text-xs px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 mb-1.5">
                    P • PLAN
                  </span>
                  <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap pl-2">
                    {selectedConsultation.soap?.plan || 'Not documented.'}
                  </p>
                </div>
              </div>

              {selectedConsultation.transcript_content && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Encounter Dialogue Transcript</h4>
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 text-xs font-mono max-h-44 overflow-y-auto whitespace-pre-wrap text-slate-600 leading-relaxed">
                    {selectedConsultation.transcript_content}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedConsultation(null)}
                className="px-4 py-2 border border-slate-200 bg-white text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 shadow-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
