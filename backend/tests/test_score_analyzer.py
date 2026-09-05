"""
Score Analyzer Tests

Purpose:
Tests the Resume Score Analyzer independently before
integrating it into the application service layer.

These tests verify:
- deterministic signal handling
- Gemini response validation
- final score calculation
- schema compliance
- project handling
- missing optional sections
"""

from unittest.mock import patch

import pytest

from app.ai.analyzers.intelligence.score_analyzer import (
    analyze_resume_score,
)


# =========================================================
# Fixtures
# =========================================================

@pytest.fixture
def sample_resume_analysis():
    return {
        "personal_information": {
            "full_name": "Test Candidate",
            "email": "test@example.com",
        },

        "professional_summary": (
            "Full-stack developer with experience "
            "building web applications."
        ),

        "target_roles": [
            "Full Stack Developer",
        ],

        "skills": [
            "Python",
            "JavaScript",
            "React",
            "Node.js",
            "FastAPI",
            "MongoDB",
        ],

        "projects": [
            {
                "title": "Real-Time Chat Application",
                "technologies": [
                    "React",
                    "Node.js",
                    "Socket.io",
                    "MongoDB",
                ],
                "description": (
                    "Built a real-time chat application "
                    "with authentication and messaging."
                ),
            },
            {
                "title": "E-Commerce Platform",
                "technologies": [],
                "description": (
                    "Developed an e-commerce platform "
                    "with product and order management."
                ),
            },
        ],

        "work_experience": [],

        "education": [
            {
                "degree": "B.Tech",
                "institution": "Example Institute",
                "dates": "2022 - 2026",
            }
        ],

        "certifications": [
            {
                "title": "Python Certification",
                "issuer": "Example",
                "dates": "2025",
            }
        ],

        "achievements": [],
        "publications": [],
        "research": [],
        "licenses": [],
        "languages": [
            "English",
        ],
        "volunteer_experience": [],
        "internships": [],
        "awards": [],
        "custom_sections": [],
    }


@pytest.fixture
def mock_gemini_response():
    return """
{
  "content_quality": 82,
  "content_quality_rationale": "The resume presents relevant technical content clearly.",
  "skills_presentation": 84,
  "skills_presentation_rationale": "The resume identifies a focused set of relevant technical skills.",
  "project_evidence": 88,
  "project_evidence_rationale": "The projects include meaningful descriptions and demonstrate practical development work.",
  "experience_evidence": 65,
  "experience_evidence_rationale": "The resume contains project and academic evidence but limited professional experience.",
  "education_quality": 86,
  "education_quality_rationale": "The education entry clearly identifies the qualification, institution, and dates.",
  "career_direction": 82,
  "career_direction_rationale": "The target role and professional summary provide a reasonably clear direction.",
  "professional_clarity": 83,
  "professional_clarity_rationale": "The resume communicates the candidate's technical profile with reasonable clarity.",
  "strengths": [
    {
      "category": "projects",
      "title": "Strong project evidence",
      "description": "The resume contains practical full-stack project experience."
    }
  ],
  "improvement_areas": [
    {
      "category": "experience_evidence",
      "title": "Strengthen professional experience",
      "description": "Add internship or professional experience when available.",
      "priority": 2
    }
  ],
  "evidence": [
    "Multiple software projects are documented.",
    "The resume contains relevant technical skills.",
    "A clear target role is provided."
  ]
}
""".strip()


# =========================================================
# Tests
# =========================================================

@patch(
    "app.ai.analyzers.intelligence.score_analyzer.generate_content"
)
def test_score_analyzer_success(
    mock_generate_content,
    sample_resume_analysis,
    mock_gemini_response,
):
    """
    Verify a valid Gemini response produces a valid
    ResumeScore result.
    """

    mock_generate_content.return_value = (
        mock_gemini_response
    )

    result = analyze_resume_score(
        sample_resume_analysis
    )

    assert isinstance(
        result,
        dict,
    )

    assert "overall_score" in result
    assert "score_breakdown" in result
    assert "strengths" in result
    assert "improvement_areas" in result

    assert 0 <= result[
        "overall_score"
    ] <= 100

    assert set(
        result["score_breakdown"].keys()
    ) == {
        "skills",
        "projects",
        "experience_evidence",
        "education",
        "career_direction",
        "content_quality",
        "professional_clarity",
        "completeness",
    }


@patch(
    "app.ai.analyzers.intelligence.score_analyzer.generate_content"
)
def test_provider_receives_score_schema(
    mock_generate_content,
    sample_resume_analysis,
    mock_gemini_response,
):
    """
    Verify that the analyzer explicitly requests
    GeminiScoreEvaluation from the provider.
    """

    mock_generate_content.return_value = (
        mock_gemini_response
    )

    analyze_resume_score(
        sample_resume_analysis
    )

    mock_generate_content.assert_called_once()

    call_kwargs = (
        mock_generate_content
        .call_args.kwargs
    )

    response_schema = call_kwargs[
        "response_schema"
    ]

    assert response_schema.__name__ == (
        "GeminiScoreEvaluation"
    )


@patch(
    "app.ai.analyzers.intelligence.score_analyzer.generate_content"
)
def test_project_without_technologies_is_valid(
    mock_generate_content,
    sample_resume_analysis,
    mock_gemini_response,
):
    """
    Verify a project remains valid when technologies
    are not explicitly listed.
    """

    mock_generate_content.return_value = (
        mock_gemini_response
    )

    result = analyze_resume_score(
        sample_resume_analysis
    )

    deterministic_signals = (
        result[
            "scoring_notes"
        ][
            "deterministic_signals"
        ]
    )

    assert (
        deterministic_signals[
            "project_count"
        ] == 2
    )

    assert (
        deterministic_signals[
            "projects_with_descriptions"
        ] == 2
    )

    assert (
        deterministic_signals[
            "projects_with_technologies"
        ] == 1
    )


@patch(
    "app.ai.analyzers.intelligence.score_analyzer.generate_content"
)
def test_missing_optional_sections_do_not_crash(
    mock_generate_content,
    sample_resume_analysis,
    mock_gemini_response,
):
    """
    Verify the analyzer safely handles normalized
    resumes where optional sections are absent.
    """

    mock_generate_content.return_value = (
        mock_gemini_response
    )

    analysis = dict(
        sample_resume_analysis
    )

    analysis.pop(
        "publications",
        None,
    )

    analysis.pop(
        "research",
        None,
    )

    analysis.pop(
        "licenses",
        None,
    )

    result = analyze_resume_score(
        analysis
    )

    assert 0 <= result[
        "overall_score"
    ] <= 100


@patch(
    "app.ai.analyzers.intelligence.score_analyzer.generate_content"
)
def test_invalid_gemini_response_is_rejected(
    mock_generate_content,
    sample_resume_analysis,
):
    """
    Verify malformed Gemini output fails at the
    Pydantic validation boundary.
    """

    mock_generate_content.return_value = """
{
  "content_quality": "excellent"
}
""".strip()

    with pytest.raises(
        ValueError,
        match="invalid resume score evaluation",
    ):
        analyze_resume_score(
            sample_resume_analysis
        )


@patch(
    "app.ai.analyzers.intelligence.score_analyzer.generate_content"
)
def test_gemini_failure_is_wrapped(
    mock_generate_content,
    sample_resume_analysis,
):
    """
    Verify provider failures are converted into a
    controlled application-level error.
    """

    mock_generate_content.side_effect = (
        RuntimeError(
            "Gemini unavailable"
        )
    )

    with pytest.raises(
        RuntimeError,
        match="Resume score evaluation failed",
    ):
        analyze_resume_score(
            sample_resume_analysis
        )