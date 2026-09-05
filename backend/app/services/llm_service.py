import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

# Configuration
# Base model used in Colab
BASE_MODEL_ID = "Qwen/Qwen2.5-1.5B-Instruct" 
# This is where you will place your downloaded checkpoint-567 from Google Drive
LORA_CHECKPOINT_PATH = os.getenv("LORA_PATH", "./model_checkpoints/checkpoint-567")

_model = None
_tokenizer = None

def load_model():
    global _model, _tokenizer
    if _model is not None:
        return

    print(f"Loading Base Model ({BASE_MODEL_ID})...")
    try:
        base_model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL_ID,
            device_map="auto",
            torch_dtype=torch.float16,
        )
        
        print(f"Loading LoRA Adapters from {LORA_CHECKPOINT_PATH}...")
        _model = PeftModel.from_pretrained(base_model, LORA_CHECKPOINT_PATH)
        _tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_ID)
        print("Model and adapters loaded successfully!")
    except Exception as e:
        print(f"Failed to load model. Ensure you have the checkpoint downloaded to {LORA_CHECKPOINT_PATH}. Error: {e}")
        raise e

def generate_clinical_documentation(transcript: str) -> dict:
    """
    Passes the transcript to the fine-tuned LLM to generate a SOAP note.
    """
    load_model()
    
    instruction = "Generate a structured SOAP note using only information supported by the clinical encounter. Preserve negation and uncertainty. You MUST use exactly these four headers: **SUBJECTIVE:**, **OBJECTIVE:**, **ASSESSMENT:**, and **PLAN:**. Do not use any other headers or sections."
    prompt = f"### Instruction:\n{instruction}\n\n### Input:\n{transcript}\n\n### Output:\n"
    
    inputs = _tokenizer(prompt, return_tensors="pt").to(_model.device)
    
    with torch.no_grad():
        outputs = _model.generate(
            **inputs, 
            max_new_tokens=512,
            temperature=0.2, # Low temperature for more factual clinical notes
            do_sample=True,
            repetition_penalty=1.1
        )
        
    generated_text = _tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract only the output part
    try:
        output_section = generated_text.split("### Output:\n")[1].strip()
    except IndexError:
        output_section = generated_text # Fallback
        
    # Robust parser for dynamic model outputs (handles **S:**, **Subjective:**, **Assessment & Plan:**, etc.)
    import re
    
    soap = {
        "subjective": "Not documented.",
        "objective": "Not documented.",
        "assessment": "Not documented.",
        "plan": "Not documented."
    }

    # Find all bolded headers and their content
    # Matches patterns like **Subjective:** or **S:** or **Assessment & Plan:**
    sections = re.findall(r'\*\*(.*?)\*\*\s*(.*?)(?=\*\*|$)', output_section, flags=re.DOTALL | re.IGNORECASE)
    
    for header, content in sections:
        header = header.strip().lower()
        content = content.strip()
        
        if not content:
            continue
            
        # Map to Subjective
        if 'subjective' in header or 'subject' in header or header.startswith('s:') or header == 's':
            soap["subjective"] = content
        # Map to Objective
        elif 'objective' in header or header.startswith('o:') or header == 'o':
            soap["objective"] = content
        # Map to Assessment & Plan (combined)
        elif 'assessment & plan' in header or 'assessment and plan' in header:
            # Attempt to split at common plan markers (using non-capturing group so we don't duplicate the delimiter)
            split_match = re.split(r'(?i)(?=(?:plan|recommend|he can|she can|the patient should|continue|follow-up|follow up|monitor|prescribe|advise|encourage)\b)', content, maxsplit=1)
            
            if len(split_match) > 1:
                soap["assessment"] = split_match[0].strip()
                soap["plan"] = split_match[1].strip()
            else:
                soap["assessment"] = content
                soap["plan"] = "Combined with Assessment section."
        # Map to Assessment / Diagnosis
        elif 'assessment' in header or 'diagnosis' in header or header.startswith('a:') or header == 'a':
            # Sometimes diagnosis includes plan instructions, try to split it
            split_match = re.split(r'(?i)(?=(?:plan|recommend|he can|she can|the patient should|continue|follow-up|follow up|monitor|prescribe|advised|advise|encourage|encouraged to)\b)', content, maxsplit=1)
            if len(split_match) > 1:
                soap["assessment"] = split_match[0].strip()
                if soap["plan"] == "Not documented.":
                    soap["plan"] = split_match[1].strip()
                else:
                    soap["plan"] += "\n\n" + split_match[1].strip()
            else:
                soap["assessment"] = content
        # Map to Plan
        elif 'plan' in header or header.startswith('p:') or header == 'p':
            if soap["plan"] == "Not documented.":
                soap["plan"] = content
            else:
                soap["plan"] += "\n\n" + content
        # Catch extras like Medication, Follow-up, Discharge Instructions and append them to Plan
        elif header not in ['soap note', 'soap note:', 'soap note**']:
            if soap["plan"] == "Not documented.":
                soap["plan"] = f"**{header.title()}**: {content}"
            else:
                soap["plan"] += f"\n\n**{header.title()}**: {content}"

    # Fallback if no structured tags matched
    if all(v == "Not documented." for v in soap.values()) and output_section:
        soap["subjective"] = output_section

    return soap
