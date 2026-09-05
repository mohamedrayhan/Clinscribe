import { Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Good morning, Dr. Sarah</h1>
        <p className="text-text-secondary mt-1">Friday, September 4</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Workflow */}
        <div className="md:col-span-8 space-y-10">
          
          <section>
            <div className="border-b border-border pb-3 mb-5 flex justify-between items-end">
              <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">Today's Workflow</h2>
              <span className="text-sm font-medium text-text-primary">12 Consultations</span>
            </div>
            
            <div className="flex gap-4 mb-8">
              <div className="flex-1 flex items-center space-x-3 p-4 border border-border bg-surface rounded-md">
                <div className="p-2 bg-warning/10 text-warning rounded-full">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[13px] text-text-secondary">Awaiting Review</p>
                  <p className="text-xl font-semibold text-text-primary">3</p>
                </div>
              </div>
              <div className="flex-1 flex items-center space-x-3 p-4 border border-border bg-surface rounded-md">
                <div className="p-2 bg-critical/10 text-critical rounded-full">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <p className="text-[13px] text-text-secondary">Safety Flags</p>
                  <p className="text-xl font-semibold text-text-primary">1</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="border-b border-border pb-3 mb-5">
              <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">Active Consultations</h2>
            </div>
            
            <div className="space-y-0 divide-y divide-border border border-border rounded-md bg-surface overflow-hidden">
              <ConsultationRow 
                time="09:30" 
                patient="Emma Thompson" 
                status="READY FOR REVIEW" 
                statusColor="text-warning bg-warning/10" 
              />
              <ConsultationRow 
                time="10:15" 
                patient="James Wilson" 
                status="PROCESSING" 
                statusColor="text-text-secondary bg-background border border-border" 
              />
              <ConsultationRow 
                time="11:00" 
                patient="Robert Chen" 
                status="DRAFT" 
                statusColor="text-text-secondary bg-background border border-border" 
              />
            </div>
          </section>

        </div>

        {/* Right Column: Quality */}
        <div className="md:col-span-4 space-y-10">
          <section>
            <div className="border-b border-border pb-3 mb-5">
              <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">Documentation Quality</h2>
            </div>
            
            <div className="p-5 border border-border bg-surface rounded-md">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-success/10 text-success rounded-full">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-text-primary tracking-tight">94.2%</p>
                  <p className="text-[13px] text-text-secondary">Avg. Factual Consistency</p>
                </div>
              </div>
              
              <div className="space-y-3 mt-6">
                <MetricBar label="Factual Consistency" value={96} />
                <MetricBar label="Negation Preservation" value={99} />
                <MetricBar label="Medication Safety" value={100} />
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

const ConsultationRow = ({ time, patient, status, statusColor }: { time: string, patient: string, status: string, statusColor: string }) => {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-black/[0.02] transition-colors cursor-pointer">
      <div className="flex items-center space-x-6">
        <span className="text-[14px] font-medium text-text-secondary w-12">{time}</span>
        <div className="flex items-center space-x-3">
          <FileText size={16} className="text-text-secondary" />
          <span className="text-[15px] font-medium text-text-primary">{patient}</span>
        </div>
      </div>
      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-sm uppercase tracking-wide ${statusColor}`}>
        {status}
      </span>
    </div>
  );
};

const MetricBar = ({ label, value }: { label: string, value: number }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[13px] text-text-primary font-medium">{label}</span>
        <span className="text-[12px] text-text-secondary">{value}%</span>
      </div>
      <div className="w-full bg-background h-1.5 rounded-full overflow-hidden border border-border">
        <div 
          className="bg-accent h-full" 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Dashboard;
