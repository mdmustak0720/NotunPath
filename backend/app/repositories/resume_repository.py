"""
Resume Repository

Purpose:
Handles database operations for resume data.
"""

from datetime import datetime, timezone

from app.database.mongodb import db


# ---------------------------------------------------------
# Collection
# ---------------------------------------------------------

resumes_collection = db["resumes"]


# ---------------------------------------------------------
# Save Resume Analysis
# ---------------------------------------------------------

def save_resume_analysis(
    user_email: str,
    file_path: str,
    analysis: dict,
) -> str:
    """
    Saves the analyzed resume and returns its database ID.
    """

    now = datetime.now(timezone.utc)

    resume_document = {
        "user_email": user_email,
        "file_path": file_path,
        "analysis": analysis,
        "created_at": now,
        "updated_at": now,
    }

    result = resumes_collection.insert_one(
        resume_document
    )

    return str(result.inserted_id)


# ---------------------------------------------------------
# Get All Resumes By User
# ---------------------------------------------------------

def get_resumes_by_user(
    user_email: str,
):
    """
    Returns all resumes belonging to the authenticated user.

    Resumes are returned from newest to oldest.
    """

    return resumes_collection.find(
        {"user_email": user_email}
    ).sort(
        "created_at",
        -1,
    )


# ---------------------------------------------------------
# Get Latest Resume By User
# ---------------------------------------------------------

def get_latest_resume_by_user(
    user_email: str,
):
    """
    Returns the latest analyzed resume
    belonging to the authenticated user.

    Returns:
        Resume document if found, otherwise None.
    """

    return resumes_collection.find_one(
        {"user_email": user_email},
        sort=[
            ("created_at", -1),
        ],
    )