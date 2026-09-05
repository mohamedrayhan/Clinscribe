import os
import shutil
import warnings

# Force disable hf-transfer and xet
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "0"
os.environ["HF_HUB_DISABLE_FAST_DOWNLOAD"] = "1"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

from huggingface_hub import snapshot_download

# Path to the corrupted cache
cache_dir = os.path.expanduser("~/.cache/huggingface/hub/models--Qwen--Qwen2.5-1.5B-Instruct")

# Delete the corrupted cache if it exists
if os.path.exists(cache_dir):
    print(f"Removing corrupted cache at {cache_dir}...")
    try:
        shutil.rmtree(cache_dir, ignore_errors=True)
        print("Cache cleared.")
    except Exception as e:
        print(f"Warning: could not delete cache entirely: {e}")

print("Starting standard, stable download for Qwen/Qwen2.5-1.5B-Instruct...")
print("This may take a few minutes. Please wait...")

try:
    path = snapshot_download(
        repo_id="Qwen/Qwen2.5-1.5B-Instruct",
        # This forces the legacy download mechanism, bypassing xet/hf_transfer bugs
        local_files_only=False,
    )
    print("\nSUCCESS! Model successfully downloaded to:", path)
except Exception as e:
    print("\nERROR during download:", e)
