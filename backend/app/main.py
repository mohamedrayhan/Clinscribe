from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.main import router as api_router
from app.database.session import engine
from app.models import domain

# Create tables
domain.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ClinScribe AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "ClinScribe AI API is running"}
