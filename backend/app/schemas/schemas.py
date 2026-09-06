from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class PatientCreate(BaseModel):
    doctor_id: int
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

class PatientResponse(PatientCreate):
    id: int
    created_at: datetime
    consultations: List[Any] = []

    class Config:
        from_attributes = True

class ConsultationCreate(BaseModel):
    doctor_id: int
    patient_id: Optional[int] = None
    patient_reference: str
    input_type: str

class ConsultationResponse(BaseModel):
    id: int
    doctor_id: int
    patient_id: Optional[int] = None
    patient_reference: str
    input_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProcessRequest(BaseModel):
    transcript_text: str

class ProcessResponse(BaseModel):
    message: str
    consultation_id: int
