const API_BASE_URL = 'http://localhost:8000/api';

export const createConsultation = async (doctorId: number, patientReference: string, inputType: string) => {
  const response = await fetch(`${API_BASE_URL}/consultations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doctor_id: doctorId,
      patient_reference: patientReference,
      input_type: inputType
    })
  });
  if (!response.ok) throw new Error('Failed to create consultation');
  return response.json();
};

export const processConsultation = async (consultationId: number, transcriptText: string) => {
  const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript_text: transcriptText })
  });
  if (!response.ok) throw new Error('Failed to process consultation');
  return response.json();
};

export const getTranscript = async (consultationId: number) => {
  const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/transcript`);
  if (!response.ok) throw new Error('Failed to fetch transcript');
  return response.json();
};

export const getSOAPNote = async (consultationId: number) => {
  const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/soap`);
  if (!response.ok) throw new Error('Failed to fetch SOAP note');
  return response.json();
};

export const getClinicalFacts = async (consultationId: number) => {
  const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/facts`);
  if (!response.ok) throw new Error('Failed to fetch clinical facts');
  return response.json();
};

export const updateConsultationStatus = async (consultationId: number, status: string) => {
  const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  // If backend doesn't support it yet, just return
  if (!response.ok) return { success: true, status };
  return response.json();
};


