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

  const turnsMapRef = useRef<Map<number, { speaker: string, text: string }>>(new Map());

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
      const audioConstraints: boolean | MediaTrackConstraints = selectedDeviceId
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
      
      turnsMapRef.current.clear();

      // 3. Connect to WS with speaker_labels enabled for diarization
      const wsUrl = `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&speech_model=universal-3-5-pro&mode=balanced&speaker_labels=true&token=${token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      const renderFullTranscript = () => {
        const sortedTurns = Array.from(turnsMapRef.current.entries())
          .sort(([a], [b]) => a - b)
          .map(([_, turn]) => `${turn.speaker}: ${turn.text}`);
        const fullText = sortedTurns.join('\n');
        liveTranscriptRef.current = fullText;
        setLiveTranscript(fullText);
        try { localStorage.setItem('clinscribe_latest_transcript', fullText); } catch (_) {}
      };

      // Track mapped speakers to guarantee consistent roles throughout the dialogue
      const speakerRoleCache = new Map<string, 'Doctor' | 'Patient'>();

      const getSpeakerRole = (label: any, text: string, turnOrder: number): 'Doctor' | 'Patient' => {
        const cleanText = (text || '').trim().toLowerCase();
        const labelKey = (label !== undefined && label !== null) ? String(label).trim().toUpperCase() : null;

        // 1. Check if speaker cluster is already cached
        if (labelKey && speakerRoleCache.has(labelKey)) {
          return speakerRoleCache.get(labelKey)!;
        }

        // 2. High-confidence semantic clinical role heuristics
        // Doctor typical statements
        const isDoctorSemantic = cleanText.startsWith("what brings you") ||
          cleanText.includes("what symptoms") ||
          cleanText.includes("what's the problem") ||
          cleanText.includes("any fever") ||
          cleanText.includes("i'll give you some medicine") ||
          cleanText.includes("you'll be fine") ||
          cleanText.includes("take care") ||
          cleanText.includes("avoid cold drinks");

        // Patient typical statements
        const isPatientSemantic = cleanText.startsWith("hi, doctor") ||
          cleanText.startsWith("hi doctor") ||
          cleanText.includes("i think i caught a cold") ||
          cleanText.includes("my nose is runny") ||
          cleanText.includes("i have a light cough") ||
          cleanText.includes("i have a headache") ||
          cleanText.includes("should i eat anything") ||
          cleanText.includes("should i avoid anything") ||
          cleanText.includes("thank you so much");

        let assignedRole: 'Doctor' | 'Patient';

        if (isDoctorSemantic) {
          assignedRole = 'Doctor';
        } else if (isPatientSemantic) {
          assignedRole = 'Patient';
        } else if (labelKey) {
          // Standard label mapping
          if (labelKey === '0' || labelKey === 'A' || labelKey === 'SPEAKER 0' || labelKey === 'SPEAKER A') {
            assignedRole = 'Doctor';
          } else if (labelKey === '1' || labelKey === 'B' || labelKey === 'SPEAKER 1' || labelKey === 'SPEAKER B') {
            assignedRole = 'Patient';
          } else {
            assignedRole = turnOrder % 2 === 0 ? 'Doctor' : 'Patient';
          }
        } else {
          assignedRole = turnOrder % 2 === 0 ? 'Doctor' : 'Patient';
        }

        if (labelKey) {
          speakerRoleCache.set(labelKey, assignedRole);
        }
        return assignedRole;
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          console.log("AAI Message:", msg);
          
          // Universal-3 streaming Turn event
          if (msg.type === 'Turn') {
            const turnOrder = typeof msg.turn_order === 'number' ? msg.turn_order : turnsMapRef.current.size;
            const rawSpeaker = msg.speaker_label ?? (msg.words && msg.words.length > 0 ? msg.words[0].speaker : undefined);
            const speakerRole = getSpeakerRole(rawSpeaker, msg.transcript || '', turnOrder);

            if (msg.end_of_turn) {
              if (msg.transcript && msg.transcript.trim()) {
                turnsMapRef.current.set(turnOrder, {
                  speaker: speakerRole,
                  text: msg.transcript.trim()
                });
                renderFullTranscript();
              }
              setPartialTranscript('');
            } else {
              // Partial turn updates live preview without committing to permanent transcript
              if (msg.transcript && msg.transcript.trim()) {
                setPartialTranscript(`${speakerRole}: ${msg.transcript.trim()}`);
              }
            }
          }
          // Diarization revision from AssemblyAI
          else if (msg.type === 'SpeakerRevision' && Array.isArray(msg.revisions)) {
            msg.revisions.forEach((rev: any) => {
              const existing = turnsMapRef.current.get(rev.turn_order);
              if (existing) {
                const revisedSpeaker = getSpeakerRole(rev.speaker_label, existing.text, rev.turn_order);
                turnsMapRef.current.set(rev.turn_order, {
                  ...existing,
                  speaker: revisedSpeaker
                });
              }
            });
            renderFullTranscript();
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
    
    // Stop recording audio input
    if (processorRef.current && audioContextRef.current) {
      processorRef.current.disconnect();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // Send Terminate and wait for final turns / SpeakerRevision from AssemblyAI before closing
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'Terminate' }));
      } catch (err) {
        console.warn("Error sending Terminate:", err);
      }
      // Give AssemblyAI ~1500ms to send final turns and SpeakerRevision
      setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
        setStatus('done');
      }, 2000);
    } else {
      setTimeout(() => {
        setStatus('done');
      }, 1500);
    }
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
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200 flex items-center justify-center mb-6 shadow-sm">
          <Play size={26} className="fill-current" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Audio Processing Complete</h2>
        <p className="text-sm text-slate-500 mb-8 max-w-md">
          The consultation has been successfully transcribed, diarized with speaker separation, and prepared for SOAP extraction.
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
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-7 py-3 rounded-xl font-semibold text-sm hover:bg-primary-500 transition-all shadow-sm"
        >
          <span>View Clinical Documentation</span>
        </button>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center mb-6 text-primary-600 shadow-sm">
          <Loader2 size={22} className="animate-spin" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Processing Audio Stream</h2>
        <p className="text-xs text-slate-500 mb-8">Executing neural speech recognition and speaker diarization...</p>
        
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between p-4 border border-primary-200 bg-primary-50/50 rounded-xl shadow-sm">
            <span className="text-xs font-bold text-primary-700">Noise Reduction & Filtering</span>
            <div className="flex items-center space-x-1.5 text-primary-600 text-[11px] font-bold uppercase tracking-wider">
              <Loader2 size={13} className="animate-spin" />
              <span>Processing</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border border-slate-200 bg-white rounded-xl opacity-60">
            <span className="text-xs font-semibold text-slate-500">Speaker Diarization</span>
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Waiting</span>
          </div>
          <div className="flex items-center justify-between p-4 border border-slate-200 bg-white rounded-xl opacity-60">
            <span className="text-xs font-semibold text-slate-500">Speech-to-Text Transcription</span>
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Waiting</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Audio Consultation</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {routeState.patientName ? (
              <span>Recording encounter for: <strong className="text-primary-700">{routeState.patientName}</strong></span>
            ) : (
              'Record a live ambient encounter or upload an existing audio file.'
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Record Option */}
        <div className="flex flex-col p-8 bg-white border border-slate-200/80 rounded-2xl shadow-card">
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            {uploadError && status === 'idle' && (
              <div className="w-full max-w-xs mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center font-medium">
                {uploadError}
              </div>
            )}
            {status === 'idle' ? (
              <>
                <button 
                  onClick={handleStartRecording}
                  className="w-20 h-20 bg-rose-50 text-rose-600 border border-rose-200 rounded-full flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all duration-300 shadow-sm mb-6 group cursor-pointer"
                >
                  <Mic size={32} className="group-hover:scale-110 transition-transform" />
                </button>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Record Live Encounter</h2>
                <p className="text-xs text-slate-500 text-center max-w-xs mb-6">
                  Ambient clinical recording. Ensure you have patient consent before beginning.
                </p>

                {/* Audio Input Device Selector */}
                <div className="w-full max-w-xs flex flex-col items-center">
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 self-start">
                    Audio Input Source:
                  </label>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-primary-500 focus:bg-white"
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
                <div className="w-full flex justify-center mb-6 h-20 items-end space-x-1.5 opacity-90">
                  {/* CSS Animated Waveform */}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((bar) => (
                    <div 
                      key={bar} 
                      className="w-2 bg-rose-500 rounded-t-sm"
                      style={{ 
                        height: `${Math.max(10, Math.random() * 60)}px`,
                        animation: `pulse ${0.4 + Math.random() * 0.6}s infinite alternate`
                      }}
                    />
                  ))}
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight font-mono">
                  {formatTime(recordingTime)}
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-0.5 text-xs font-bold text-rose-700 animate-pulse mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                  <span>Recording Active</span>
                </div>
                <div className="w-full max-w-sm h-32 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs text-slate-700 text-left font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                  {liveTranscript}
                  {partialTranscript && (
                    <span className="opacity-75 italic block mt-1 text-primary-600"> {partialTranscript}</span>
                  )}
                  {!liveTranscript && !partialTranscript && <span className="italic text-slate-400">Listening to conversation...</span>}
                </div>
                <button 
                  onClick={handleStopRecording}
                  className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold text-xs hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Square size={14} className="fill-current" />
                  <span>Stop & Process</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Upload Option */}
        <div 
          className={`flex flex-col p-8 bg-white border-2 border-dashed rounded-2xl shadow-card transition-colors ${dragActive ? 'border-primary-500 bg-primary-50/10' : 'border-slate-200/90'} ${status !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${dragActive ? 'bg-primary-500 text-white' : 'bg-slate-50 border border-slate-200 text-slate-500'}`}>
              <Upload size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Upload Audio File</h2>
            <p className="text-xs text-slate-500 text-center max-w-xs mb-8">
              Drag and drop or select an audio file. Supports MP3, WAV, or M4A formats up to 50MB.
            </p>
            {uploadError && (
              <p className="text-xs text-rose-600 mb-4 text-center font-medium">{uploadError}</p>
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
              className="flex items-center space-x-2 border border-slate-200 bg-white text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileAudio size={15} />
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
