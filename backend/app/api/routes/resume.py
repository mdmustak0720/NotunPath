"""
Resume Routes

Purpose:
Handles resume upload, text extraction, AI analysis,
and persistence for authenticated users.
"""

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)

from app.ai.analyzers.resume_analyzer import analyze_resume
from app.core.security import get_current_user
from app.repositories.resume_repository import (
    get_latest_resume_by_user,
    get_resumes_by_user,
    save_resume_analysis,
)
from app.services.resume_service import (
    extract_resume_text,
    save_resume,
)
from app.services.text_cleaner import clean_resume_text


# ---------------------------------------------------------
# Router
# ---------------------------------------------------------

router = APIRouter()


# ---------------------------------------------------------
# Upload Resume
# ---------------------------------------------------------

@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload, process, analyze, and store a user's resume.
    """

    # -----------------------------------------------------
    # Step 1: Validate file
    # -----------------------------------------------------

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed.",
        )

    # -----------------------------------------------------
    # Step 2: Validate authenticated user
    # -----------------------------------------------------

    user_email = current_user.get("email")

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user email is missing.",
        )

    # -----------------------------------------------------
    # Step 3: Save uploaded resume
    # -----------------------------------------------------

    try:
        file_path = await save_resume(file)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save the uploaded resume.",
        )

    # -----------------------------------------------------
    # Step 4: Extract PDF text
    # -----------------------------------------------------

    try:
        resume_text = extract_resume_text(file_path)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Failed to extract text from the uploaded PDF.",
        )

    # -----------------------------------------------------
    # Step 5: Validate extracted text
    # -----------------------------------------------------

    if not resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No readable text was found in the resume.",
        )

    # -----------------------------------------------------
    # Step 6: Clean extracted text
    # -----------------------------------------------------

    cleaned_text = clean_resume_text(resume_text)

    if not cleaned_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Resume text is empty after cleaning.",
        )

    # -----------------------------------------------------
    # Step 7: Analyze resume using AI
    # -----------------------------------------------------

    try:
        analysis = analyze_resume(cleaned_text)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Resume analysis failed.",
        )

    # -----------------------------------------------------
    # Step 8: Save analysis to MongoDB
    # -----------------------------------------------------

    try:
        resume_id = save_resume_analysis(
            user_email=user_email,
            file_path=file_path,
            analysis=analysis,
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save resume analysis.",
        )

    # -----------------------------------------------------
    # Step 9: Return response
    # -----------------------------------------------------

    return {
        "message": "Resume analyzed successfully.",
        "resume_id": resume_id,
        "analysis": analysis,
    }


# ---------------------------------------------------------
# Get Latest Resume
# ---------------------------------------------------------

@router.get("/latest")
async def get_latest_resume(
    current_user: dict = Depends(get_current_user),
):
    """
    Return the latest analyzed resume
    belonging to the authenticated user.
    """

    # -----------------------------------------------------
    # Step 1: Get authenticated user's email
    # -----------------------------------------------------

    user_email = current_user.get("email")

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user email is missing.",
        )

    # -----------------------------------------------------
    # Step 2: Find latest resume
    # -----------------------------------------------------

    resume = get_latest_resume_by_user(
        user_email=user_email,
    )

    # -----------------------------------------------------
    # Step 3: Handle no resume
    # -----------------------------------------------------

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found for this user.",
        )

    # -----------------------------------------------------
    # Step 4: Return latest resume
    # -----------------------------------------------------

    return {
        "message": "Latest resume retrieved successfully.",
        "resume_id": str(resume["_id"]),
        "analysis": resume.get("analysis"),
        "created_at": resume.get("created_at"),
        "updated_at": resume.get("updated_at"),
    }


# ---------------------------------------------------------
# Get My Resumes
# ---------------------------------------------------------

@router.get("")
async def get_my_resumes(
    current_user: dict = Depends(get_current_user),
):
    """
    Return all resumes belonging to the authenticated user.
    """

    # -----------------------------------------------------
    # Step 1: Get authenticated user's email
    # -----------------------------------------------------

    user_email = current_user.get("email")

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user email is missing.",
        )

    # -----------------------------------------------------
    # Step 2: Get user's resumes
    # -----------------------------------------------------

    resumes = get_resumes_by_user(user_email)

    # -----------------------------------------------------
    # Step 3: Format response
    # -----------------------------------------------------

    formatted_resumes = []

    for resume in resumes:
        formatted_resumes.append(
            {
                "id": str(resume["_id"]),
                "user_email": resume.get("user_email"),
                "file_path": resume.get("file_path"),
                "analysis": resume.get("analysis"),
                "created_at": resume.get("created_at"),
                "updated_at": resume.get("updated_at"),
            }
        )

    # -----------------------------------------------------
    # Step 4: Return response
    # -----------------------------------------------------

    return {
        "message": "User resumes retrieved successfully.",
        "resumes": formatted_resumes,
    }