import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, FileText, Download, Eye, Clock, X, Loader2 } from 'lucide-react';
import { getClinicalRecords, getConsultationDetail, formatDateTime, formatDate } from '../api/client';
import { generateAndDownloadPDF } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';

const History = () => {
  const { doctor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { openConsultationId?: number } || {};

  const [records, setRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal inspection state
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [doctor?.id]);

  useEffect(() => {
    if (state.openConsultationId) {
      handleOpenRecord(state.openConsultationId);
    }
  }, [state.openConsultationId]);

  const fetchRecords = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getClinicalRecords();
      setRecords(data);
    } catch (err: any) {
      console.error('Failed to fetch clinical records:', err);
      setError('Unable to load clinical records history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRecord = async (consultationId: number) => {
    setIsLoadingDetail(true);
    try {
      const detail = await getConsultationDetail(consultationId);
      setSelectedRecord(detail);
    } catch (err) {
      console.error('Failed to load consultation detail:', err);
    } finally {
      setIsLoadingDetail(false);
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
      patientName: recordDetail.patient_reference || recordDetail.patient?.name || 'Unknown Patient',
      patientAge: recordDetail.patient?.dob ? `${formatDate(recordDetail.patient.dob)} / ${recordDetail.patient.gender || 'M'}` : '—',
      patientId: `MRN-${recordDetail.patient_id || recordDetail.id}`,
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

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.chief_complaint && r.chief_complaint.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || r.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clinical Documentation History</h1>
          <p className="text-xs text-slate-500 mt-1">Review, inspect, audit, and export generated clinical documentation.</p>
        </div>
        <button
          onClick={() => navigate('/consultations/new')}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors self-start sm:self-auto"
        >
          <FileText size={15} />
          <span>New Encounter</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Filters and search bar */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm transition"
            placeholder="Search by patient name or chief complaint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl bg-white text-xs font-semibold px-3.5 py-2.5 text-slate-700 focus:outline-none focus:border-primary-500 shadow-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="draft">Draft / In Review</option>
            <option value="processed">Processed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* List of records */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <Loader2 className="animate-spin mx-auto mb-3 text-primary-600" size={24} />
            <span>Loading documentation history...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
              <Clock size={26} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No clinical documentation found</h3>
            <p className="text-slate-500 text-xs max-w-sm mb-6">
              {searchTerm || statusFilter !== 'ALL'
                ? 'No encounters match your current search or filter criteria.'
                : 'No clinical documentation has been created yet. Start a new consultation to create your first note.'}
            </p>
            <button
              onClick={() => navigate('/consultations/new')}
              className="bg-primary-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-primary-500 shadow-sm"
            >
              Start New Consultation
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRecords.map((r) => (
              <div
                key={r.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-primary-600 transition-colors">
                      {r.patient_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        r.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {r.status}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200/60 text-slate-600 uppercase">
                      {r.input_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Encounter #{r.id} • Timestamp: <span className="font-semibold text-slate-600">{formatDateTime(r.created_at)}</span>
                  </p>
                  {r.chief_complaint && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-1 italic bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                      "{r.chief_complaint}..."
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenRecord(r.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                  >
                    <Eye size={13} />
                    <span>Inspect Note</span>
                  </button>
                  <button
                    onClick={async () => {
                      const detail = await getConsultationDetail(r.id);
                      handleDownloadPDF(detail);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-3.5 py-2 text-xs font-semibold text-primary-700 shadow-sm hover:bg-primary-100 transition"
                  >
                    <Download size={13} />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Historical SOAP Note Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Encounter Documentation: {selectedRecord.patient_reference || selectedRecord.patient?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consultation #{selectedRecord.id} • {formatDateTime(selectedRecord.created_at)} • Status: <span className="uppercase font-bold text-primary-700">{selectedRecord.status}</span>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadPDF(selectedRecord)}
                  className="inline-flex items-center gap-1.5 bg-primary-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-primary-500 shadow-sm transition"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Patient Banner */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Patient Record:</span>
                  <span className="font-bold text-slate-900 text-xs">{selectedRecord.patient_reference || selectedRecord.patient?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Attending Doctor:</span>
                  <span className="font-semibold text-slate-800">{doctor?.name} ({doctor?.specialization || 'Medicine'})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Encounter Mode:</span>
                  <span className="font-bold text-slate-800 uppercase">{selectedRecord.input_type} Consultation</span>
                </div>
              </div>

              {/* SOAP Note Sections */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">SOAP Clinical Documentation</h4>
                
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/30 p-5 space-y-4">
                  <div>
                    <span className="inline-block font-bold text-xs px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 mb-1.5">
                      S • SUBJECTIVE
                    </span>
                    <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap pl-2">
                      {selectedRecord.soap?.subjective || 'Not documented.'}
                    </p>
                  </div>

                  <div className="border-t border-slate-200/60 pt-3">
                    <span className="inline-block font-bold text-xs px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1.5">
                      O • OBJECTIVE
                    </span>
                    <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap pl-2">
                      {selectedRecord.soap?.objective || 'Not documented.'}
                    </p>
                  </div>

                  <div className="border-t border-slate-200/60 pt-3">
                    <span className="inline-block font-bold text-xs px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 mb-1.5">
                      A • ASSESSMENT
                    </span>
                    <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap pl-2">
                      {selectedRecord.soap?.assessment || 'Not documented.'}
                    </p>
                  </div>

                  <div className="border-t border-slate-200/60 pt-3">
                    <span className="inline-block font-bold text-xs px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 mb-1.5">
                      P • PLAN
                    </span>
                    <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap pl-2">
                      {selectedRecord.soap?.plan || 'Not documented.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Extracted Clinical Facts */}
              {selectedRecord.facts && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Extracted Clinical Facts</h4>
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block mb-1">Detected Symptoms:</span>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                        {selectedRecord.facts.symptoms && selectedRecord.facts.symptoms.length > 0 ? (
                          selectedRecord.facts.symptoms.map((s: any, idx: number) => (
                            <li key={idx}>{s.name || s}</li>
                          ))
                        ) : (
                          <li className="italic text-slate-400">None detected</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block mb-1">Medications:</span>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                        {selectedRecord.facts.medications && selectedRecord.facts.medications.length > 0 ? (
                          selectedRecord.facts.medications.map((m: any, idx: number) => (
                            <li key={idx}>{m}</li>
                          ))
                        ) : (
                          <li className="italic text-slate-400">None documented</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Raw Transcript Content */}
              {selectedRecord.transcript_content && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Encounter Transcript</h4>
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-wrap text-slate-600 leading-relaxed">
                    {selectedRecord.transcript_content}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 border border-slate-200 bg-white text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 shadow-sm transition"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
