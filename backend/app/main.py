from fastapi import FastAPI

app = FastAPI(
    title="NotunPath API",
    description="AI Career Operating System Backend",
    version="1.0.0",
)

@app.get("/")
def home():
    return {
        "message": "Welcome to NotunPath 🚀"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }