from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- Doctor / Auth Schemas ---
class DoctorSignup(BaseModel):
    name: str
    email: str
    password: str
    specialization: Optional[str] = "General Practice"
    hospital_name: Optional[str] = "Clinscribe Medical Center"

class DoctorLogin(BaseModel):
    email: str
    password: str

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    hospital_name: Optional[str] = None
    phone: Optional[str] = None

class DoctorResponse(BaseModel):
    id: int
    name: str
    email: str
    specialization: Optional[str] = None
    hospital_name: Optional[str] = None
    phone: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    doctor: DoctorResponse


# --- Patient Schemas ---
class PatientCreate(BaseModel):
    name: str
    dob: Optional[str] = None
    gender: Optional[str] = None
    contact: Optional[str] = None
    medical_history: Optional[str] = None

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    contact: Optional[str] = None
    medical_history: Optional[str] = None

class PatientResponse(BaseModel):
    id: int
    doctor_id: int
    name: str
    dob: Optional[str] = None
    gender: Optional[str] = None
    contact: Optional[str] = None
    medical_history: Optional[str] = None
    created_at: Optional[datetime] = None
    consultation_count: Optional[int] = 0
    last_consultation_date: Optional[str] = None

    class Config:
        from_attributes = True


# --- Consultation / Record Schemas ---
class ConsultationCreate(BaseModel):
    patient_id: Optional[int] = None
    patient_reference: Optional[str] = "Unknown Patient"
    input_type: Optional[str] = "text" # 'text' or 'audio'

class ConsultationResponse(BaseModel):
    id: int
    doctor_id: int
    patient_id: Optional[int] = None
    patient_reference: str
    input_type: str
    status: str
    created_at: datetime
    patient_name: Optional[str] = None
    chief_complaint: Optional[str] = None

    class Config:
        from_attributes = True

class SOAPNoteResponse(BaseModel):
    id: int
    consultation_id: int
    subjective: Optional[str] = "Not documented."
    objective: Optional[str] = "Not documented."
    assessment: Optional[str] = "Not documented."
    plan: Optional[str] = "Not documented."
    status: Optional[str] = "draft"

    class Config:
        from_attributes = True

class ClinicalFactsResponse(BaseModel):
    id: int
    consultation_id: int
    symptoms: Optional[List[Any]] = []
    medications: Optional[List[Any]] = []
    allergies: Optional[List[Any]] = []
    history: Optional[List[Any]] = []
    negations: Optional[List[Any]] = []
    uncertainties: Optional[List[Any]] = []

    class Config:
        from_attributes = True

class ConsultationDetailResponse(BaseModel):
    id: int
    doctor_id: int
    patient_id: Optional[int] = None
    patient_reference: str
    input_type: str
    status: str
    created_at: datetime
    patient: Optional[PatientResponse] = None
    transcript_content: Optional[str] = None
    speaker_segments: Optional[List[Any]] = []
    soap: Optional[Dict[str, Any]] = None
    facts: Optional[Dict[str, Any]] = None
    safety: Optional[Dict[str, Any]] = None

class ProcessRequest(BaseModel):
    transcript_text: str

class ProcessResponse(BaseModel):
    message: str
    consultation_id: int

class StatusUpdateRequest(BaseModel):
    status: str


# --- Dashboard Schemas ---
class DashboardDoctor(BaseModel):
    id: int
    name: str
    specialization: str
    hospital_name: str

class DashboardStatistics(BaseModel):
    total_patients: int
    total_documents: int
    documents_today: int
    awaiting_review: int
    safety_flags: int
    avg_factual_consistency: float
    negation_preservation: int
    medication_safety: int

class DashboardActivityItem(BaseModel):
    id: int
    patient_id: Optional[int] = None
    patient_name: str
    input_type: str
    status: str
    created_at: str
    chief_complaint: Optional[str] = None

class DashboardSummaryResponse(BaseModel):
    doctor: DashboardDoctor
    statistics: DashboardStatistics
    recent_patients: List[PatientResponse]
    recent_activity: List[DashboardActivityItem]
