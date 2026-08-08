"""
Gemini Provider

Purpose:
Handles communication with the Gemini API and requests
structured JSON output using the canonical resume schema.
"""

import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.ai.schemas.resume_schema import ResumeAnalysis


# ---------------------------------------------------------
# Environment
# ---------------------------------------------------------

load_dotenv()


# ---------------------------------------------------------
# Gemini Configuration
# ---------------------------------------------------------

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured."
    )


MODEL_NAME = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.6-flash",
)


# ---------------------------------------------------------
# Gemini Client
# ---------------------------------------------------------

client = genai.Client(
    api_key=GEMINI_API_KEY,
)


# ---------------------------------------------------------
# Generate Content
# ---------------------------------------------------------

def generate_content(prompt: str) -> str:
    """
    Send a prompt to Gemini and return structured JSON
    matching the ResumeAnalysis schema.
    """

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ResumeAnalysis,
            ),
        )

        # -------------------------------------------------
        # Validate Gemini response
        # -------------------------------------------------

        if not response.text:
            raise ValueError(
                "Gemini returned an empty response."
            )

        return response.text.strip()

    except Exception as error:
        raise RuntimeError(
            f"Gemini API Error: {error}"
        ) from error