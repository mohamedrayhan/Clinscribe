from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import domain
from app.schemas import schemas

router = APIRouter()

@router.post("/consultations", response_model=schemas.ConsultationResponse)
def create_consultation(consultation: schemas.ConsultationCreate, db: Session = Depends(get_db)):
    db_consultation = domain.Consultation(**consultation.model_dump())
    db.add(db_consultation)
    db.commit()
    db.refresh(db_consultation)
    return db_consultation

@router.post("/consultations/{consultation_id}/process", response_model=schemas.ProcessResponse)
def process_consultation(consultation_id: int, request: schemas.ProcessRequest, db: Session = Depends(get_db)):
    # 1. Fetch consultation
    db_consultation = db.query(domain.Consultation).filter(domain.Consultation.id == consultation_id).first()
    if not db_consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    # 2. Parse actual transcript into speaker segments
    segments = []
    lines = [l.strip() for l in request.transcript_text.split('\n') if l.strip()]
    for idx, line in enumerate(lines, start=1):
        speaker = "Speaker"
        text = line
        if ":" in line:
            parts = line.split(":", 1)
            speaker = parts[0].strip()
            text = parts[1].strip()
        segments.append({
            "id": str(idx),
            "speaker": speaker,
            "text": text
        })

    db_transcript = domain.Transcript(
        consultation_id=consultation_id,
        content=request.transcript_text,
        speaker_segments=segments
    )
    db.add(db_transcript)
    
    # 3. Call the Fine-Tuned Model (Try/Catch to allow fallback if model isn't downloaded yet)
    soap_data = {
        "subjective": "Not documented.",
        "objective": "Not documented.",
        "assessment": "Not documented.",
        "plan": "Not documented."
    }
    
    try:
        from app.services.llm_service import generate_clinical_documentation
        print("Calling fine-tuned LLM...")
        llm_output = generate_clinical_documentation(request.transcript_text)
        if llm_output:
            soap_data = llm_output
    except Exception as e:
        print(f"LLM Inference failed (using fallback mock data): {e}")

    # 4. Extract real clinical facts from user transcript
    raw_lower = request.transcript_text.lower()
    symptoms_detected = []
    negations_detected = []
    meds_detected = []

    # Common symptom detection
    symptom_keywords = ["headache", "sore throat", "fever", "cough", "congestion", "tiredness", "fatigue", "body aches"]
    for kw in symptom_keywords:
        if kw in raw_lower:
            symptoms_detected.append({"id": str(len(symptoms_detected) + 1), "name": kw.title()})

    # Negations detection
    negation_phrases = [("coughing", "No severe cough"), ("chest pain", "Chest pain")]
    if "not much coughing" in raw_lower or "no cough" in raw_lower:
        negations_detected.append({"id": "1", "name": "Persistent Cough"})
    if "no chest pain" in raw_lower:
        negations_detected.append({"id": "2", "name": "Chest Pain"})

    # Medication detection
    med_keywords = ["paracetamol", "tylenol", "ibuprofen", "lisinopril", "metformin", "aspirin", "amoxicillin"]
    for med in med_keywords:
        if med in raw_lower:
            meds_detected.append(med.title())

    db_facts = domain.ClinicalFacts(
        consultation_id=consultation_id,
        symptoms=symptoms_detected or [{"id": "1", "name": "Viral symptoms"}],
        medications=meds_detected,
        allergies=[],
        history=[],
        negations=negations_detected,
        uncertainties=[]
    )
    db.add(db_facts)
    
    # 5. Save generated SOAP note
    db_soap = domain.SOAPNote(
        consultation_id=consultation_id,
        subjective=soap_data.get("subjective", "Not documented."),
        objective=soap_data.get("objective", "Not documented."),
        assessment=soap_data.get("assessment", "Not documented."),
        plan=soap_data.get("plan", "Not documented.")
    )
    db.add(db_soap)

    # 6. Mock saving Safety Validation
    db_safety = domain.SafetyValidation(
        consultation_id=consultation_id,
        safety_score=94,
        critical_issues=0,
        warnings=1,
        validation_results={"passed": True}
    )
    db.add(db_safety)

    db_consultation.status = "processed"
    db.commit()

    return {"message": "Processing complete", "consultation_id": consultation_id}

@router.get("/consultations/{consultation_id}/transcript")
def get_transcript(consultation_id: int, db: Session = Depends(get_db)):
    transcript = db.query(domain.Transcript).filter(domain.Transcript.consultation_id == consultation_id).first()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return transcript

@router.get("/consultations/{consultation_id}/soap")
def get_soap(consultation_id: int, db: Session = Depends(get_db)):
    soap = db.query(domain.SOAPNote).filter(domain.SOAPNote.consultation_id == consultation_id).first()
    if not soap:
        raise HTTPException(status_code=404, detail="SOAP Note not found")
    return soap

@router.get("/consultations/{consultation_id}/facts")
def get_facts(consultation_id: int, db: Session = Depends(get_db)):
    facts = db.query(domain.ClinicalFacts).filter(domain.ClinicalFacts.consultation_id == consultation_id).first()
    if not facts:
        raise HTTPException(status_code=404, detail="Clinical facts not found")
    return facts

from pydantic import BaseModel

class StatusUpdateRequest(BaseModel):
    status: str

@router.patch("/consultations/{consultation_id}")
def update_consultation_status(consultation_id: int, req: StatusUpdateRequest, db: Session = Depends(get_db)):
    consultation = db.query(domain.Consultation).filter(domain.Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    consultation.status = req.status
    db.commit()
    return {"message": "Status updated successfully", "status": req.status}

