"""
Resume Service

Purpose:
Handles resume file storage and PDF text extraction.
"""

import os
import shutil
from pathlib import Path
from uuid import uuid4

import fitz
from fastapi import UploadFile


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

UPLOAD_FOLDER = Path("app/uploads")


# ---------------------------------------------------------
# Save Resume
# ---------------------------------------------------------

async def save_resume(file: UploadFile) -> str:
    """
    Save an uploaded resume PDF to the uploads directory.

    A unique filename is generated to prevent two users
    from accidentally overwriting each other's resumes.

    Returns:
        str: Path to the saved resume.
    """

    # Create upload directory if it does not exist.
    UPLOAD_FOLDER.mkdir(
        parents=True,
        exist_ok=True,
    )

    # Get the original filename safely.
    original_filename = Path(
        file.filename or "resume.pdf"
    ).name

    # Preserve the original extension.
    extension = Path(
        original_filename
    ).suffix.lower()

    if extension != ".pdf":
        extension = ".pdf"

    # Generate a unique filename.
    unique_filename = (
        f"{uuid4().hex}{extension}"
    )

    # Build the final file path.
    file_path = UPLOAD_FOLDER / unique_filename

    try:
        # Save the uploaded file.
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer,
            )

    except Exception:
        # Remove partially written file if saving fails.
        if file_path.exists():
            file_path.unlink()

        raise

    return str(file_path)


# ---------------------------------------------------------
# Extract Resume Text
# ---------------------------------------------------------

def extract_resume_text(file_path: str) -> str:
    """
    Extract text from every page of a PDF resume.

    Returns:
        str: Extracted and stripped text.
    """

    document = None

    try:
        # Open the PDF.
        document = fitz.open(file_path)

        text_parts = []

        # Extract text from every page.
        for page in document:
            page_text = page.get_text()

            if page_text:
                text_parts.append(page_text)

        # Combine extracted text.
        extracted_text = "\n".join(
            text_parts
        ).strip()

        return extracted_text

    finally:
        # Always close the PDF document.
        if document is not None:
            document.close()