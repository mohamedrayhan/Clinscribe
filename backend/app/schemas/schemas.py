from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class ConsultationCreate(BaseModel):
    doctor_id: int
    patient_reference: str
    input_type: str

class ConsultationResponse(BaseModel):
    id: int
    doctor_id: int
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
