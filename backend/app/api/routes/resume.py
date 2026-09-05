"""
Resume Routes

Handles resume upload, processing, analysis, versioning,
history, and retrieval for authenticated users.
"""

from __future__ import annotations

from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)

from app.ai.analyzers.resume_analyzer import (
    analyze_resume,
)
from app.core.security import get_current_user
from app.repositories.resume_repository import (
    get_latest_resume_by_user,
    get_resume_history_by_user,
    get_resumes_by_user,
    save_resume_analysis,
)
from app.services.intelligence_service import (
    analyze_resume_intelligence,
)
from app.services.resume_service import (
    extract_resume_document,
    save_resume,
)
from app.services.text_cleaner import (
    clean_resume_text,
)


router = APIRouter()


@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict[str, Any] = Depends(
        get_current_user
    ),
):
    """
    Upload, process, analyze, and store a resume.

    The document extraction layer produces the canonical
    ResumeDocument. Resume analysis consumes cleaned text,
    while intelligence analysis consumes both the document
    evidence and normalized resume analysis.
    """

    # Validate the uploaded file before writing it to storage.
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed.",
        )

    # Obtain the authenticated user's email for ownership
    # and persistence.
    user_email = current_user.get("email")

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user email is missing.",
        )

    # Persist the original uploaded document before processing.
    try:
        file_path = save_resume(file)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save the uploaded resume.",
        )

    # Extract the complete canonical document representation.
    try:
        document = extract_resume_document(
            file_path
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Failed to extract the uploaded resume.",
        )

    # ATS and downstream intelligence require readable
    # document text.
    if not document.text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No readable text was found in the resume.",
        )

    # Resume content analysis works on cleaned text while
    # the original ResumeDocument remains available for ATS.
    cleaned_text = clean_resume_text(
        document.text
    )

    if not cleaned_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Resume text is empty after cleaning.",
        )

    # Extract structured resume information from the cleaned text.
    try:
        analysis = analyze_resume(
            cleaned_text
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Resume analysis failed.",
        )

    # Run application-level intelligence using both the
    # canonical document and structured resume analysis.
    try:
        intelligence = analyze_resume_intelligence(
            resume_document=document,
            resume_analysis=analysis,
        )
    except Exception as e:
        print(f"[CRITICAL] Intelligence analysis error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Resume intelligence analysis failed: {str(e)}",
        )

    # Persist the existing resume-analysis contract so current
    # repository and frontend consumers remain compatible.
    try:
        resume_result = save_resume_analysis(
            user_email=user_email,
            file_path=file_path,
            analysis=analysis,
            intelligence=intelligence,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save resume analysis.",
        )

    return {
        "message": "Resume analyzed successfully.",
        "resume_id": resume_result["resume_id"],
        "version": resume_result["version"],
        "is_latest": True,
        "analysis": analysis,
        "intelligence": intelligence,
    }


@router.get("/latest")
async def get_latest_resume(
    current_user: dict[str, Any] = Depends(
        get_current_user
    ),
):
    """
    Return the latest analyzed resume belonging
    to the authenticated user.
    """

    user_email = current_user.get("email")

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user email is missing.",
        )

    resume = get_latest_resume_by_user(
        user_email=user_email
    )

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found for this user.",
        )

    return {
        "message": "Latest resume retrieved successfully.",
        "resume_id": str(resume["_id"]),
        "version": resume.get("version", 1),
        "is_latest": resume.get(
            "is_latest",
            True,
        ),
        "analysis": resume.get("analysis"),
        "intelligence": resume.get("intelligence"),
        "created_at": resume.get("created_at"),
        "updated_at": resume.get("updated_at"),
    }


@router.get("/history")
async def get_resume_history(
    current_user: dict[str, Any] = Depends(
        get_current_user
    ),
):
    """
    Return archived resume versions belonging
    to the authenticated user.

    The current/latest version is excluded.
    """

    user_email = current_user.get("email")

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user email is missing.",
        )

    resumes = get_resume_history_by_user(
        user_email=user_email
    )

    formatted_history = []

    for resume in resumes:
        formatted_history.append(
            {
                "id": str(resume["_id"]),
                "source_resume_id": resume.get(
                    "source_resume_id"
                ),
                "version": resume.get(
                    "version",
                    1,
                ),
                "file_path": resume.get(
                    "file_path"
                ),
                "analysis": resume.get(
                    "analysis"
                ),
                "intelligence": resume.get(
                    "intelligence"
                ),
                "created_at": resume.get(
                    "created_at"
                ),
                "updated_at": resume.get(
                    "updated_at"
                ),
                "archived_at": resume.get(
                    "archived_at"
                ),
                "archived_reason": resume.get(
                    "archived_reason"
                ),
            }
        )

    return {
        "message": "Resume history retrieved successfully.",
        "history": formatted_history,
        "total_versions": len(
            formatted_history
        ),
    }


@router.get("")
async def get_my_resumes(
    current_user: dict[str, Any] = Depends(
        get_current_user
    ),
):
    """
    Return all resume versions belonging
    to the authenticated user.
    """

    user_email = current_user.get("email")

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user email is missing.",
        )

    resumes = get_resumes_by_user(
        user_email=user_email
    )

    formatted_resumes = []

    for resume in resumes:
        formatted_resumes.append(
            {
                "id": str(resume["_id"]),
                "user_email": resume.get(
                    "user_email"
                ),
                "file_path": resume.get(
                    "file_path"
                ),
                "version": resume.get(
                    "version",
                    1,
                ),
                "is_latest": resume.get(
                    "is_latest",
                    False,
                ),
                "analysis": resume.get(
                    "analysis"
                ),
                "intelligence": resume.get(
                    "intelligence"
                ),
                "created_at": resume.get(
                    "created_at"
                ),
                "updated_at": resume.get(
                    "updated_at"
                ),
            }
        )

    return {
        "message": "User resumes retrieved successfully.",
        "resumes": formatted_resumes,
        "total_versions": len(
            formatted_resumes
        ),
    }