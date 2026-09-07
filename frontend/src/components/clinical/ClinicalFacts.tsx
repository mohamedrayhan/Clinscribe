import { CheckCircle2, XCircle, Clock, Pill, Activity } from 'lucide-react';

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
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-card flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-primary-600" />
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Clinical Findings</h2>
        </div>
        <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700 border border-primary-100">
          Extracted
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Symptoms */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>Reported Symptoms</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">({symptoms.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {symptoms.length > 0 ? symptoms.map((sym, idx) => (
              <span 
                key={sym.id || idx}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50/70 px-2.5 py-1 text-xs font-semibold text-emerald-800"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{sym.name}</span>
              </span>
            )) : (
              <p className="text-xs italic text-slate-400">No positive symptoms noted</p>
            )}
          </div>
        </div>

        {/* Negated */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle size={13} className="text-rose-500" />
              <span>Negated / Ruled Out</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">({negated.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {negated.length > 0 ? negated.map((neg, idx) => (
              <span 
                key={neg.id || idx}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200/80 bg-rose-50/70 px-2.5 py-1 text-xs font-semibold text-rose-800 line-through decoration-rose-400"
              >
                <span>{neg.name}</span>
              </span>
            )) : (
              <p className="text-xs italic text-slate-400">None noted</p>
            )}
          </div>
        </div>

        {/* Duration */}
        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock size={13} className="text-amber-500" />
            <span>Symptom Duration</span>
          </h3>
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 px-3 py-2 text-xs font-semibold text-amber-900">
            {duration || <span className="italic text-slate-400 font-normal">Not documented</span>}
          </div>
        </div>

        {/* Medications */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Pill size={13} className="text-indigo-500" />
              <span>Medications Mentioned</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">({medications.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {medications.length > 0 ? medications.map((med, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200/80 bg-indigo-50/70 px-2.5 py-1 text-xs font-semibold text-indigo-800"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <span>{med}</span>
              </span>
            )) : (
              <p className="text-xs italic text-slate-400">No medications identified</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClinicalFacts;
