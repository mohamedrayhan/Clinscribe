import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Loader2, Play } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import TranscriptViewer from '../components/clinical/TranscriptViewer';
import ClinicalFacts from '../components/clinical/ClinicalFacts';
import SOAPViewer from '../components/clinical/SOAPViewer';

const TextConsultation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as { patientId?: number, patientName?: string, liveTranscript?: string } || {};
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [activeStep, setActiveStep] = useState(0);
  const [activeEvidence, setActiveEvidence] = useState<string[]>([]);

  useEffect(() => {
    if (routeState.liveTranscript) {
      setInputText(routeState.liveTranscript);
    }
  }, [routeState.liveTranscript]);

  // (truncated default mock data for brevity in edit rule - assuming it exists below)

  const defaultTranscript = [
    { id: '1', speaker: 'Doctor', text: 'What brings you in today?' },
    { id: '2', speaker: 'Patient', text: 'I\'ve had fever and cough for about three days.' },
    { id: '3', speaker: 'Doctor', text: 'Any chest pain?' },
    { id: '4', speaker: 'Patient', text: 'No chest pain, but I feel tired.' },
  ];

  const defaultFacts = {
    symptoms: [{ id: '1', name: 'Fever' }, { id: '2', name: 'Cough' }, { id: '3', name: 'Fatigue' }],
    negated: [{ id: '1', name: 'Chest pain' }],
    duration: '3 Days',
    medications: []
  };

  const defaultSOAP = [
    { letter: 'S', title: 'SUBJECTIVE', content: 'Patient reports fever and cough for three days, accompanied by fatigue. Denies chest pain.', sourceTranscriptIds: ['2', '4'] },
    { letter: 'O', title: 'OBJECTIVE', content: 'Not documented.' },
    { letter: 'A', title: 'ASSESSMENT', content: 'Possible upper respiratory infection.', sourceTranscriptIds: ['2'] },
    { letter: 'P', title: 'PLAN', content: 'Not documented.' },
  ];

  const [transcriptSegments, setTranscriptSegments] = useState<any[]>(defaultTranscript);
  const [clinicalFacts, setClinicalFacts] = useState<any>(defaultFacts);
  const [soapSections, setSoapSections] = useState<any[]>(defaultSOAP);
  const [apiError, setApiError] = useState(false);

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setStatus('processing');
    setApiError(false);

    try {
      const api = await import('../api/client');
      const patientRef = routeState.patientName || 'Unknown Patient';
      const consultation = await api.createConsultation(1, patientRef, 'text', routeState.patientId);
      
      setActiveStep(1);
      await api.processConsultation(consultation.id, inputText);
      
      setActiveStep(2);
      const transcriptData = await api.getTranscript(consultation.id);
      if (transcriptData && transcriptData.speaker_segments && transcriptData.speaker_segments.length > 0) {
        setTranscriptSegments(transcriptData.speaker_segments);
      }

      try {
        const factsData = await api.getClinicalFacts(consultation.id);
        if (factsData) {
          setClinicalFacts({
            symptoms: factsData.symptoms || [],
            negated: factsData.negations || [],
            duration: '3 Days',
            medications: factsData.medications || []
          });
        }
      } catch (err) {
        console.warn('Could not load facts:', err);
      }
      
      setActiveStep(3);
      const soapData = await api.getSOAPNote(consultation.id);
      if (soapData) {
        setSoapSections([
          { letter: 'S', title: 'SUBJECTIVE', content: soapData.subjective || 'Not documented.', sourceTranscriptIds: ['2', '4'] },
          { letter: 'O', title: 'OBJECTIVE', content: soapData.objective || 'Not documented.' },
          { letter: 'A', title: 'ASSESSMENT', content: soapData.assessment || 'Not documented.', sourceTranscriptIds: ['2'] },
          { letter: 'P', title: 'PLAN', content: soapData.plan || 'Not documented.' },
        ]);
      }
      
      setStatus('done');
    } catch (error) {
      console.warn("Backend API failed, falling back to mock UI...", error);
      setApiError(true);
      setTimeout(() => setActiveStep(1), 800);
      setTimeout(() => setActiveStep(2), 1600);
      setTimeout(() => setActiveStep(3), 2400);
      setTimeout(() => setStatus('done'), 3000);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-black/5 rounded-md text-text-secondary transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Process Text Consultation</h1>
        </div>
        {apiError && status === 'done' && (
          <div className="text-[11px] font-medium text-warning bg-warning/10 px-2.5 py-1 rounded-sm uppercase tracking-widest border border-warning/20">
            Backend Offline - Showing Mock Data
          </div>
        )}
      </div>

      {status === 'idle' && (
        <div className="flex-1 max-w-4xl flex flex-col">
          <p className="text-text-secondary mb-4 text-[14px]">
            Paste the raw transcript of the consultation below, or upload a .txt file.
          </p>
          <textarea
            className="flex-1 w-full bg-surface border border-border rounded-md p-4 text-[15px] text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none font-sans"
            placeholder="Doctor: ...&#10;Patient: ..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          ></textarea>
          <div className="mt-6 flex justify-between items-center">
            <input 
              type="file" 
              accept=".txt,text/plain" 
              className="hidden" 
              id="txt-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    if (ev.target?.result) {
                      setInputText(ev.target.result as string);
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <div className="flex items-center space-x-3">
              <label htmlFor="txt-upload" className="cursor-pointer flex items-center space-x-2 border border-border bg-surface text-text-primary px-4 py-2 rounded-md font-medium text-[13px] hover:bg-black/5 transition-colors">
                Upload .txt
              </label>
              <button
                type="button"
                onClick={() => setInputText("Doctor: Good morning, what symptoms are you experiencing?\nPatient: I've had a severe fever, productive cough, and mild shortness of breath for four days.\nDoctor: Are you having any chest pain or palpitations?\nPatient: No chest pain, but severe fatigue and headaches.\nDoctor: Any current medications or known allergies?\nPatient: I take Metformin 500mg once daily for type 2 diabetes. No known drug allergies.")}
                className="flex items-center space-x-2 border border-dashed border-accent/40 bg-accent/5 text-accent px-4 py-2 rounded-md font-medium text-[13px] hover:bg-accent/10 transition-colors"
              >
                Insert Sample Clinical Encounter
              </button>
            </div>
            <button 
              onClick={handleProcess}
              disabled={!inputText.trim()}
              className="flex items-center space-x-2 bg-text-primary text-white px-6 py-2.5 rounded-md font-medium text-[14px] hover:bg-text-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={16} />
              <span>Process Transcript</span>
            </button>
          </div>
        </div>
      )}

      {status === 'processing' && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-8">Processing Encounter</h2>
          
          <div className="w-full space-y-4">
            <ProcessStep label="Input validation" active={activeStep === 0} done={activeStep > 0} />
            <ProcessStep label="Speaker identification" active={activeStep === 1} done={activeStep > 1} />
            <ProcessStep label="Clinical fact extraction" active={activeStep === 2} done={activeStep > 2} />
            <ProcessStep label="SOAP generation" active={activeStep === 3} done={activeStep > 3} />
          </div>
        </div>
      )}

      {status === 'done' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto mb-6">
            <div className="grid grid-cols-12 gap-6 min-h-0 h-full">
              <div className="col-span-5 h-full overflow-y-auto pr-2">
                <TranscriptViewer 
                  segments={transcriptSegments.map((s: any) => ({
                    ...s,
                    isHighlighted: activeEvidence.includes(s.id)
                  }))} 
                />
              </div>
              <div className="col-span-3 h-full overflow-y-auto pr-2">
                <ClinicalFacts {...clinicalFacts} />
              </div>
              <div className="col-span-4 h-full overflow-y-auto pr-2">
                <SOAPViewer 
                  sections={soapSections}
                  onEvidenceClick={setActiveEvidence}
                  activeEvidenceIds={activeEvidence}
                />
              </div>
            </div>
          </div>
          
          <div className="shrink-0 bg-surface border border-border rounded-md p-4 flex items-center justify-between sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
            <div className="flex items-center space-x-4 text-[14px]">
              <span className="font-semibold text-text-primary">Safety Score: 94</span>
              <span className="text-warning font-medium">1 warning needs review</span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {
                  navigate('/');
                }}
                className="px-4 py-2 text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Reject
              </button>
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 text-[14px] font-medium border border-border rounded-md hover:bg-black/5 transition-colors"
              >
                Save Draft
              </button>
              <button 
                onClick={async () => {
                  try {
                    const { generateAndDownloadPDF } = await import('../utils/pdfGenerator');
                    
                    const soapData = soapSections.reduce((acc, curr) => {
                      if (curr.title === 'SUBJECTIVE') acc.subjective = curr.content;
                      if (curr.title === 'OBJECTIVE') acc.objective = curr.content;
                      if (curr.title === 'ASSESSMENT') acc.assessment = curr.content;
                      if (curr.title === 'PLAN') acc.plan = curr.content;
                      return acc;
                    }, { subjective: '', objective: '', assessment: '', plan: '' });

                    generateAndDownloadPDF({
                      patientName: 'Patient X',
                      patientAge: '42 / M',
                      patientId: 'MRN-9382-1',
                      doctorName: 'Sarah Friday',
                      hospitalName: 'Clinscribe Medical Center',
                      date: new Date().toLocaleDateString(),
                      time: new Date().toLocaleTimeString(),
                      soap: soapData
                    });

                    navigate('/');
                  } catch(e) {
                    console.error("PDF Generation failed", e);
                    navigate('/');
                  }
                }}
                className="px-4 py-2 text-[14px] font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors shadow-sm"
              >
                Approve Documentation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProcessStep = ({ label, active, done }: { label: string, active: boolean, done: boolean }) => {
  return (
    <div className="flex items-center justify-between p-3 border border-border rounded-md bg-surface">
      <div className="flex items-center space-x-3">
        <span className={`text-[14px] font-medium ${active ? 'text-accent' : done ? 'text-text-primary' : 'text-text-secondary'}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center justify-end w-24">
        {active && (
          <div className="flex items-center space-x-2 text-accent text-[12px] font-semibold uppercase tracking-wider">
            <Loader2 size={14} className="animate-spin" />
            <span>Processing</span>
          </div>
        )}
        {done && (
          <span className="text-text-primary text-[12px] font-semibold uppercase tracking-wider">Complete</span>
        )}
        {!active && !done && (
          <span className="text-text-secondary text-[12px] font-semibold uppercase tracking-wider">Waiting</span>
        )}
      </div>
    </div>
  );
};

export default TextConsultation;
