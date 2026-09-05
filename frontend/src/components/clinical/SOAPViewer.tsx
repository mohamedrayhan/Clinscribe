
import clsx from 'clsx';

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

const SOAPViewer = ({ sections, onEvidenceClick, activeEvidenceIds = [] }: SOAPViewerProps) => {
  return (
    <div className="w-full bg-surface border border-border rounded-md flex flex-col h-full">
      <div className="p-4 border-b border-border bg-background/50 flex justify-between items-center">
        <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">SOAP Documentation</h2>
        <span className="text-[11px] font-semibold text-text-secondary bg-background px-2 py-0.5 rounded border border-border uppercase tracking-widest">Draft</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {sections.map((section, index) => {
          const isActive = section.sourceTranscriptIds?.some(id => activeEvidenceIds.includes(id));
          return (
            <div 
              key={index}
              onClick={() => onEvidenceClick && section.sourceTranscriptIds && onEvidenceClick(section.sourceTranscriptIds)}
              className={clsx(
                "transition-all duration-200 border-l-2 py-1 -ml-2 pl-2",
                section.sourceTranscriptIds ? "cursor-pointer hover:bg-black/[0.02]" : "",
                isActive ? "border-accent bg-accent/[0.03]" : "border-transparent",
                section.isFlagged && !isActive ? "bg-warning/10 border-warning" : ""
              )}
            >
              <h3 className="text-[13px] font-bold text-text-primary mb-2 flex items-center">
                <span className={clsx(
                  "w-5 h-5 rounded border flex items-center justify-center mr-2 text-[11px] transition-colors",
                  isActive ? "bg-accent text-white border-accent" : "bg-background border-border"
                )}>
                  {section.letter}
                </span>
                {section.title}
                {section.sourceTranscriptIds && (
                  <span className={clsx(
                    "ml-auto text-[11px] font-medium tracking-wide transition-opacity",
                    isActive ? "text-accent opacity-100" : "text-text-secondary opacity-0 group-hover:opacity-100"
                  )}>
                    {isActive ? "● Evidence highlighted" : "View evidence"}
                  </span>
                )}
              </h3>
              <p className={clsx(
                "text-[15px] leading-relaxed pl-7 whitespace-pre-wrap",
                section.content === 'Not documented.' ? "text-text-secondary italic" : "text-text-primary"
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
