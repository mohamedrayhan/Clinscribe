import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Clock, FileText, Loader2 } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  dob: string;
  gender: string;
  contact: string;
  medical_history: string;
}

const PatientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Patient>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const [patientRes, consultsRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/patients/${id}`),
          fetch(`http://127.0.0.1:8000/api/patients/${id}/consultations`)
        ]);
        
        if (patientRes.ok) {
          const patientData = await patientRes.json();
          setPatient(patientData);
          setEditForm(patientData);
        }
        if (consultsRes.ok) {
          const consultsData = await consultsRes.json();
          setConsultations(consultsData);
        }
      } catch (err) {
        console.error('Failed to fetch patient data', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchPatientData();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        const data = await response.json();
        setPatient(data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to update patient', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-text-secondary">Loading patient data...</div>;
  if (!patient) return <div className="p-8 text-center text-critical">Patient not found</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <button onClick={() => navigate('/patients')} className="p-2 hover:bg-black/5 rounded-md text-text-secondary transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">{patient.name}</h1>
          <p className="text-text-secondary mt-1">Patient Profile & History</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 bg-background border border-border px-4 py-2 rounded-md hover:bg-black/5 transition-colors">
            <Edit2 size={16} />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="col-span-1 space-y-6">
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Patient Details</h3>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Name</label>
                  <input type="text" className="w-full px-3 py-2 border border-border rounded-md text-sm" value={editForm.name || ''} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Date of Birth</label>
                  <input type="date" className="w-full px-3 py-2 border border-border rounded-md text-sm" value={editForm.dob || ''} onChange={(e) => setEditForm({...editForm, dob: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Gender</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md text-sm" value={editForm.gender || ''} onChange={(e) => setEditForm({...editForm, gender: e.target.value})}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Contact</label>
                  <input type="text" className="w-full px-3 py-2 border border-border rounded-md text-sm" value={editForm.contact || ''} onChange={(e) => setEditForm({...editForm, contact: e.target.value})} />
                </div>
                <div className="pt-2 flex space-x-2">
                  <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-accent text-white py-2 rounded-md hover:bg-accent/90 text-sm font-medium flex justify-center">
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                  </button>
                  <button onClick={() => { setIsEditing(false); setEditForm(patient); }} disabled={isSaving} className="flex-1 bg-background border border-border py-2 rounded-md hover:bg-black/5 text-sm font-medium">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-text-secondary mb-1">Date of Birth</div>
                  <div className="text-sm font-medium text-text-primary">{patient.dob || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary mb-1">Gender</div>
                  <div className="text-sm font-medium text-text-primary">{patient.gender || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary mb-1">Contact</div>
                  <div className="text-sm font-medium text-text-primary">{patient.contact || 'Not specified'}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Medical History</h3>
            {isEditing ? (
              <textarea 
                className="w-full px-3 py-2 border border-border rounded-md text-sm h-32" 
                value={editForm.medical_history || ''} 
                onChange={(e) => setEditForm({...editForm, medical_history: e.target.value})}
                placeholder="Enter medical history, allergies, chronic conditions..."
              />
            ) : (
              <div className="text-sm text-text-primary whitespace-pre-wrap">
                {patient.medical_history || <span className="text-text-secondary italic">No medical history recorded.</span>}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Consultations */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">Recent Consultations</h2>
            <button 
              onClick={() => navigate('/consultations/new', { state: { patientId: patient.id, patientName: patient.name }})} 
              className="text-sm text-accent font-medium hover:underline flex items-center space-x-1"
            >
              <span>+ New Consultation</span>
            </button>
          </div>
          
          {consultations.length === 0 ? (
            <div className="bg-surface border border-border rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary">
                <Clock size={24} />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-1">No Consultations Yet</h3>
              <p className="text-text-secondary mb-6 text-sm">Start a new consultation to record a visit for {patient.name}.</p>
              <button 
                onClick={() => navigate('/consultations/new', { state: { patientId: patient.id, patientName: patient.name }})} 
                className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 transition-colors inline-flex items-center space-x-2"
              >
                <FileText size={16} />
                <span>Start Encounter</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map(c => (
                <div key={c.id} className="bg-surface border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <FileText size={16} className="text-accent" />
                      <h4 className="font-medium text-text-primary">Clinical Note</h4>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-background border border-border text-text-secondary uppercase tracking-wider">
                        {c.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">
                      {new Date(c.created_at).toLocaleDateString()} • {c.input_type.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="text-[13px] font-medium text-text-secondary hover:text-text-primary border border-border bg-background px-3 py-1.5 rounded-md transition-colors">
                      View Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
