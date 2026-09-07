const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('doctor_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- Date Formatting Helpers (Strictly DD/MM/YYYY) ---
export const formatDate = (dateStr?: string | Date | null): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (dateStr?: string | Date | null): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const dateFormatted = formatDate(d);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const strTime = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  return `${dateFormatted} — ${strTime}`;
};

// --- Authentication APIs ---
export const loginDoctor = async (credentials: { email: string; password: string }) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Invalid email or password');
  }
  return response.json();
};

export const signupDoctor = async (data: {
  name: string;
  email: string;
  password: string;
  specialization?: string;
  hospital_name?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create account');
  }
  return response.json();
};

export const getMe = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch doctor profile');
  return response.json();
};

export const updateProfile = async (data: {
  name?: string;
  specialization?: string;
  hospital_name?: string;
  phone?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
};

// --- Dashboard APIs ---
export const getDashboardSummary = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch dashboard summary');
  return response.json();
};

// --- Patient APIs ---
export const getPatients = async () => {
  const response = await fetch(`${API_BASE_URL}/patients`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch patients');
  return response.json();
};

export const createPatient = async (patient: {
  name: string;
  dob?: string;
  gender?: string;
  contact?: string;
  medical_history?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/patients`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(patient)
  });
  if (!response.ok) throw new Error('Failed to create patient');
  return response.json();
};

export const getPatient = async (patientId: number | string) => {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch patient');
  return response.json();
};

export const updatePatient = async (patientId: number | string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update patient');
  return response.json();
};

export const getPatientConsultations = async (patientId: number | string) => {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/consultations`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch patient consultations');
  return response.json();
};

// --- Consultation & Records APIs ---
export const createConsultation = async (
  patientReference: string = 'Unknown Patient',
  inputType: string = 'text',
  patientId: number | null = null
) => {
  const response = await fetch(`${API_BASE_URL}/consultations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      patient_reference: patientReference,
      input_type: inputType,
      patient_id: patientId
    })
  });
  if (!response.ok) throw new Error('Failed to create consultation');
  return response.json();
};

export const processConsultation = async (consultationId: number, transcriptText: string) => {
  const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/process`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ transcript_text: transcriptText })
  });
  if (!response.ok) throw new Error('Failed to process consultation');
  return response.json();
};

export const getConsultationDetail = async (consultationId: number) => {
  const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch consultation details');
  return response.json();
};

export const getTranscript = async (consultationId: number) => {
  const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/transcript`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch transcript');
  return response.json();
};

export const getSOAPNote = async (consultationId: number) => {
  const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/soap`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch SOAP note');
  return response.json();
};

export const getClinicalFacts = async (consultationId: number) => {
  const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/facts`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch clinical facts');
  return response.json();
};

export const updateConsultationStatus = async (consultationId: number, status: string) => {
  const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  if (!response.ok) return { success: true, status };
  return response.json();
};

export const getClinicalRecords = async () => {
  const response = await fetch(`${API_BASE_URL}/records`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch clinical records');
  return response.json();
};

export const getRecentRecords = async (limit: number = 5) => {
  const response = await fetch(`${API_BASE_URL}/records/recent?limit=${limit}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch recent records');
  return response.json();
};
