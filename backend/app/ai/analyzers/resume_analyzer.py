"""
Resume Analyzer

Purpose:
Analyzes a resume using the configured AI provider,
validates the structured response, and normalizes
the extracted resume data.

Pipeline:

    Resume Text
        ↓
    Prompt Builder
        ↓
    Gemini Structured Output
        ↓
    ResumeAnalysis Validation
        ↓
    Normalization
        ↓
    Structured Resume Dictionary
"""

from __future__ import annotations

from app.ai.prompts.resume_prompt import (
    build_resume_prompt,
)

from app.ai.providers.gemini_provider import (
    generate_content,
)

from app.ai.schemas.resume_schema import (
    ResumeAnalysis,
)

from app.ai.utils.resume_normalizer import (
    normalize_resume_analysis,
)


# =========================================================
# Public API
# =========================================================

def analyze_resume(
    resume_text: str,
) -> dict:
    """
    Analyze resume text and return validated,
    normalized structured resume data.

    Args:
        resume_text:
            Extracted plain text from the resume PDF.

    Returns:
        Normalized structured resume analysis.

    Raises:
        ValueError:
            Invalid or empty resume text.
            Invalid AI response structure.
    """

    # -----------------------------------------------------
    # Step 1: Validate input
    # -----------------------------------------------------

    if not isinstance(
        resume_text,
        str,
    ):
        raise ValueError(
            "Resume text must be a string."
        )

    resume_text = resume_text.strip()

    if not resume_text:
        raise ValueError(
            "Resume text cannot be empty."
        )

    # -----------------------------------------------------
    # Step 2: Build AI prompt
    # -----------------------------------------------------

    prompt = build_resume_prompt(
        resume_text
    )

    # -----------------------------------------------------
    # Step 3: Generate structured Gemini response
    #
    # The response schema is explicitly passed so the
    # provider is reusable for other AI analyzers too.
    # -----------------------------------------------------

    try:

        response = generate_content(
            prompt,
            response_schema=ResumeAnalysis,
        )

    except Exception as error:

        raise RuntimeError(
            "Resume analysis failed while "
            "calling the configured AI provider."
        ) from error

    # -----------------------------------------------------
    # Step 4: Validate structured AI response
    #
    # Even though Gemini is requested to follow the
    # Pydantic schema, we validate again at our own
    # application boundary.
    # -----------------------------------------------------

    try:

        validated_analysis = (
            ResumeAnalysis.model_validate_json(
                response
            )
        )

    except Exception as error:

        raise ValueError(
            "Invalid resume analysis structure: "
            f"{error}"
        ) from error

    # -----------------------------------------------------
    # Step 5: Convert Pydantic model to dictionary
    # -----------------------------------------------------

    analysis = (
        validated_analysis.model_dump(
            exclude_none=False
        )
    )

    # -----------------------------------------------------
    # Step 6: Normalize extracted data
    #
    # Removes placeholder/empty values while preserving
    # meaningful values.
    # -----------------------------------------------------

    normalized_analysis = (
        normalize_resume_analysis(
            analysis
        )
    )

    # -----------------------------------------------------
    # Step 7: Final validation
    #
    # Ensure normalization still produces the expected
    # dictionary contract.
    # -----------------------------------------------------

    if not isinstance(
        normalized_analysis,
        dict,
    ):
        raise ValueError(
            "Normalized resume analysis must "
            "be a dictionary."
        )

    # -----------------------------------------------------
    # Step 8: Return final structured analysis
    # -----------------------------------------------------

    return normalized_analysis