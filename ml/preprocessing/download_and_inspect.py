import argparse
from datasets import load_dataset
import pandas as pd

def inspect_dataset(dataset_name: str, split: str = "train"):
    print(f"\n{'='*50}")
    print(f"Inspecting Dataset: {dataset_name} ({split})")
    print(f"{'='*50}")
    
    try:
        ds = load_dataset(dataset_name, split=split)
        print(f"Total rows: {len(ds)}")
        print("\nFeatures/Schema:")
        for feature_name, feature_type in ds.features.items():
            print(f" - {feature_name}: {feature_type}")
            
        print("\nFirst row sample:")
        sample = ds[0]
        for k, v in sample.items():
            print(f" {k}: {str(v)[:200]}{'...' if len(str(v)) > 200 else ''}")
            
    except Exception as e:
        print(f"Failed to load {dataset_name}: {e}")

if __name__ == "__main__":
    # MTS-Dialog (Usually needs manual download from github, but for architecture, we assume it's preprocessed into HF or loaded locally)
    print("Note: MTS-Dialog requires downloading from GitHub: https://github.com/abachaa/MTS-Dialog")
    
    # HuggingFace Datasets
    inspect_dataset("omi-health/medical-dialogue-to-soap-summary")
    inspect_dataset("Tushar9802/medscribe-soap-712")
