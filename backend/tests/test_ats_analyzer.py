from unittest.mock import patch

import pytest

from app.ai.analyzers.intelligence.ats_analyzer import (
    analyze_resume_ats,
)
from app.ai.schemas.intelligence.ats_schema import (
    GeminiATSEvaluation,
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
    span = TextSpan(
        text="Python",
        bbox=BoundingBox(
            x0=10,
            y0=10,
            x1=80,
            y1=20,
        ),
        font="Arial",
        size=11,
        flags=0,
    )

    line = TextLine(
        bbox=BoundingBox(
            x0=10,
            y0=10,
            x1=80,
            y1=20,
        ),
        spans=[span],
    )

    block = DocumentBlock(
        type=0,
        bbox=BoundingBox(
            x0=10,
            y0=10,
            x1=100,
            y1=30,
        ),
        lines=[line],
    )

    layout = LayoutSignals(
        box_class_counts={
            "section-header": 5,
            "text": 8,
            "list-item": 4,
        },
        title_count=0,
        section_header_count=5,
        table_count=0,
        picture_count=0,
        page_header_count=0,
        page_footer_count=0,
        list_item_count=4,
        likely_multi_column_pages=[],
    )

    signals = DocumentSignals(
        page_count=1,
        extracted_character_count=500,
        text_block_count=8,
        image_count=0,
        drawing_count=2,
        table_count=0,
        link_count=2,
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
        text_block_count=8,
        image_count=0,
        drawing_count=2,
        table_count=0,
        link_count=2,
        text_blocks=[block],
    )

    return ResumeDocument(
        file_name="test_resume.pdf",
        file_path="app/uploads/test_resume.pdf",
        file_size_bytes=10000,
        file_type="application/pdf",
        page_count=1,
        text="Python React MongoDB",
        pages=[page],
        signals=signals,
    )


def build_resume_analysis() -> dict:
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


def build_gemini_evaluation() -> GeminiATSEvaluation:
    return GeminiATSEvaluation(
        parsing_interpretability=86,
        parsing_interpretability_rationale=(
            "The document contains extractable text across "
            "all pages, with no image-only pages or table structures."
        ),
        structure_interpretability=84,
        structure_interpretability_rationale=(
            "The resume contains recognizable section headings "
            "and a generally consistent document structure."
        ),
        text_integrity=78,
        text_integrity_rationale=(
            "The extracted text is mostly readable, but minor "
            "token-concatenation signals are present."
        ),
        terminology_consistency=84,
        terminology_consistency_rationale=(
            "Technical terminology is generally consistent, "
            "with minor formatting anomalies in extracted text."
        ),
        issues=[],
        recommendations=[],
    )

def test_ats_analyzer_success():
    document = build_resume_document()
    analysis = build_resume_analysis()
    evaluation = build_gemini_evaluation()

    with patch(
        "app.ai.analyzers.intelligence.ats_analyzer.generate_content",
        return_value=evaluation.model_dump_json(),
    ):
        result = analyze_resume_ats(
            resume_document=document,
            resume_analysis=analysis,
        )

    assert result["overall_score"] >= 0
    assert result["overall_score"] <= 100

    assert result["document_health"]["page_count"] == 1

    assert result["layout_assessment"]["table_count"] == 0

    assert (
        result["job_alignment"]["available"]
        is False
    )


def test_ats_analyzer_rejects_invalid_document():
    with pytest.raises(ValueError):
        analyze_resume_ats(
            resume_document=None,
            resume_analysis={
                "skills": ["Python"],
            },
        )


def test_ats_analyzer_rejects_invalid_resume_analysis():
    document = build_resume_document()

    with pytest.raises(ValueError):
        analyze_resume_ats(
            resume_document=document,
            resume_analysis=None,
        )


def test_ats_analyzer_rejects_empty_resume_analysis():
    document = build_resume_document()

    with pytest.raises(ValueError):
        analyze_resume_ats(
            resume_document=document,
            resume_analysis={},
        )


def test_invalid_gemini_response_is_rejected():
    document = build_resume_document()
    analysis = build_resume_analysis()

    with patch(
        "app.ai.analyzers.intelligence.ats_analyzer.generate_content",
        return_value='{"invalid": true}',
    ):
        with pytest.raises(ValueError):
            analyze_resume_ats(
                resume_document=document,
                resume_analysis=analysis,
            )


def test_gemini_failure_is_wrapped():
    document = build_resume_document()
    analysis = build_resume_analysis()

    with patch(
        "app.ai.analyzers.intelligence.ats_analyzer.generate_content",
        side_effect=RuntimeError(
            "Gemini unavailable"
        ),
    ):
        with pytest.raises(RuntimeError):
            analyze_resume_ats(
                resume_document=document,
                resume_analysis=analysis,
            )


def test_job_alignment_is_unavailable_without_job_description():
    document = build_resume_document()
    analysis = build_resume_analysis()
    evaluation = build_gemini_evaluation()

    with patch(
        "app.ai.analyzers.intelligence.ats_analyzer.generate_content",
        return_value=evaluation.model_dump_json(),
    ):
        result = analyze_resume_ats(
            resume_document=document,
            resume_analysis=analysis,
        )

    alignment = result["job_alignment"]

    assert alignment["available"] is False
    assert alignment["score"] is None
    assert alignment["matched_requirements"] == []
    assert alignment["missing_requirements"] == []