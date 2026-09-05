import { X } from 'lucide-react';

interface FactItem {
  id: string;
  name: string;
  status?: 'present' | 'absent' | 'uncertain';
}

interface ClinicalFactsProps {
  symptoms: FactItem[];
  negated: FactItem[];
  duration: string;
  medications: string[];
}

const ClinicalFacts = ({ symptoms, negated, duration, medications }: ClinicalFactsProps) => {
  return (
    <div className="w-full bg-surface border border-border rounded-md flex flex-col h-full">
      <div className="p-4 border-b border-border bg-background/50">
        <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">Clinical Findings</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Symptoms */}
        <section>
          <h3 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3 border-b border-border pb-1">Symptoms</h3>
          <ul className="space-y-1.5">
            {symptoms.length > 0 ? symptoms.map(sym => (
              <li key={sym.id} className="text-[14px] text-text-primary flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-text-primary rounded-full"></span>
                <span>{sym.name}</span>
              </li>
            )) : <li className="text-[13px] text-text-secondary italic">Not documented</li>}
          </ul>
        </section>

        {/* Negated */}
        <section>
          <h3 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3 border-b border-border pb-1">Negated</h3>
          <ul className="space-y-1.5">
            {negated.length > 0 ? negated.map(neg => (
              <li key={neg.id} className="text-[14px] text-text-secondary flex items-center space-x-2 line-through opacity-80">
                <X size={14} className="text-text-secondary" />
                <span>{neg.name}</span>
              </li>
            )) : <li className="text-[13px] text-text-secondary italic">None noted</li>}
          </ul>
        </section>

        {/* Duration */}
        <section>
          <h3 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3 border-b border-border pb-1">Duration</h3>
          <p className="text-[14px] text-text-primary pl-3">{duration || <span className="italic text-text-secondary text-[13px]">Not documented</span>}</p>
        </section>

        {/* Medications */}
        <section>
          <h3 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3 border-b border-border pb-1">Medications</h3>
          <ul className="space-y-1.5">
            {medications.length > 0 ? medications.map((med, idx) => (
              <li key={idx} className="text-[14px] text-text-primary flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-text-primary rounded-full"></span>
                <span>{med}</span>
              </li>
            )) : <li className="text-[13px] text-text-secondary italic pl-3">Not documented</li>}
          </ul>
        </section>

      </div>
    </div>
  );
};

export default ClinicalFacts;
