# Purpose: Handles resume upload requests.

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.ai.analyzers.resume_analyzer import analyze_resume
from app.services.resume_service import (
    save_resume,
    extract_resume_text,
)
from app.services.text_cleaner import clean_resume_text

router = APIRouter()


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a resume, extract and clean its text,
    analyze it using AI, and return structured JSON.
    """

    # Accept only PDF resumes.
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    # Save the uploaded resume.
    file_path = await save_resume(file)

    # Extract text from the uploaded PDF.
    resume_text = extract_resume_text(file_path)

    # Clean the extracted text.
    cleaned_text = clean_resume_text(resume_text)

    try:
        # Analyze the cleaned resume.
        analysis = analyze_resume(cleaned_text)

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Resume analysis failed: {error}"
        )

    # Return the structured analysis.
    return {
        "message": "Resume analyzed successfully.",
        "file_path": file_path,
        "analysis": analysis
    }