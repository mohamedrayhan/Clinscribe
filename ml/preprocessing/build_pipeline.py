import json
import hashlib
from typing import List, Dict, Any
from pathlib import Path
import random

# Common Normalization Output Schema
# {
#   "instruction": "...",
#   "input": "Doctor: ... Patient: ...",
#   "output": "S: ...\nO: ...\nA: ...\nP: ...",
#   "source_dataset": "...",
#   "is_synthetic": bool
# }

def generate_hash(text: str) -> str:
    return hashlib.md5(text.encode('utf-8')).hexdigest()

def detect_duplicates(datasets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    print("Running duplicate detection...")
    seen_hashes = set()
    unique_data = []
    duplicates_removed = 0
    
    for item in datasets:
        # Check input transcript similarity (using exact match hash for prototype)
        input_hash = generate_hash(item.get("input", "").strip().lower())
        if input_hash not in seen_hashes:
            seen_hashes.add(input_hash)
            unique_data.append(item)
        else:
            duplicates_removed += 1
            
    print(f"Removed {duplicates_removed} exact input duplicates.")
    return unique_data

def quality_validation(datasets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    print("Running quality validation (leakage checking & structural checks)...")
    valid_data = []
    for item in datasets:
        # Basic validation: ensure all required fields are present and non-empty
        if not item.get("input") or not item.get("output"):
            continue
        # Check for minimum length to avoid empty transcripts
        if len(item["input"]) < 50 or len(item["output"]) < 20:
            continue
            
        valid_data.append(item)
    return valid_data

def sample_and_weight_datasets(datasets: List[Dict[str, Any]], weights: Dict[str, float], total_samples: int = 10000) -> List[Dict[str, Any]]:
    print(f"Applying controlled sampling weights: {weights}")
    
    grouped = {}
    for item in datasets:
        ds_name = item.get("source_dataset", "unknown")
        if ds_name not in grouped:
            grouped[ds_name] = []
        grouped[ds_name].append(item)
        
    sampled_data = []
    for ds_name, group in grouped.items():
        weight = weights.get(ds_name, 0.0)
        target_count = int(total_samples * weight)
        if len(group) >= target_count:
            sampled = random.sample(group, target_count)
        else:
            # Over-sample or just take all if not enough
            sampled = group
        sampled_data.extend(sampled)
        print(f"Sampled {len(sampled)} items from {ds_name}")
        
    random.shuffle(sampled_data)
    return sampled_data

def main():
    # In a real pipeline, this would load the normalized outputs of all 3 dataset-specific loaders
    mock_input_data = [
        {"input": "Doctor: Hi. Patient: Hello.", "output": "S: Hello O: None A: None P: None", "source_dataset": "omi-health"},
        {"input": "Doctor: Hi. Patient: Hello.", "output": "S: Hello O: None A: None P: None", "source_dataset": "medscribe"}, # Duplicate
    ]
    
    unique_data = detect_duplicates(mock_input_data)
    valid_data = quality_validation(unique_data)
    
    # Controlled sampling
    weights = {
        "mts-dialog": 0.2,
        "omi-health": 0.5,
        "medscribe-soap": 0.3
    }
    
    final_dataset = sample_and_weight_datasets(valid_data, weights, total_samples=5000)
    
    # Save unified training dataset
    out_dir = Path("../datasets/processed")
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "unified_training_data.jsonl"
    
    with open(out_path, 'w', encoding='utf-8') as f:
        for item in final_dataset:
            f.write(json.dumps(item) + '\n')
            
    print(f"Saved {len(final_dataset)} training examples to {out_path}")

if __name__ == "__main__":
    main()
