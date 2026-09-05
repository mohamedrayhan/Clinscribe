import React, { useState } from 'react';
import { ArrowLeft, Mic, Upload, Square, Loader2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AudioConsultation = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);

  // Formatting for timer (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === 'recording') {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleStartRecording = () => {
    setStatus('recording');
    // In a real app, we would use MediaRecorder API here
  };

  const handleStopRecording = () => {
    setStatus('processing');
    // Simulate processing timeline jump to TextConsultation's completed state
    setTimeout(() => {
      setStatus('done');
    }, 2000);
  };

  const handleFileUpload = () => {
    setStatus('processing');
    setTimeout(() => {
      setStatus('done');
    }, 2000);
  };

  if (status === 'done') {
    // In a real flow, it would redirect to the split screen. For now, just a success state.
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center mt-20">
        <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
          <Play size={24} />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Processing Complete</h2>
        <p className="text-text-secondary mb-8 text-center max-w-md">
          The audio has been successfully transcribed, diarized, and analyzed.
        </p>
        <button 
          onClick={() => navigate('/consultations/new/text')}
          className="bg-accent text-white px-6 py-2.5 rounded-md font-medium text-[14px] hover:bg-accent/90 transition-colors"
        >
          View Clinical Documentation
        </button>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center mt-20">
        <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-8">Processing Audio</h2>
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between p-3 border border-border rounded-md bg-surface">
            <span className="text-[14px] font-medium text-accent">Noise Reduction & Segmentation</span>
            <div className="flex items-center space-x-2 text-accent text-[12px] font-semibold uppercase tracking-wider">
              <Loader2 size={14} className="animate-spin" />
              <span>Processing</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-md bg-surface opacity-50">
            <span className="text-[14px] font-medium text-text-secondary">Speaker Diarization</span>
            <span className="text-text-secondary text-[12px] font-semibold uppercase tracking-wider">Waiting</span>
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-md bg-surface opacity-50">
            <span className="text-[14px] font-medium text-text-secondary">Speech-to-Text Transcription</span>
            <span className="text-text-secondary text-[12px] font-semibold uppercase tracking-wider">Waiting</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-black/5 rounded-md text-text-secondary transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Audio Consultation</h1>
          <p className="text-text-secondary mt-1 text-[15px]">
            Record a live encounter or upload an existing audio file.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Record Option */}
        <div className="flex flex-col p-8 bg-surface border border-border rounded-xl">
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            {status === 'idle' ? (
              <>
                <button 
                  onClick={handleStartRecording}
                  className="w-20 h-20 bg-critical/10 text-critical rounded-full flex items-center justify-center hover:bg-critical/20 transition-colors mb-6"
                >
                  <Mic size={32} />
                </button>
                <h2 className="text-[18px] font-semibold text-text-primary mb-2">Record Live</h2>
                <p className="text-[14px] text-text-secondary text-center max-w-xs">
                  Ensure you have patient consent before beginning the recording.
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 border-4 border-critical/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <div className="w-16 h-16 bg-critical/20 text-critical rounded-full flex items-center justify-center">
                    <Mic size={28} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
                  {formatTime(recordingTime)}
                </div>
                <p className="text-[14px] text-critical font-medium uppercase tracking-wider animate-pulse mb-8">
                  Recording Active
                </p>
                <button 
                  onClick={handleStopRecording}
                  className="flex items-center space-x-2 bg-text-primary text-white px-6 py-2.5 rounded-md font-medium text-[14px] hover:bg-text-primary/90 transition-colors"
                >
                  <Square size={16} className="fill-current" />
                  <span>Stop & Process</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Upload Option */}
        <div className={`flex flex-col p-8 bg-surface border border-dashed border-border rounded-xl ${status !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 bg-background border border-border rounded-full flex items-center justify-center mb-6 text-text-secondary">
              <Upload size={24} />
            </div>
            <h2 className="text-[18px] font-semibold text-text-primary mb-2">Upload Audio</h2>
            <p className="text-[14px] text-text-secondary text-center max-w-xs mb-8">
              Supports MP3, WAV, or M4A formats. Max size 50MB.
            </p>
            <button 
              onClick={handleFileUpload}
              className="flex items-center space-x-2 border border-border bg-background text-text-primary px-6 py-2.5 rounded-md font-medium text-[14px] hover:bg-black/5 transition-colors"
            >
              <span>Select File</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AudioConsultation;
