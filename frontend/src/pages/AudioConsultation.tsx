import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, Upload, Square, Loader2, Play, FileAudio } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const AudioConsultation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as { patientId?: number, patientName?: string } || {};
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [liveTranscript, setLiveTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const liveTranscriptRef = useRef('');

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Load available audio input devices (e.g. Laptop mic, Bluetooth headset)
  useEffect(() => {
    const loadAudioDevices = async () => {
      try {
        // Enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        setAudioDevices(audioInputs);
        if (audioInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      } catch (err) {
        console.warn("Could not enumerate audio devices:", err);
      }
    };

    loadAudioDevices();
    navigator.mediaDevices?.addEventListener('devicechange', loadAudioDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', loadAudioDevices);
    };
  }, []);

  // Formatting for timer (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === 'recording') {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleStartRecording = async () => {
    try {
      setUploadError('');
      setLiveTranscript('');
      setPartialTranscript('');
      
      // 1. Get selected mic with explicit deviceId if chosen
      const audioConstraints: MediaTrackConstraints = selectedDeviceId
        ? { deviceId: { exact: selectedDeviceId } }
        : true;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      mediaStreamRef.current = stream;

      // Refresh devices to get full labels if permission was just granted
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        setAudioDevices(audioInputs);
      } catch (_) {}
      
      // 2. Get Token
      const res = await fetch('http://127.0.0.1:8000/api/aai-token');
      if (!res.ok) {
        throw new Error("Failed to authenticate with AssemblyAI");
      }
      const { token } = await res.json();
      
      // 3. Connect to WS with speaker_labels enabled for diarization
      const wsUrl = `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&speech_model=universal-3-5-pro&mode=balanced&speaker_labels=true&token=${token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      const formatSpeakerTag = (label?: string | number) => {
        if (!label && label !== 0) return 'Person 1';
        const str = String(label).toUpperCase();
        if (str === 'A' || str === '0' || str === 'SPEAKER 0' || str === 'SPEAKER A' || str === '1') {
          return 'Doctor';
        }
        if (str === 'B' || str === '1' || str === 'SPEAKER 1' || str === 'SPEAKER B' || str === '2') {
          return 'Patient';
        }
        return `Speaker ${label}`;
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          console.log("AAI Message:", msg);
          
          // Universal-3 streaming uses 'Turn' with 'transcript' and optional 'speaker_label'
          if (msg.type === 'Turn') {
            const rawSpeaker = msg.speaker_label ?? (msg.words && msg.words[0]?.speaker);
            const speakerTag = formatSpeakerTag(rawSpeaker);

            if (msg.end_of_turn && msg.transcript?.trim()) {
              const formattedLine = `${speakerTag}: ${msg.transcript.trim()}`;
              setLiveTranscript(prev => {
                const updated = prev ? `${prev}\n${formattedLine}` : formattedLine;
                liveTranscriptRef.current = updated;
                try { localStorage.setItem('clinscribe_latest_transcript', updated); } catch (_) {}
                return updated;
              });
              setPartialTranscript('');
            } else if (msg.transcript?.trim()) {
              setPartialTranscript(`${speakerTag}: ${msg.transcript.trim()}`);
            }
          } 
          // Older/fallback format compatibility
          else if (msg.message_type === 'FinalTranscript' && msg.text?.trim()) {
            const speakerTag = formatSpeakerTag(msg.speaker);
            const formattedLine = `${speakerTag}: ${msg.text.trim()}`;
            setLiveTranscript(prev => {
              const updated = prev ? `${prev}\n${formattedLine}` : formattedLine;
              liveTranscriptRef.current = updated;
              try { localStorage.setItem('clinscribe_latest_transcript', updated); } catch (_) {}
              return updated;
            });
            setPartialTranscript('');
          } else if (msg.message_type === 'PartialTranscript' && msg.text?.trim()) {
            const speakerTag = formatSpeakerTag(msg.speaker);
            setPartialTranscript(`${speakerTag}: ${msg.text.trim()}`);
          }
        } catch (err) {
          console.error("Error parsing WS message:", err);
        }
      };
      
      ws.onclose = (e) => {
        console.warn("AAI WebSocket closed. Code:", e.code, "Reason:", e.reason);
      };
      
      ws.onopen = async () => {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        // In many browsers, sampleRate in constructor might be fixed to hardware (e.g. 44100 or 48000)
        const context = new AudioContextClass();
        audioContextRef.current = context;
        
        if (context.state === 'suspended') {
          await context.resume();
        }
        
        const actualSampleRate = context.sampleRate;
        const targetSampleRate = 16000;
        console.log(`AudioContext initialized at ${actualSampleRate} Hz, target: ${targetSampleRate} Hz`);

        const source = context.createMediaStreamSource(stream);
        // Buffer size 4096 gives ~85ms chunks at 48kHz or ~256ms at 16kHz
        const processor = context.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        
        // Gain 0 prevents feedback loop into speakers
        const gainNode = context.createGain();
        gainNode.gain.value = 0;
        
        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Resample down to 16000 Hz if hardware runs at 44100 / 48000 Hz
            let outputData: Float32Array;
            if (actualSampleRate === targetSampleRate) {
              outputData = inputData;
            } else {
              const ratio = actualSampleRate / targetSampleRate;
              const newLength = Math.round(inputData.length / ratio);
              outputData = new Float32Array(newLength);
              for (let i = 0; i < newLength; i++) {
                const srcIndex = Math.min(Math.round(i * ratio), inputData.length - 1);
                outputData[i] = inputData[srcIndex];
              }
            }
            
            // Convert to 16-bit PCM (little endian)
            const pcm16 = new Int16Array(outputData.length);
            for (let i = 0; i < outputData.length; i++) {
              const s = Math.max(-1, Math.min(1, outputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            ws.send(pcm16.buffer);
          }
        };
        
        source.connect(processor);
        processor.connect(gainNode);
        gainNode.connect(context.destination);
        
        setStatus('recording');
      };
      
      ws.onerror = (e) => {
        console.error("WebSocket error:", e);
        setUploadError("Connection to AssemblyAI failed.");
        setStatus('idle');
      };
      
    } catch (err) {
      console.error("Recording error:", err);
      setUploadError("Could not start recording. Check microphone permissions.");
      setStatus('idle');
    }
  };

  const handleStopRecording = () => {
    setStatus('processing');
    
    // Stop recording logic
    if (processorRef.current && audioContextRef.current) {
      processorRef.current.disconnect();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'Terminate' }));
      wsRef.current.close();
    }
    
    setTimeout(() => {
      setStatus('done');
    }, 2500);
  };

  const validateFile = (file: File) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/m4a', 'audio/mp4'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file format. Please upload MP3, WAV, or M4A.');
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File exceeds 50MB limit.');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setUploadError('');
        setStatus('processing');
        setTimeout(() => {
          setStatus('done');
        }, 2500);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setUploadError('');
        setStatus('processing');
        setTimeout(() => {
          setStatus('done');
        }, 2500);
      }
    }
  };

  if (status === 'done') {
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
          onClick={() => {
            const finalTranscript = liveTranscriptRef.current.trim() || liveTranscript.trim();
            navigate('/consultations/new/text', { 
              state: { 
                ...routeState, 
                liveTranscript: finalTranscript 
              } 
            });
          }}
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
          <div className="flex items-center justify-between p-3 border border-border rounded-md bg-surface shadow-sm">
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
            {uploadError && status === 'idle' && (
              <div className="w-full max-w-xs mb-6 p-3 bg-critical/10 border border-critical/20 rounded-md text-[13px] text-critical text-center font-medium">
                {uploadError}
              </div>
            )}
            {status === 'idle' ? (
              <>
                <button 
                  onClick={handleStartRecording}
                  className="w-20 h-20 bg-critical/10 text-critical rounded-full flex items-center justify-center hover:bg-critical/20 transition-colors mb-6"
                >
                  <Mic size={32} />
                </button>
                <h2 className="text-[18px] font-semibold text-text-primary mb-2">Record Live</h2>
                <p className="text-[14px] text-text-secondary text-center max-w-xs mb-5">
                  Browser-based recording. Ensure you have patient consent before beginning.
                </p>

                {/* Audio Input Device Selector */}
                <div className="w-full max-w-xs flex flex-col items-center">
                  <label className="text-[12px] font-medium text-text-secondary mb-1.5 self-start">
                    Audio Input Source:
                  </label>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-[13px] text-text-primary focus:outline-none focus:border-accent"
                  >
                    {audioDevices.length === 0 ? (
                      <option value="">Default Microphone</option>
                    ) : (
                      audioDevices.map((dev, idx) => (
                        <option key={dev.deviceId || idx} value={dev.deviceId}>
                          {dev.label || `Microphone ${idx + 1}`}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="w-full flex justify-center mb-6 h-20 items-end space-x-1 opacity-70">
                  {/* CSS Animated Waveform Mock */}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                    <div 
                      key={bar} 
                      className="w-2 bg-critical rounded-t-sm"
                      style={{ 
                        height: `${Math.max(10, Math.random() * 60)}px`,
                        animation: `pulse ${0.5 + Math.random()}s infinite alternate`
                      }}
                    />
                  ))}
                </div>
                <div className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
                  {formatTime(recordingTime)}
                </div>
                <p className="text-[14px] text-critical font-medium uppercase tracking-wider animate-pulse mb-4">
                  Recording Active
                </p>
                <div className="w-full max-w-sm h-32 overflow-y-auto bg-black/[0.02] border border-border rounded-md p-4 mb-8 text-[13px] text-text-secondary text-left font-mono whitespace-pre-wrap leading-relaxed">
                  {liveTranscript}
                  {partialTranscript && (
                    <span className="opacity-60 italic block mt-1 text-accent"> {partialTranscript}</span>
                  )}
                  {!liveTranscript && !partialTranscript && <span className="italic text-text-secondary">Listening...</span>}
                </div>
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
        <div 
          className={`flex flex-col p-8 bg-surface border-2 border-dashed rounded-xl transition-colors ${dragActive ? 'border-accent bg-accent/5' : 'border-border'} ${status !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${dragActive ? 'bg-accent/10 text-accent' : 'bg-background border border-border text-text-secondary'}`}>
              <Upload size={24} />
            </div>
            <h2 className="text-[18px] font-semibold text-text-primary mb-2">Upload Audio</h2>
            <p className="text-[14px] text-text-secondary text-center max-w-xs mb-8">
              Drag and drop or click to select. Supports MP3, WAV, or M4A formats. Max size 50MB.
            </p>
            {uploadError && (
              <p className="text-[13px] text-critical mb-4 text-center">{uploadError}</p>
            )}
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4"
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 border border-border bg-background text-text-primary px-6 py-2.5 rounded-md font-medium text-[14px] hover:bg-black/5 transition-colors"
            >
              <FileAudio size={16} />
              <span>Select File</span>
            </button>
          </div>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { height: 10px; }
          100% { height: 60px; }
        }
      `}} />
    </div>
  );
};

export default AudioConsultation;
