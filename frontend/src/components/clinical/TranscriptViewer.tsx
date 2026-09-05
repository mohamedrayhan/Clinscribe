
import clsx from 'clsx';
import { Clock } from 'lucide-react';

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
    <div className="w-full bg-surface border border-border rounded-md flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/50">
        <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">Clinical Transcript</h2>
        <div className="flex items-center space-x-1.5 text-text-secondary">
          <Clock size={14} />
          <span className="text-[12px] font-medium tracking-wide">{duration}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {segments.map((segment) => (
          <div 
            key={segment.id} 
            onClick={() => onSegmentClick && onSegmentClick(segment.id)}
            className={clsx(
              "group relative pl-4 border-l-2 py-0.5 transition-colors cursor-pointer",
              segment.speaker === 'Doctor' ? "border-text-primary" : "border-text-secondary/30",
              segment.isHighlighted ? "bg-accent/10 -mx-2 px-6 border-accent rounded-r-sm" : "hover:bg-black/[0.02] -mx-2 px-6"
            )}
          >
            <div className="flex items-baseline space-x-3 mb-1">
              <span className={clsx(
                "text-[11px] font-bold uppercase tracking-widest",
                segment.speaker === 'Doctor' ? "text-text-primary" : "text-text-secondary"
              )}>
                {segment.speaker}
              </span>
              {segment.timestamp && (
                <span className="text-[11px] text-text-secondary/50 font-medium">{segment.timestamp}</span>
              )}
            </div>
            <p className={clsx(
              "text-[15px] leading-relaxed",
              segment.speaker === 'Doctor' ? "text-text-primary" : "text-text-secondary"
            )}>
              {segment.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptViewer;
