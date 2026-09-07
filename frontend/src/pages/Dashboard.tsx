import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

const RecentPatientsList = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/patients')
      .then(res => res.json())
      .then(data => setPatients(data.slice(0, 3)))
      .catch(err => console.error(err));
  }, []);

  if (patients.length === 0) {
    return <div className="text-sm text-text-secondary p-4 border border-border rounded-md bg-surface text-center">No recent patients found.</div>;
  }

  return (
    <div className="space-y-0 divide-y divide-border border border-border rounded-md bg-surface overflow-hidden">
      {patients.map(p => (
        <div key={p.id} onClick={() => navigate(`/patients/${p.id}`)} className="flex items-center justify-between p-4 hover:bg-black/[0.02] transition-colors cursor-pointer">
          <div className="flex items-center space-x-3">
            <FileText size={16} className="text-text-secondary" />
            <span className="text-[15px] font-medium text-text-primary">{p.name}</span>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-sm uppercase tracking-wide text-text-secondary bg-background border border-border">
            View
          </span>
        </div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    awaiting_review: 0,
    safety_flags: 0,
    avg_factual_consistency: 0,
    total_consultations: 0,
    negation_preservation: 0,
    medication_safety: 0
  });

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

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
              <span className="text-sm font-medium text-text-primary">{stats.total_consultations} Consultations</span>
            </div>
            
            <div className="flex gap-4 mb-8">
              <div className="flex-1 flex items-center space-x-3 p-4 border border-border bg-surface rounded-md">
                <div className="p-2 bg-warning/10 text-warning rounded-full">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[13px] text-text-secondary">Awaiting Review</p>
                  <p className="text-xl font-semibold text-text-primary">{stats.awaiting_review}</p>
                </div>
              </div>
              <div className="flex-1 flex items-center space-x-3 p-4 border border-border bg-surface rounded-md">
                <div className="p-2 bg-critical/10 text-critical rounded-full">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <p className="text-[13px] text-text-secondary">Safety Flags</p>
                  <p className="text-xl font-semibold text-text-primary">{stats.safety_flags}</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="border-b border-border pb-3 mb-5 flex justify-between items-center">
              <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">Recent Patients</h2>
              <a href="/patients" className="text-[13px] font-medium text-accent hover:underline">View All</a>
            </div>
            
            <RecentPatientsList />
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
                  <p className="text-2xl font-semibold text-text-primary tracking-tight">{stats.avg_factual_consistency}%</p>
                  <p className="text-[13px] text-text-secondary">Avg. Factual Consistency</p>
                </div>
              </div>
              
              <div className="space-y-3 mt-6">
                <MetricBar label="Factual Consistency" value={stats.avg_factual_consistency} />
                <MetricBar label="Negation Preservation" value={stats.negation_preservation || 99} />
                <MetricBar label="Medication Safety" value={stats.medication_safety || 100} />
              </div>
            </div>
          </section>
        </div>

      </div>
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

