"""
Tests for the resume intelligence orchestration service.
"""

from unittest.mock import patch

import pytest

from app.services.intelligence_service import (
    analyze_resume_intelligence,
)
from app.schemas.document_schema import (
    BoundingBox,
    DocumentBlock,
    DocumentSignals,
    LayoutSignals,
    ResumeDocument,
    ResumePage,
    TextLine,
    TextSpan,
)


def build_resume_document() -> ResumeDocument:
    """Build a minimal valid ResumeDocument for orchestration tests."""

    span = TextSpan(
        text="Python React MongoDB",
        bbox=BoundingBox(
            x0=10,
            y0=10,
            x1=180,
            y1=25,
        ),
        font="Arial",
        size=11,
        flags=0,
    )

    line = TextLine(
        bbox=BoundingBox(
            x0=10,
            y0=10,
            x1=180,
            y1=25,
        ),
        spans=[span],
    )

    block = DocumentBlock(
        type=0,
        bbox=BoundingBox(
            x0=10,
            y0=10,
            x1=200,
            y1=35,
        ),
        lines=[line],
    )

    layout = LayoutSignals(
        box_class_counts={
            "section-header": 4,
            "text": 6,
            "list-item": 3,
        },
        title_count=0,
        section_header_count=4,
        table_count=0,
        picture_count=0,
        page_header_count=0,
        page_footer_count=0,
        list_item_count=3,
        likely_multi_column_pages=[],
    )

    signals = DocumentSignals(
        page_count=1,
        extracted_character_count=500,
        text_block_count=6,
        image_count=0,
        drawing_count=0,
        table_count=0,
        link_count=0,
        font_count=1,
        pages_with_text=1,
        pages_without_text=0,
        image_only_pages=[],
        extraction_warnings=[],
        layout=layout,
    )

    page = ResumePage(
        page_number=1,
        width=595,
        height=842,
        rotation=0,
        text="Python React MongoDB",
        text_block_count=6,
        image_count=0,
        drawing_count=0,
        table_count=0,
        link_count=0,
        text_blocks=[block],
    )

    return ResumeDocument(
        file_name="test_resume.pdf",
        file_path="app/uploads/test_resume.pdf",
        file_size_bytes=10_000,
        file_type="application/pdf",
        page_count=1,
        text="Python React MongoDB",
        pages=[page],
        signals=signals,
    )


def build_resume_analysis() -> dict:
    """Build a minimal normalized resume analysis."""

    return {
        "professional_summary": (
            "Software developer with full-stack experience."
        ),
        "target_roles": [
            "Software Developer",
        ],
        "skills": [
            "Python",
            "React.js",
            "MongoDB",
        ],
        "projects": [
            {
                "title": "Career Platform",
                "technologies": [
                    "Python",
                    "React.js",
                    "MongoDB",
                ],
                "description": (
                    "Built a full-stack career platform."
                ),
            }
        ],
        "education": [
            {
                "degree": "B.Tech",
                "institution": "Example Institute",
            }
        ],
    }


def build_score_result() -> dict:
    """Build a representative score analyzer result."""

    return {
        "overall_score": 82,
        "score_label": "Strong",
        "score_breakdown": {},
    }


def build_ats_result() -> dict:
    """Build a representative ATS analyzer result."""

    return {
        "analysis_version": "2.1",
        "overall_score": 84,
        "score_label": "Strong",
        "confidence": "high",
        "issues": [],
        "recommendations": [],
    }


def test_intelligence_service_runs_score_and_ats():
    """Both available analyzers should be executed."""

    document = build_resume_document()
    analysis = build_resume_analysis()

    with (
        patch(
            "app.services.intelligence_service.analyze_resume_score",
            return_value=build_score_result(),
        ) as score_mock,
        patch(
            "app.services.intelligence_service.analyze_resume_ats",
            return_value=build_ats_result(),
        ) as ats_mock,
    ):
        result = analyze_resume_intelligence(
            resume_document=document,
            resume_analysis=analysis,
        )

    score_mock.assert_called_once_with(
        analysis
    )

    ats_mock.assert_called_once_with(
        resume_document=document,
        resume_analysis=analysis,
    )

    assert result["intelligence_version"] == "2.0"

    assert result["score"] == build_score_result()
    assert result["ats"] == build_ats_result()

    assert result["analyzers"]["score"] == {
        "available": True,
        "version": "1.0",
    }

    assert result["analyzers"]["ats"] == {
        "available": True,
        "version": "2.1",
    }

    assert result["analyzers"]["strengths"] == {
        "available": False,
        "version": None,
    }


def test_intelligence_service_rejects_invalid_document():
    """A non-ResumeDocument must be rejected."""

    with pytest.raises(
        ValueError,
        match="Resume document must be a ResumeDocument",
    ):
        analyze_resume_intelligence(
            resume_document=None,
            resume_analysis=build_resume_analysis(),
        )


def test_intelligence_service_rejects_invalid_resume_analysis():
    """A non-dictionary resume analysis must be rejected."""

    with pytest.raises(
        ValueError,
        match="Resume analysis must be a dictionary",
    ):
        analyze_resume_intelligence(
            resume_document=build_resume_document(),
            resume_analysis=None,
        )


def test_intelligence_service_rejects_empty_resume_analysis():
    """An empty resume analysis must be rejected."""

    with pytest.raises(
        ValueError,
        match="Resume analysis cannot be empty",
    ):
        analyze_resume_intelligence(
            resume_document=build_resume_document(),
            resume_analysis={},
        )


def test_intelligence_service_propagates_score_failure():
    """Score analyzer failures should reach the service caller."""

    document = build_resume_document()
    analysis = build_resume_analysis()

    with patch(
        "app.services.intelligence_service.analyze_resume_score",
        side_effect=RuntimeError(
            "Score analyzer failed"
        ),
    ):
        with pytest.raises(
            RuntimeError,
            match="Score analyzer failed",
        ):
            analyze_resume_intelligence(
                resume_document=document,
                resume_analysis=analysis,
            )


def test_intelligence_service_propagates_ats_failure():
    """ATS analyzer failures should reach the service caller."""

    document = build_resume_document()
    analysis = build_resume_analysis()

    with patch(
        "app.services.intelligence_service.analyze_resume_score",
        return_value=build_score_result(),
    ):
        with patch(
            "app.services.intelligence_service.analyze_resume_ats",
            side_effect=RuntimeError(
                "ATS analyzer failed"
            ),
        ):
            with pytest.raises(
                RuntimeError,
                match="ATS analyzer failed",
            ):
                analyze_resume_intelligence(
                    resume_document=document,
                    resume_analysis=analysis,
                )


def test_intelligence_service_does_not_call_ats_before_score():
    """The current orchestration order should remain deterministic."""

    document = build_resume_document()
    analysis = build_resume_analysis()

    calls = []

    def fake_score(resume_analysis):
        calls.append("score")
        return build_score_result()

    def fake_ats(
        resume_document,
        resume_analysis,
    ):
        calls.append("ats")
        return build_ats_result()

    with (
        patch(
            "app.services.intelligence_service.analyze_resume_score",
            side_effect=fake_score,
        ),
        patch(
            "app.services.intelligence_service.analyze_resume_ats",
            side_effect=fake_ats,
        ),
    ):
        analyze_resume_intelligence(
            resume_document=document,
            resume_analysis=analysis,
        )

    assert calls == [
        "score",
        "ats",
    ]