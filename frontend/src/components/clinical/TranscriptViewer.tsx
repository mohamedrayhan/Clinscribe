
import clsx from 'clsx';
import { Clock, User, Stethoscope } from 'lucide-react';

export interface TranscriptSegment {
  id: string;
  speaker: 'Doctor' | 'Patient' | string;
  text: string;
  timestamp?: string;
  isHighlighted?: boolean;
}

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  onSegmentClick?: (id: string) => void;
  duration?: string;
}

const TranscriptViewer = ({ segments, onSegmentClick, duration = '08:42 MIN' }: TranscriptViewerProps) => {
  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-card flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Clinical Transcript</h2>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          <Clock size={13} className="text-slate-500" />
          <span>{duration}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {segments.map((segment) => {
          const isDoc = segment.speaker === 'Doctor';
          return (
            <div 
              key={segment.id} 
              onClick={() => onSegmentClick && onSegmentClick(segment.id)}
              className={clsx(
                "p-3.5 rounded-xl transition-all cursor-pointer border text-sm leading-relaxed",
                segment.isHighlighted 
                  ? "bg-primary-50/80 border-primary-300 ring-2 ring-primary-500/20 shadow-sm"
                  : isDoc 
                    ? "bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/60"
                    : "bg-white border-slate-200/90 hover:border-slate-300"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className={clsx(
                    "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold",
                    isDoc ? "bg-primary-600 text-white" : "bg-emerald-600 text-white"
                  )}>
                    {isDoc ? <Stethoscope size={11} /> : <User size={11} />}
                  </div>
                  <span className={clsx(
                    "text-xs font-bold tracking-tight",
                    isDoc ? "text-primary-950" : "text-emerald-950"
                  )}>
                    {segment.speaker}
                  </span>
                </div>
                {segment.timestamp && (
                  <span className="text-[11px] text-slate-400 font-medium">{segment.timestamp}</span>
                )}
              </div>
              <p className={clsx(
                "pl-6.5 text-[13.5px]",
                isDoc ? "text-slate-800" : "text-slate-700"
              )}>
                {segment.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranscriptViewer;
