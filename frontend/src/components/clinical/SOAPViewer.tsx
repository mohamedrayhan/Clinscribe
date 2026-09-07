
import clsx from 'clsx';
import { Sparkles, FileText, CheckCircle } from 'lucide-react';

interface SOAPSection {
  title: string;
  letter: string;
  content: string;
  isFlagged?: boolean;
  sourceTranscriptIds?: string[];
}

interface SOAPViewerProps {
  sections: SOAPSection[];
  onEvidenceClick?: (sourceIds: string[]) => void;
  activeEvidenceIds?: string[];
}

const letterStyles: Record<string, { bg: string, text: string, border: string }> = {
  S: { bg: 'bg-blue-50 text-blue-700', text: 'text-blue-700', border: 'border-blue-200' },
  O: { bg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-700', border: 'border-emerald-200' },
  A: { bg: 'bg-amber-50 text-amber-700', text: 'text-amber-700', border: 'border-amber-200' },
  P: { bg: 'bg-purple-50 text-purple-700', text: 'text-purple-700', border: 'border-purple-200' },
};

const SOAPViewer = ({ sections, onEvidenceClick, activeEvidenceIds = [] }: SOAPViewerProps) => {
  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-card flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-primary-600" />
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">SOAP Documentation</h2>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
          <CheckCircle size={11} className="text-emerald-600" />
          <span>Qwen Verified</span>
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {sections.map((section, index) => {
          const isActive = section.sourceTranscriptIds?.some(id => activeEvidenceIds.includes(id));
          const style = letterStyles[section.letter] || { bg: 'bg-slate-100 text-slate-700', text: 'text-slate-700', border: 'border-slate-200' };

          return (
            <div 
              key={index}
              onClick={() => onEvidenceClick && section.sourceTranscriptIds && onEvidenceClick(section.sourceTranscriptIds)}
              className={clsx(
                "rounded-xl border p-4 transition-all duration-200",
                section.sourceTranscriptIds ? "cursor-pointer" : "",
                isActive 
                  ? "border-primary-400 bg-primary-50/60 ring-2 ring-primary-500/20 shadow-sm" 
                  : "border-slate-200/80 bg-slate-50/30 hover:border-slate-300 hover:bg-slate-50/70",
                section.isFlagged && !isActive ? "bg-amber-50/50 border-amber-300" : ""
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    "flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold border",
                    isActive ? "bg-primary-600 text-white border-primary-600 shadow-sm" : `${style.bg} ${style.border}`
                  )}>
                    {section.letter}
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {section.title}
                  </h3>
                </div>

                {section.sourceTranscriptIds && (
                  <button 
                    type="button"
                    className={clsx(
                      "text-[11px] font-semibold transition-colors flex items-center gap-1",
                      isActive ? "text-primary-700 underline font-bold" : "text-slate-400 hover:text-primary-600"
                    )}
                  >
                    <Sparkles size={11} />
                    <span>{isActive ? "Evidence Active" : "Inspect Link"}</span>
                  </button>
                )}
              </div>

              <p className={clsx(
                "text-[13.5px] leading-relaxed pl-8 whitespace-pre-wrap",
                section.content === 'Not documented.' ? "text-slate-400 italic" : "text-slate-700"
              )}>
                {section.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SOAPViewer;
