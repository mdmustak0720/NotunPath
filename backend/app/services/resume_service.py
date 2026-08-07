# Purpose: Saves uploaded resumes and extracts text from PDF files.

import os
import shutil
import fitz
from fastapi import UploadFile

UPLOAD_FOLDER = "app/uploads"


# Save the uploaded resume to the uploads folder.
async def save_resume(file: UploadFile):

    # Create uploads folder if it doesn't exist.
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Build the destination path.
    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    # Save the uploaded PDF.
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Return the saved file path.
    return file_path


# Extract text from the uploaded PDF.
def extract_resume_text(file_path):

    # Open the PDF document.
    document = fitz.open(file_path)

    text = ""

    # Read text from every page.
    for page in document:
        text += page.get_text()

    # Close the PDF.
    document.close()

    # Return the extracted text.
    return text.strip()