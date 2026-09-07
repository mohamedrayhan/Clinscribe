import re
from typing import Dict, List, Tuple, Any

# Clinical Symptom Dictionary: (keyword -> Display Name)
# Ordered by priority (longer phrases first)
SYMPTOMS_CATALOG = [
    # GI & Abdominal
    ("stomach pain", "Stomach Pain"),
    ("abdominal pain", "Abdominal Pain"),
    ("burning pain", "Burning Pain"),
    ("burning sensation", "Burning Sensation"),
    ("sharp pain", "Sharp Pain"),
    ("acid reflux", "Acid Reflux"),
    ("heartburn", "Heartburn"),
    ("loss of appetite", "Loss of Appetite"),
    ("decreased appetite", "Decreased Appetite"),
    ("blood in stool", "Blood in Stool"),
    ("black stool", "Black Stool"),
    ("difficulty breathing", "Difficulty Breathing"),
    ("shortness of breath", "Shortness of Breath"),
    ("sore throat", "Sore Throat"),
    ("runny nose", "Runny Nose"),
    ("body aches", "Body Aches"),
    ("muscle aches", "Muscle Aches"),
    ("chest pain", "Chest Pain"),
    ("chest discomfort", "Chest Discomfort"),
    ("chest tightness", "Chest Tightness"),
    ("joint pain", "Joint Pain"),
    ("back pain", "Back Pain"),
    ("cramping", "Abdominal Cramping"),
    ("cramps", "Cramping"),
    ("nausea", "Nausea"),
    ("vomiting", "Vomiting"),
    ("diarrhea", "Diarrhea"),
    ("constipation", "Constipation"),
    ("indigestion", "Indigestion"),
    ("bloating", "Bloating"),
    ("headache", "Headache"),
    ("migraine", "Migraine"),
    ("fever", "Fever"),
    ("cough", "Cough"),
    ("congestion", "Congestion"),
    ("fatigue", "Fatigue"),
    ("tiredness", "Tiredness"),
    ("chills", "Chills"),
    ("dizziness", "Dizziness"),
    ("weakness", "Weakness"),
    ("wheezing", "Wheezing"),
    ("palpitations", "Palpitations")
]

# Medications Catalog
MEDICATIONS_CATALOG = [
    ("painkillers", "Painkillers (OTC)"),
    ("pain relievers", "Pain Relievers"),
    ("pain reliever", "Pain Relievers"),
    ("paracetamol", "Paracetamol"),
    ("acetaminophen", "Acetaminophen"),
    ("tylenol", "Tylenol"),
    ("ibuprofen", "Ibuprofen"),
    ("advil", "Advil"),
    ("motrin", "Motrin"),
    ("aspirin", "Aspirin"),
    ("naproxen", "Naproxen"),
    ("omeprazole", "Omeprazole"),
    ("pantoprazole", "Pantoprazole"),
    ("antacid", "Antacids"),
    ("antacids", "Antacids"),
    ("pepto-bismol", "Pepto-Bismol"),
    ("metformin", "Metformin"),
    ("lisinopril", "Lisinopril"),
    ("amoxicillin", "Amoxicillin"),
    ("antibiotic", "Antibiotics"),
    ("antibiotics", "Antibiotics"),
    ("cough syrup", "Cough Syrup")
]

def extract_clinical_findings(transcript: str, soap_note: dict = None) -> Dict[str, Any]:
    """
    Intelligently extracts symptoms, negations, medications, and duration
    from both the raw encounter transcript and the generated SOAP note.
    """
    raw_lower = transcript.lower()
    soap_subj = (soap_note.get("subjective", "") if soap_note else "").lower()
    combined = f"{raw_lower}\n{soap_subj}"

    # 1. Build Negated Context Chunks
    negated_clauses = []
    # Match phrases like: "denies nausea, vomiting, fever", "no chest pain, cough, or chills"
    pattern = r'\b(?:no|denies|denied|without|negative for|not having|not experiencing|rule out|rules out)\s+([^.;\n]+)'
    for m in re.finditer(pattern, combined, re.IGNORECASE):
        negated_clauses.append(m.group(1).lower())
    
    negated_blob = " " + " ".join(negated_clauses) + " "

    symptoms_detected = []
    negations_detected = []
    seen_symptoms = set()
    seen_negations = set()

    # Contexts where "headache" was only mentioned as an indication for medication (e.g. "painkillers for headaches")
    # rather than an active complaint
    is_headache_only_for_meds = False
    if "headache" in combined:
        if re.search(r'\b(?:painkillers|medication|tablets|pills)\s+for\s+(?:a\s+)?headache', combined) and not re.search(r'\b(?:having|have|got|severe|bad)\s+(?:a\s+)?headache', combined):
            is_headache_only_for_meds = True

    for kw, label in SYMPTOMS_CATALOG:
        if kw in combined:
            if kw == "headache" and is_headache_only_for_meds:
                # Do not treat as active primary symptom if only mentioned as reason for taking a pill earlier
                continue

            # Check if this keyword is negated
            is_negated = False
            if kw in negated_blob:
                is_negated = True
            elif re.search(r'\b(?:no|denies|denied|without|not)\s+(?:\w+\s+){0,3}' + re.escape(kw), combined):
                is_negated = True

            if is_negated:
                if label not in seen_negations:
                    seen_negations.add(label)
                    negations_detected.append({
                        "id": str(len(negations_detected) + 1),
                        "name": label
                    })
            else:
                if label not in seen_symptoms:
                    seen_symptoms.add(label)
                    symptoms_detected.append({
                        "id": str(len(symptoms_detected) + 1),
                        "name": label
                    })

    # 2. Extract Medications
    meds_detected = []
    seen_meds = set()
    for mkw, mlabel in MEDICATIONS_CATALOG:
        if mkw in combined and mlabel not in seen_meds:
            seen_meds.add(mlabel)
            meds_detected.append(mlabel)

    # 3. Extract Duration
    dur_match = re.search(
        r'\b(?:for|lasting|lasted|duration of|past)\s+((?:the\s+last\s+)?[0-9a-z\-]+\s+(?:days?|weeks?|months?|hours?))',
        combined,
        re.IGNORECASE
    )
    if dur_match:
        duration_str = dur_match.group(1).strip().title()
    elif "yesterday" in combined:
        duration_str = "Since Yesterday"
    elif "three days" in combined or "3 days" in combined:
        duration_str = "3 Days"
    else:
        duration_str = "Not documented"

    return {
        "symptoms": symptoms_detected,
        "negations": negations_detected,
        "medications": meds_detected,
        "duration": duration_str
    }
