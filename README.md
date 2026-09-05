# Clinscribe 🩺

Clinscribe is a modern, AI-powered Clinical Documentation System designed to automatically transcribe and structure doctor-patient conversations into formal SOAP notes. Built with a React frontend, a FastAPI backend, and powered by a custom fine-tuned **Qwen2.5-1.5B** LLM, Clinscribe drastically reduces documentation time for medical professionals.

---

## 🌟 Features

*   **Automated SOAP Note Generation**: Processes raw clinical transcripts directly into Subjective, Objective, Assessment, and Plan components.
*   **Custom Fine-Tuned Local LLM**: Uses a specially trained Qwen2.5-1.5B LoRA model running locally to ensure privacy and specialized clinical accuracy.
*   **Smart Clinical Fact Extraction**: Automatically identifies and tracks symptoms, medications, negations, and durations from patient dialogue.
*   **Split-Screen Clinical UI**: An elegant, real-time interface built with React and Tailwind CSS that allows doctors to compare the raw transcript alongside the generated evidence.
*   **One-Click PDF Export**: Approving documentation instantly generates a formatted, hospital-ready PDF record complete with patient details and physician signatures.
*   **Offline-Capable Mock Fallback**: The frontend is engineered to gracefully fall back to simulated UI modes if the backend inference engine is offline.

---

## 🏗️ Architecture

The project is structured into three main domains:

1.  **`frontend/`** (React + Vite + Tailwind + Lucide React)
    *   Manages the split-screen UI, step-by-step processing timeline, and local PDF generation using `jspdf`.
2.  **`backend/`** (FastAPI + SQLAlchemy + SQLite)
    *   Exposes endpoints to process consultations, parse transcripts, and interact directly with the local ML model.
3.  **`ml/`** (Data preprocessing & Training)
    *   Contains the pipeline for data normalization, deduplication, and the Google Colab QLoRA training guides used to fine-tune the Qwen model.

---

## 🚀 Getting Started

### 1. Backend Setup

Ensure you have Python 3.10+ installed.

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # (Windows) or source venv/bin/activate (Mac/Linux)

pip install -r requirements.txt
pip install torch transformers peft accelerate
```

**Model Setup**:
You must download the base `Qwen/Qwen2.5-1.5B-Instruct` model and place your trained LoRA adapter weights inside `backend/model_checkpoints/checkpoint-567`.

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```
*The backend will start at `http://127.0.0.1:8000`*

### 2. Frontend Setup

Ensure you have Node.js installed.

```bash
cd frontend
npm install
npm run dev
```
*The frontend will start at `http://localhost:5173`*

---

## 🧠 Machine Learning (LoRA Fine-Tuning)

The system relies on a local adapter trained on clinical dialogue. 
*   **Base Model**: `Qwen/Qwen2.5-1.5B-Instruct`
*   **Method**: 4-bit QLoRA via Unsloth/PEFT
*   **Training Script**: See `colab_guide.md` (or the `ml/` directory) for instructions on how to replicate the dataset preparation and training process using Google Colab.

The backend uses an intelligent regex parser (`llm_service.py`) that forcefully structures the LLM's raw string output into the UI's database fields, maintaining high resilience against LLM hallucination.

---

## 🛠️ Tech Stack

*   **Frontend**: React 18, Vite, Tailwind CSS, React Router, jsPDF, Lucide React
*   **Backend**: Python, FastAPI, SQLAlchemy, SQLite, Uvicorn
*   **AI/ML**: HuggingFace Transformers, PEFT, PyTorch, Qwen2.5

---

## 📄 License

This project is licensed under the MIT License.
