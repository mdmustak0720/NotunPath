"""
Intelligence Service

Application-level orchestration for NotunPath's
resume intelligence pipeline.

This service coordinates intelligence analyzers and
returns a unified result for the application layer.

It does not:
- Call AI providers directly.
- Implement analyzer logic.
- Access persistence.
- Handle HTTP concerns.
"""

from __future__ import annotations

from typing import Any

from app.ai.analyzers.intelligence.ats_analyzer import (
    analyze_resume_ats,
)
from app.ai.analyzers.intelligence.score_analyzer import (
    analyze_resume_score,
)
from app.schemas.document_schema import (
    ResumeDocument,
)


INTELLIGENCE_VERSION = "2.0"

SCORE_ANALYZER_VERSION = "1.0"
ATS_ANALYZER_VERSION = "2.1"


def analyze_resume_intelligence(
    resume_document: ResumeDocument,
    resume_analysis: dict[str, Any],
) -> dict[str, Any]:
    """
    Run the available resume intelligence analyzers.

    Args:
        resume_document:
            Canonical document representation produced by
            the resume document extraction layer.

        resume_analysis:
            Normalized structured resume analysis produced
            by the resume analyzer.

    Returns:
        Unified intelligence result containing the score
        and ATS analyses.

    Raises:
        ValueError:
            Invalid resume document or resume analysis.
    """

    # Validate the document before passing it to analyzers.
    if not isinstance(
        resume_document,
        ResumeDocument,
    ):
        raise ValueError(
            "Resume document must be a ResumeDocument."
        )

    # Validate the normalized resume analysis once at
    # the orchestration boundary.
    if not isinstance(
        resume_analysis,
        dict,
    ):
        raise ValueError(
            "Resume analysis must be a dictionary."
        )

    if not resume_analysis:
        raise ValueError(
            "Resume analysis cannot be empty."
        )

    # Run the content-quality analysis independently.
    score = analyze_resume_score(
        resume_analysis
    )

    # Run document-focused ATS analysis using both the
    # extracted document evidence and structured resume data.
    ats = analyze_resume_ats(
        resume_document=resume_document,
        resume_analysis=resume_analysis,
    )

    return {
        "intelligence_version": (
            INTELLIGENCE_VERSION
        ),

        "score": score,

        "ats": ats,

        "analyzers": {
            "score": {
                "available": True,
                "version": SCORE_ANALYZER_VERSION,
            },

            "ats": {
                "available": True,
                "version": ATS_ANALYZER_VERSION,
            },

            "strengths": {
                "available": False,
                "version": None,
            },
        },
    }