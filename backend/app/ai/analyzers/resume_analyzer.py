"""
Resume Analyzer

Purpose:
Analyzes a resume using the configured AI provider,
validates the structured response, and normalizes
the extracted resume data.
"""

from app.ai.prompts.resume_prompt import build_resume_prompt
from app.ai.providers.gemini_provider import generate_content
from app.ai.schemas.resume_schema import ResumeAnalysis
from app.ai.utils.resume_normalizer import normalize_resume_analysis


def analyze_resume(
    resume_text: str,
) -> dict:
    """
    Analyze resume text and return validated,
    normalized structured resume data.
    """

    # -----------------------------------------------------
    # Step 1: Build AI prompt
    # -----------------------------------------------------

    prompt = build_resume_prompt(
        resume_text
    )

    # -----------------------------------------------------
    # Step 2: Generate structured Gemini response
    # -----------------------------------------------------

    response = generate_content(
        prompt
    )

    # -----------------------------------------------------
    # Step 3: Validate the JSON response
    # -----------------------------------------------------

    try:
        validated_analysis = (
            ResumeAnalysis.model_validate_json(
                response
            )
        )

    except Exception as error:
        raise ValueError(
            f"Invalid resume analysis structure: {error}"
        ) from error

    # -----------------------------------------------------
    # Step 4: Convert validated model to dictionary
    # -----------------------------------------------------

    analysis = validated_analysis.model_dump(
        exclude_none=False
    )

    # -----------------------------------------------------
    # Step 5: Remove empty and placeholder values
    # -----------------------------------------------------

    normalized_analysis = (
        normalize_resume_analysis(
            analysis
        )
    )

    # -----------------------------------------------------
    # Step 6: Return final analysis
    # -----------------------------------------------------

    return normalized_analysis