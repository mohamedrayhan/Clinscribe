from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database.session import Base

class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    specialization = Column(String)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    name = Column(String, index=True)
    dob = Column(String)
    gender = Column(String)
    contact = Column(String)
    medical_history = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Consultation(Base):
    __tablename__ = "consultations"
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    patient_reference = Column(String)
    input_type = Column(String) # 'audio' or 'text'
    status = Column(String, default="draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Transcript(Base):
    __tablename__ = "transcripts"
    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), unique=True)
    content = Column(Text)
    speaker_segments = Column(JSON) # Store parsed list of dicts

class ClinicalFacts(Base):
    __tablename__ = "clinical_facts"
    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), unique=True)
    symptoms = Column(JSON)
    medications = Column(JSON)
    allergies = Column(JSON)
    history = Column(JSON)
    negations = Column(JSON)
    uncertainties = Column(JSON)

class SOAPNote(Base):
    __tablename__ = "soap_notes"
    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), unique=True)
    subjective = Column(Text)
    objective = Column(Text)
    assessment = Column(Text)
    plan = Column(Text)
    status = Column(String, default="draft")

class SafetyValidation(Base):
    __tablename__ = "safety_validations"
    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), unique=True)
    safety_score = Column(Integer)
    critical_issues = Column(Integer)
    warnings = Column(Integer)
    validation_results = Column(JSON)
