"""
Resume Score Gemini Integration Test

Purpose:
Validates the real Gemini pipeline:

    Resume PDF
        ↓
    PDF text extraction
        ↓
    Resume Analyzer
        ↓
    ResumeAnalysis
        ↓
    Resume normalization
        ↓
    Score Analyzer
        ↓
    GeminiScoreEvaluation
        ↓
    Final ResumeScore

IMPORTANT:
This test makes a real Gemini API request.

Run explicitly with:

    python -m pytest tests/test_score_gemini_integration.py -v -s
"""

from pathlib import Path

import pytest

from app.ai.analyzers.intelligence.score_analyzer import (
    analyze_resume_score,
)

from app.ai.analyzers.resume_analyzer import (
    analyze_resume,
)

from app.services.resume_service import (
    extract_resume_text,
)


# =========================================================
# Test Configuration
# =========================================================

# Replace this with a real resume PDF from your uploads.
PDF_PATH = Path(
    r"C:\Users\mdmus\OneDrive\Desktop\NotunPath\backend\app\uploads\Mustak_CV S.pdf"
)


# =========================================================
# Integration Test
# =========================================================

@pytest.mark.integration
def test_real_gemini_resume_score():
    """
    Run the complete real Gemini resume-analysis and
    resume-scoring pipeline.
    """

    # -----------------------------------------------------
    # Step 1: Validate test PDF
    # -----------------------------------------------------

    if (
        PDF_PATH.name
        == "YOUR_RESUME.pdf"
    ):
        pytest.fail(
            "Set PDF_PATH to a real resume PDF "
            "before running the integration test."
        )

    if not PDF_PATH.exists():
        pytest.fail(
            f"Resume PDF not found: {PDF_PATH}"
        )

    if PDF_PATH.suffix.lower() != ".pdf":
        pytest.fail(
            "PDF_PATH must point to a PDF file."
        )

    # -----------------------------------------------------
    # Step 2: Extract PDF text
    # -----------------------------------------------------

    resume_text = extract_resume_text(
        str(PDF_PATH)
    )

    assert isinstance(
        resume_text,
        str,
    )

    assert resume_text.strip(), (
        "Resume PDF produced no readable text."
    )

    print(
        f"\nExtracted characters: "
        f"{len(resume_text)}"
    )

    # -----------------------------------------------------
    # Step 3: Run real Resume Analyzer
    # -----------------------------------------------------

    resume_analysis = analyze_resume(
        resume_text
    )

    assert isinstance(
        resume_analysis,
        dict,
    )

    assert resume_analysis, (
        "Resume analyzer returned empty analysis."
    )

    # -----------------------------------------------------
    # Step 4: Inspect structured extraction
    # -----------------------------------------------------

    skills = resume_analysis.get(
        "skills",
        [],
    )

    projects = resume_analysis.get(
        "projects",
        [],
    )

    work_experience = resume_analysis.get(
        "work_experience",
        [],
    )

    education = resume_analysis.get(
        "education",
        [],
    )

    target_roles = resume_analysis.get(
        "target_roles",
        [],
    )

    print(
        f"Skills: {len(skills)}"
    )

    print(
        f"Projects: {len(projects)}"
    )

    print(
        f"Work experience: "
        f"{len(work_experience)}"
    )

    print(
        f"Education: {len(education)}"
    )

    print(
        f"Target roles: {len(target_roles)}"
    )

    # -----------------------------------------------------
    # Step 5: Run real Gemini score analysis
    # -----------------------------------------------------

    score_result = analyze_resume_score(
        resume_analysis
    )

    # -----------------------------------------------------
    # Step 6: Validate final structure
    # -----------------------------------------------------

    assert isinstance(
        score_result,
        dict,
    )

    overall_score = score_result.get(
        "overall_score"
    )

    assert isinstance(
        overall_score,
        int,
    )

    assert 0 <= overall_score <= 100

    assert isinstance(
        score_result.get(
            "score_breakdown"
        ),
        dict,
    )

    expected_categories = {
        "skills",
        "projects",
        "experience_evidence",
        "education",
        "career_direction",
        "content_quality",
        "professional_clarity",
        "completeness",
    }

    actual_categories = set(
        score_result[
            "score_breakdown"
        ].keys()
    )

    assert actual_categories == (
        expected_categories
    )

    # -----------------------------------------------------
    # Step 7: Validate individual dimensions
    # -----------------------------------------------------

    for (
        category,
        dimension,
    ) in score_result[
        "score_breakdown"
    ].items():

        assert isinstance(
            dimension,
            dict,
        )

        assert isinstance(
            dimension.get("score"),
            int,
        )

        assert 0 <= dimension[
            "score"
        ] <= 100

        assert isinstance(
            dimension.get("weight"),
            int,
        )

        assert (
            dimension["weight"]
            >= 0
        )

        assert isinstance(
            dimension.get("rationale"),
            str,
        )

        assert dimension[
            "rationale"
        ].strip()

    # -----------------------------------------------------
    # Step 8: Final output
    # -----------------------------------------------------

    print(
        "\n========================================"
    )

    print(
        "REAL GEMINI INTEGRATION TEST PASSED"
    )

    print(
        "========================================"
    )

    print(
        f"Resume Score: "
        f"{overall_score}/100"
    )

    print(
        f"Score Label: "
        f"{score_result.get('score_label')}"
    )

    print(
        "\nScore Breakdown:"
    )

    for (
        category,
        dimension,
    ) in score_result[
        "score_breakdown"
    ].items():

        print(
            f"  {category:<24}"
            f"{dimension['score']:>3}/100"
        )