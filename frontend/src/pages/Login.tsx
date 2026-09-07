import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Stethoscope, 
  Loader2, 
  UserPlus, 
  LogIn, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('General Practice');
  const [hospitalName, setHospitalName] = useState('Clinscribe Medical Center');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      if (isRegister) {
        await signup({
          name,
          email,
          password,
          specialization,
          hospital_name: hospitalName
        });
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left Side: Healthcare SaaS Brand & Proof Points (Hidden on small mobile) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/30 border border-primary-400/40 flex items-center justify-center text-sky-400 shadow-sm">
                <Stethoscope size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white leading-none">CLINSCRIBE</h1>
                <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-widest block mt-1">
                  Clinical AI Documentation
                </span>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-sky-300">
                <Sparkles size={13} />
                <span>Fine-tuned Qwen2.5-1.5B</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                Empowering Physicians with Zero-Burden Documentation.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Transform live clinical dialogues into verifiable SOAP records, complete with instant safety validation and timeline tracking.
              </p>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="relative z-10 space-y-3 pt-8 border-t border-white/10">
            <div className="flex items-center space-x-2.5 text-xs text-slate-200">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Multi-Doctor Cryptographic Data Isolation</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-200">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Automated Negative Symptom Verification</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-200">
              <ShieldCheck size={16} className="text-sky-400 shrink-0" />
              <span>Full Clinical Timeline & PDF Record Export</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            {/* Tab switch */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mb-8">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-semibold rounded-lg transition-all ${!isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <LogIn size={14} />
                <span>Physician Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(''); }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-semibold rounded-lg transition-all ${isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <UserPlus size={14} />
                <span>Register Account</span>
              </button>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {isRegister ? 'Create Doctor Account' : 'Welcome back, Doctor'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                {isRegister 
                  ? 'Set up your credentials to manage your patients and generate SOAP notes.' 
                  : 'Enter your verified physician credentials to access your clinical portal.'}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Physician Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Jane Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="doctor@hospital.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              {isRegister && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Medical Specialty
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Internal Medicine"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Hospital / Clinic
                    </label>
                    <div className="relative">
                      <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. City Hospital"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-rose-600 text-xs bg-rose-50 border border-rose-200 p-3 rounded-xl font-medium">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : isRegister ? (
                    <span>Create Doctor Account</span>
                  ) : (
                    <span>Sign In to Clinical Portal</span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <p className="text-xs text-slate-500">
                Protected by HIPAA-compliant security standards. Encrypted clinical storage.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
