import { Mic, FileText, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const NewConsultation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { patientId?: number, patientName?: string } || {};

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          {state.patientName ? `New Encounter for ${state.patientName}` : 'New Clinical Encounter'}
        </h1>
        <p className="text-text-secondary mt-2 max-w-2xl text-[15px]">
          Create documentation from a consultation recording or paste an existing transcript.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Audio Option */}
        <div 
          onClick={() => navigate('/consultations/new/audio', { state })}
          className="group flex flex-col p-8 bg-surface border border-border hover:border-accent hover:shadow-sm transition-all rounded-xl cursor-pointer"
        >
          <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center mb-6 text-text-primary group-hover:text-accent group-hover:bg-accent/5 transition-colors">
            <Mic size={24} />
          </div>
          <h2 className="text-[18px] font-semibold text-text-primary mb-2">Audio Consultation</h2>
          <p className="text-[14px] text-text-secondary flex-1">
            Record a live consultation or upload an existing audio file for automatic diarization and transcription.
          </p>
          <div className="mt-8 flex items-center space-x-2 text-[14px] font-medium text-text-primary group-hover:text-accent transition-colors">
            <span>Start recording</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Text Option */}
        <div 
          onClick={() => navigate('/consultations/new/text', { state })}
          className="group flex flex-col p-8 bg-surface border border-border hover:border-accent hover:shadow-sm transition-all rounded-xl cursor-pointer"
        >
          <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center mb-6 text-text-primary group-hover:text-accent group-hover:bg-accent/5 transition-colors">
            <FileText size={24} />
          </div>
          <h2 className="text-[18px] font-semibold text-text-primary mb-2">Text Transcript</h2>
          <p className="text-[14px] text-text-secondary flex-1">
            Paste an existing consultation transcript to generate structured facts and a SOAP note.
          </p>
          <div className="mt-8 flex items-center space-x-2 text-[14px] font-medium text-text-primary group-hover:text-accent transition-colors">
            <span>Paste transcript</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewConsultation;
