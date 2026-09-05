import { AlertTriangle, CheckCircle } from 'lucide-react';

const SafetyReview = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Documentation Validation</h1>
        <p className="text-text-secondary mt-1">Review AI-generated documentation for clinical safety and factuality.</p>
      </div>

      <div className="bg-surface border border-border rounded-md p-6 mb-8 flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-text-primary">94 <span className="text-lg text-text-secondary font-medium">/ 100</span></div>
          <div className="text-[14px] text-text-secondary mt-1">Clinical consistency score</div>
        </div>
        <div className="flex space-x-8">
          <div className="text-center">
            <div className="text-xl font-semibold text-critical">0</div>
            <div className="text-[12px] text-text-secondary uppercase tracking-wider mt-1">Critical Issues</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-warning">1</div>
            <div className="text-[12px] text-text-secondary uppercase tracking-wider mt-1">Warnings</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-4 border-b border-border pb-2">Passed Checks</h2>
          <div className="space-y-3">
            <PassedCheck label="Unsupported information" />
            <PassedCheck label="Negation consistency" />
            <PassedCheck label="Medication consistency" />
            <PassedCheck label="Uncertainty preservation" />
          </div>
        </section>

        <section>
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-4 border-b border-border pb-2">Requires Review</h2>
          
          <div className="border border-warning rounded-md overflow-hidden">
            <div className="bg-warning/10 p-3 flex items-center space-x-2 border-b border-warning/20">
              <AlertTriangle size={16} className="text-warning" />
              <span className="text-[14px] font-semibold text-warning uppercase tracking-wider">Allergy Information Missing</span>
            </div>
            <div className="p-4 bg-surface">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-[12px] font-medium text-text-secondary uppercase mb-2">Transcript</h3>
                  <p className="text-[14px] text-text-primary p-3 bg-background rounded border border-border">
                    "I'm allergic to penicillin, I get a rash."
                  </p>
                </div>
                <div>
                  <h3 className="text-[12px] font-medium text-text-secondary uppercase mb-2">Generated Documentation</h3>
                  <p className="text-[14px] text-text-secondary italic p-3 bg-background rounded border border-border">
                    No allergy information documented.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="text-[13px] font-medium text-accent hover:underline">
                  Edit Documentation
                </button>
              </div>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
};

const PassedCheck = ({ label }: { label: string }) => (
  <div className="flex items-center space-x-3 text-[14px] text-text-primary">
    <CheckCircle size={16} className="text-success" />
    <span>{label}</span>
  </div>
);

export default SafetyReview;
