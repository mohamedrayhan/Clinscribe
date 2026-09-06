import React, { useState, useEffect } from 'react';
import { Search, UserPlus, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: number;
  name: string;
  dob: string;
  gender: string;
  contact: string;
}

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/patients');
        if (response.ok) {
          const data = await response.json();
          setPatients(data);
        }
      } catch (err) {
        console.error('Failed to fetch patients', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Patients</h1>
          <p className="text-text-secondary mt-1">Manage patient records and histories</p>
        </div>
        <button 
          onClick={() => {/* Add logic to show 'Add Patient' modal or navigate to form */}}
          className="flex items-center space-x-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
        >
          <UserPlus size={18} />
          <span>Add Patient</span>
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-md leading-5 bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm"
            placeholder="Search patients by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <select className="border border-border rounded-md bg-surface text-sm px-3 py-2 text-text-primary focus:outline-none focus:border-accent">
            <option>All Statuses</option>
            <option>Documented</option>
            <option>Pending Review</option>
          </select>
          <select className="border border-border rounded-md bg-surface text-sm px-3 py-2 text-text-primary focus:outline-none focus:border-accent">
            <option>Sort by: Newest</option>
            <option>Sort by: Oldest</option>
            <option>Sort by: Name (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-text-secondary">Loading patients...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 text-text-secondary">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-1">No patients found</h3>
            <p className="text-text-secondary">Try adjusting your search or add a new patient.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Age/Sex</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Last Consult</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {filteredPatients.map((patient) => {
                let age = '—';
                if (patient.dob) {
                  const birthDate = new Date(patient.dob);
                  const today = new Date();
                  let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                  const m = today.getMonth() - birthDate.getMonth();
                  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    calculatedAge--;
                  }
                  age = calculatedAge.toString();
                }

                return (
                  <tr key={patient.id} className="hover:bg-black/[0.02] transition-colors cursor-pointer" onClick={() => navigate(`/patients/${patient.id}`)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">{patient.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-secondary">#{patient.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-secondary">{age} / {patient.gender || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-secondary">{patient.contact || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-secondary">Unknown</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success/10 text-success">
                        Documented
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-accent hover:text-accent/80 flex items-center justify-end space-x-1 ml-auto">
                        <span>View Record</span>
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Patients;
