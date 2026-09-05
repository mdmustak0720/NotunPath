"""
ATS Analyzer

Evaluates resume compatibility with applicant tracking systems.

The analyzer combines:
- Objective document evidence
- Layout evidence
- Text integrity checks
- Terminology normalization
- Gemini contextual evaluation
- Application-controlled scoring

The final ATS score is calculated by the application.
"""

from __future__ import annotations

import re
from typing import Any

from app.ai.prompts.intelligence.ats_prompt import (
    build_ats_prompt,
)
from app.ai.providers.gemini_provider import (
    generate_content,
)
from app.ai.schemas.intelligence.ats_schema import (
    ATSDocumentHealth,
    ATSAnalysis,
    ATSIssue,
    ATSJobAlignment,
    ATSLayoutAssessment,
    ATSRecommendation,
    ATSScoreDimension,
    ATSTerminologyAssessment,
    ATSTextIntegrity,
    GeminiATSEvaluation,
)
from app.schemas.document_schema import (
    ResumeDocument,
)


ANALYSIS_VERSION = "2.1"

ATS_WEIGHTS: dict[str, int] = {
    "parsing_interpretability": 25,
    "structure_interpretability": 20,
    "text_integrity": 25,
    "terminology_consistency": 15,
    "layout_risk": 15,
}


def analyze_resume_ats(
    resume_document: ResumeDocument,
    resume_analysis: dict[str, Any],
) -> dict[str, Any]:
    """
    Analyze ATS compatibility for a resume.

    The final result is based on document evidence,
    deterministic analysis, and Gemini interpretation.
    """

    # Validate both inputs before running the analysis.
    _validate_inputs(
        resume_document=resume_document,
        resume_analysis=resume_analysis,
    )

    # Build objective evidence before asking Gemini for interpretation.
    deterministic = _build_deterministic_evidence(
        resume_document=resume_document,
        resume_analysis=resume_analysis,
    )

    prompt = build_ats_prompt(
        resume_analysis=resume_analysis,
        document_signals=deterministic[
            "prompt_signals"
        ],
    )

    # Gemini reviews the evidence but does not control the final score.
    try:
        response = generate_content(
            prompt,
            response_schema=GeminiATSEvaluation,
        )
    except Exception as error:
        raise RuntimeError(
            "ATS evaluation failed while calling "
            "the configured AI provider."
        ) from error

    try:
        gemini_evaluation = (
            GeminiATSEvaluation.model_validate_json(
                response
            )
        )
    except Exception as error:
        raise ValueError(
            "AI returned an invalid ATS evaluation: "
            f"{error}"
        ) from error

    # Deterministic evidence carries more authority for ATS-critical signals.
    parsing_score = _reconcile_scores(
        deterministic_score=deterministic[
            "parsing_interpretability"
        ],
        ai_score=gemini_evaluation.parsing_interpretability,
        deterministic_weight=0.75,
        ai_weight=0.25,
    )

    structure_score = _reconcile_scores(
        deterministic_score=deterministic[
            "structure_interpretability"
        ],
        ai_score=gemini_evaluation.structure_interpretability,
        deterministic_weight=0.70,
        ai_weight=0.30,
    )

    text_integrity_score = _reconcile_scores(
        deterministic_score=deterministic[
            "text_integrity"
        ],
        ai_score=gemini_evaluation.text_integrity,
        deterministic_weight=0.80,
        ai_weight=0.20,
    )

    terminology_score = _reconcile_scores(
        deterministic_score=deterministic[
            "terminology_consistency"
        ],
        ai_score=gemini_evaluation.terminology_consistency,
        deterministic_weight=0.70,
        ai_weight=0.30,
    )

    layout_risk_score = deterministic[
        "layout_risk"
    ]

    dimensions = {
        "parsing_interpretability": ATSScoreDimension(
            score=parsing_score,
            weight=ATS_WEIGHTS[
                "parsing_interpretability"
            ],
            rationale=(
                gemini_evaluation
                .parsing_interpretability_rationale
            ),
        ),
        "structure_interpretability": ATSScoreDimension(
            score=structure_score,
            weight=ATS_WEIGHTS[
                "structure_interpretability"
            ],
            rationale=(
                gemini_evaluation
                .structure_interpretability_rationale
            ),
        ),
        "text_integrity": ATSScoreDimension(
            score=text_integrity_score,
            weight=ATS_WEIGHTS[
                "text_integrity"
            ],
            rationale=(
                gemini_evaluation
                .text_integrity_rationale
            ),
        ),
        "terminology_consistency": ATSScoreDimension(
            score=terminology_score,
            weight=ATS_WEIGHTS[
                "terminology_consistency"
            ],
            rationale=(
                gemini_evaluation
                .terminology_consistency_rationale
            ),
        ),
        "layout_risk": ATSScoreDimension(
            score=layout_risk_score,
            weight=ATS_WEIGHTS[
                "layout_risk"
            ],
            rationale=(
                deterministic[
                    "layout_risk_rationale"
                ]
            ),
        ),
    }

    # Calculate the final score only after all dimensions are validated.
    overall_score = _calculate_weighted_score(
        dimensions
    )

    confidence = _calculate_confidence(
        resume_document=resume_document,
        deterministic=deterministic,
        gemini_evaluation=gemini_evaluation,
    )

    issues = _build_issues(
        deterministic=deterministic,
        gemini_evaluation=gemini_evaluation,
    )

    recommendations = _build_recommendations(
        gemini_evaluation=gemini_evaluation,
        deterministic=deterministic,
    )

    document_health = ATSDocumentHealth(
        file_type=resume_document.file_type,
        file_size_bytes=(
            resume_document.file_size_bytes
        ),
        page_count=resume_document.page_count,
        extracted_character_count=(
            resume_document
            .signals
            .extracted_character_count
        ),
        pages_with_text=(
            resume_document
            .signals
            .pages_with_text
        ),
        pages_without_text=(
            resume_document
            .signals
            .pages_without_text
        ),
        image_only_pages=(
            resume_document
            .signals
            .image_only_pages
        ),
        extraction_warnings=(
            resume_document
            .signals
            .extraction_warnings
        ),
    )

    layout = resume_document.signals.layout

    layout_assessment = ATSLayoutAssessment(
        text_block_count=(
            resume_document
            .signals
            .text_block_count
        ),
        image_count=(
            resume_document
            .signals
            .image_count
        ),
        drawing_count=(
            resume_document
            .signals
            .drawing_count
        ),
        table_count=(
            resume_document
            .signals
            .table_count
        ),
        link_count=(
            resume_document
            .signals
            .link_count
        ),
        font_count=(
            resume_document
            .signals
            .font_count
        ),
        section_header_count=(
            layout.section_header_count
        ),
        list_item_count=(
            layout.list_item_count
        ),
        picture_count=(
            layout.picture_count
        ),
        page_header_count=(
            layout.page_header_count
        ),
        page_footer_count=(
            layout.page_footer_count
        ),
        likely_multi_column_pages=(
            layout.likely_multi_column_pages
        ),
    )

    text_integrity = ATSTextIntegrity(
        suspicious_concatenations=(
            deterministic[
                "suspicious_concatenations"
            ]
        ),
        suspicious_tokens=(
            deterministic[
                "suspicious_tokens"
            ]
        ),
        suspicious_characters=(
            deterministic[
                "suspicious_characters"
            ]
        ),
        score=text_integrity_score,
    )

    terminology = ATSTerminologyAssessment(
        score=terminology_score,
        normalized_terms=(
            deterministic[
                "normalized_terms"
            ]
        ),
        inconsistencies=(
            deterministic[
                "terminology_inconsistencies"
            ]
        ),
    )

    # Job matching remains a separate capability.
    result = ATSAnalysis(
        analysis_version=ANALYSIS_VERSION,
        overall_score=overall_score,
        score_label=_get_score_label(
            overall_score
        ),
        confidence=confidence,
        document_health=document_health,
        layout_assessment=layout_assessment,
        parsing_interpretability=(
            dimensions[
                "parsing_interpretability"
            ]
        ),
        structure_interpretability=(
            dimensions[
                "structure_interpretability"
            ]
        ),
        text_integrity=(
            dimensions[
                "text_integrity"
            ]
        ),
        terminology_consistency=(
            dimensions[
                "terminology_consistency"
            ]
        ),
        layout_risk=(
            dimensions[
                "layout_risk"
            ]
        ),
        text_integrity_details=text_integrity,
        terminology=terminology,
        issues=issues,
        recommendations=recommendations,
        job_alignment=ATSJobAlignment(
            available=False,
            score=None,
            matched_requirements=[],
            missing_requirements=[],
            evidence=[],
        ),
    )

    return result.model_dump(
        exclude_none=False
    )


def _validate_inputs(
    resume_document: ResumeDocument,
    resume_analysis: dict[str, Any],
) -> None:
    """Validate analyzer inputs."""

    if not isinstance(
        resume_document,
        ResumeDocument,
    ):
        raise ValueError(
            "resume_document must be a ResumeDocument."
        )

    if not isinstance(
        resume_analysis,
        dict,
    ):
        raise ValueError(
            "resume_analysis must be a dictionary."
        )

    if not resume_analysis:
        raise ValueError(
            "resume_analysis cannot be empty."
        )


def _build_deterministic_evidence(
    resume_document: ResumeDocument,
    resume_analysis: dict[str, Any],
) -> dict[str, Any]:
    """Build objective ATS evidence."""

    parsing_interpretability = (
        _calculate_parsing_interpretability(
            resume_document
        )
    )

    structure_interpretability = (
        _calculate_structure_interpretability(
            resume_document=resume_document,
            resume_analysis=resume_analysis,
        )
    )

    text_integrity_data = (
        _analyze_text_integrity(
            resume_document.text
        )
    )

    terminology_inconsistencies = (
        _detect_terminology_inconsistencies(
            resume_text=resume_document.text,
            resume_analysis=resume_analysis,
        )
    )

    normalized_terms = _collect_normalized_terms(
        resume_analysis
    )

    terminology_consistency = (
        _calculate_terminology_consistency(
            normalized_terms=normalized_terms,
            inconsistencies=(
                terminology_inconsistencies
            ),
        )
    )

    layout_risk = _calculate_layout_risk(
        resume_document
    )

    prompt_signals = (
        _build_prompt_signals(
            resume_document=resume_document,
            text_integrity_data=text_integrity_data,
            terminology_inconsistencies=(
                terminology_inconsistencies
            ),
            normalized_terms=normalized_terms,
        )
    )

    return {
        "parsing_interpretability": (
            parsing_interpretability
        ),
        "structure_interpretability": (
            structure_interpretability
        ),
        "text_integrity": (
            text_integrity_data["score"]
        ),
        "terminology_consistency": (
            terminology_consistency
        ),
        "layout_risk": layout_risk,
        "layout_risk_rationale": (
            _build_layout_risk_rationale(
                resume_document
            )
        ),
        "suspicious_concatenations": (
            text_integrity_data[
                "suspicious_concatenations"
            ]
        ),
        "suspicious_tokens": (
            text_integrity_data[
                "suspicious_tokens"
            ]
        ),
        "suspicious_characters": (
            text_integrity_data[
                "suspicious_characters"
            ]
        ),
        "normalized_terms": normalized_terms,
        "terminology_inconsistencies": (
            terminology_inconsistencies
        ),
        "prompt_signals": prompt_signals,
    }


def _calculate_parsing_interpretability(
    document: ResumeDocument,
) -> int:
    """
    Estimate parsing interpretability from observable
    document evidence.

    Native extraction success alone does not imply
    perfect ATS compatibility.
    """

    signals = document.signals

    if document.page_count <= 0:
        return 0

    if signals.extracted_character_count == 0:
        return 5

    score = 88

    if signals.pages_with_text == signals.page_count:
        score += 4

    if signals.pages_without_text:
        score -= min(
            20,
            signals.pages_without_text * 8,
        )

    if signals.image_only_pages:
        score -= min(
            30,
            len(
                signals.image_only_pages
            ) * 20,
        )

    if signals.table_count:
        score -= min(
            12,
            signals.table_count * 4,
        )

    if signals.layout.picture_count:
        score -= min(
            10,
            signals.layout.picture_count * 4,
        )

    if signals.layout.page_header_count:
        score -= min(
            6,
            signals.layout.page_header_count * 2,
        )

    if signals.layout.page_footer_count:
        score -= min(
            6,
            signals.layout.page_footer_count * 2,
        )

    if signals.layout.likely_multi_column_pages:
        score -= min(
            15,
            len(
                signals.layout
                .likely_multi_column_pages
            ) * 8,
        )

    if signals.extraction_warnings:
        score -= min(
            12,
            len(
                signals.extraction_warnings
            ) * 4,
        )

    return _clamp_score(score)


def _calculate_structure_interpretability(
    resume_document: ResumeDocument,
    resume_analysis: dict[str, Any],
) -> int:
    """
    Evaluate structural clarity without treating the mere
    presence of sections as proof of ATS compatibility.
    """

    layout = resume_document.signals.layout

    score = 72

    if layout.section_header_count >= 3:
        score += 8

    if layout.section_header_count >= 5:
        score += 4

    if layout.section_header_count >= 8:
        score += 2

    if layout.likely_multi_column_pages:
        score -= min(
            10,
            len(
                layout.likely_multi_column_pages
            ) * 5,
        )

    if layout.table_count:
        score -= min(
            8,
            layout.table_count * 2,
        )

    if layout.page_header_count:
        score -= 4

    if layout.page_footer_count:
        score -= 4

    populated_core_sections = sum(
        1
        for field in (
            "professional_summary",
            "skills",
            "projects",
            "education",
        )
        if _is_populated(
            resume_analysis.get(field)
        )
    )

    if populated_core_sections >= 4:
        score += 6

    elif populated_core_sections == 3:
        score += 3

    elif populated_core_sections <= 1:
        score -= 8

    return _clamp_score(score)


def _analyze_text_integrity(
    resume_text: str,
) -> dict[str, Any]:
    """
    Detect common text-extraction integrity problems.

    Known CamelCase technology names are not treated as
    merged words because many legitimate technologies use
    internal capitalization.
    """

    if not isinstance(
        resume_text,
        str,
    ):
        return {
            "score": 0,
            "suspicious_concatenations": [],
            "suspicious_tokens": [],
            "suspicious_characters": [],
        }

    suspicious_concatenations: list[str] = []
    suspicious_tokens: list[str] = []
    suspicious_characters: list[str] = []

    if re.search(
        r"\)\s*[A-Z][a-zA-Z]{2,}",
        resume_text,
    ):
        suspicious_concatenations.append(
            "Possible concatenation immediately after a closing parenthesis."
        )

    if re.search(
        r"[A-Za-z0-9+#.-],[A-Za-z]",
        resume_text,
    ):
        suspicious_concatenations.append(
            "Possible token concatenation around punctuation."
        )

    merged_token_pattern = re.compile(
        r"\b[a-z]{3,}[A-Z][a-z]{2,}\b"
    )

    known_compound_terms = {
        "javascript",
        "typescript",
        "mongodb",
        "streamlit",
        "fastapi",
        "github",
        "cloudinary",
        "joblib",
        "scikitlearn",
    }

    for match in merged_token_pattern.finditer(
        resume_text
    ):
        token = match.group(0)

        if token.lower() not in known_compound_terms:
            suspicious_tokens.append(
                f"Possible merged token: {token}"
            )

    for character in resume_text:
        if (
            ord(character) < 32
            and character not in "\n\t\r"
        ):
            suspicious_characters.append(
                f"Control character U+{ord(character):04X}"
            )

    suspicious_characters = list(
        dict.fromkeys(
            suspicious_characters
        )
    )

    score = 96

    score -= min(
        20,
        len(
            suspicious_concatenations
        ) * 7,
    )

    score -= min(
        15,
        len(
            suspicious_tokens
        ) * 5,
    )

    score -= min(
        15,
        len(
            suspicious_characters
        ) * 5,
    )

    return {
        "score": _clamp_score(score),
        "suspicious_concatenations": (
            suspicious_concatenations
        ),
        "suspicious_tokens": (
            suspicious_tokens
        ),
        "suspicious_characters": (
            suspicious_characters
        ),
    }


def _calculate_terminology_consistency(
    normalized_terms: list[str],
    inconsistencies: list[str],
) -> int:
    """Calculate terminology consistency."""

    if not normalized_terms:
        return 65

    score = 92

    score -= min(
        16,
        len(inconsistencies) * 8,
    )

    return _clamp_score(score)


def _calculate_layout_risk(
    document: ResumeDocument,
) -> int:
    """
    Produce a layout safety score.

    Higher is safer.

    Drawing count is intentionally not penalized by itself.
    """

    signals = document.signals
    layout = signals.layout

    score = 94

    if signals.image_only_pages:
        score -= min(
            30,
            len(
                signals.image_only_pages
            ) * 20,
        )

    if signals.table_count:
        score -= min(
            15,
            signals.table_count * 5,
        )

    if layout.picture_count:
        score -= min(
            10,
            layout.picture_count * 5,
        )

    if layout.page_header_count:
        score -= min(
            8,
            layout.page_header_count * 2,
        )

    if layout.page_footer_count:
        score -= min(
            8,
            layout.page_footer_count * 2,
        )

    if layout.likely_multi_column_pages:
        score -= min(
            15,
            len(
                layout.likely_multi_column_pages
            ) * 8,
        )

    return _clamp_score(score)


def _collect_normalized_terms(
    resume_analysis: dict[str, Any],
) -> list[str]:
    """Collect unique normalized skills and technologies."""

    terms: list[str] = []

    for skill in _safe_list(
        resume_analysis.get("skills")
    ):
        if isinstance(
            skill,
            str,
        ):
            normalized = _normalize_term(
                skill
            )

            if normalized:
                terms.append(
                    normalized
                )

    for project in _safe_list(
        resume_analysis.get("projects")
    ):
        if not isinstance(
            project,
            dict,
        ):
            continue

        for technology in _safe_list(
            project.get("technologies")
        ):
            if isinstance(
                technology,
                str,
            ):
                normalized = _normalize_term(
                    technology
                )

                if normalized:
                    terms.append(
                        normalized
                    )

    return list(
        dict.fromkeys(
            terms
        )
    )


def _detect_terminology_inconsistencies(
    resume_text: str,
    resume_analysis: dict[str, Any],
) -> list[str]:
    """
    Detect actual terminology inconsistencies.

    Text extraction anomalies such as punctuation
    concatenation are handled by the text-integrity layer.
    """

    if not isinstance(
        resume_text,
        str,
    ):
        return []

    skills = [
        skill
        for skill in _safe_list(
            resume_analysis.get("skills")
        )
        if isinstance(
            skill,
            str,
        )
    ]

    normalized_skills = [
        _normalize_term(
            skill
        )
        for skill in skills
    ]

    normalized_skills = [
        skill
        for skill in normalized_skills
        if skill
    ]

    inconsistencies: list[str] = []

    if len(normalized_skills) != len(
        set(normalized_skills)
    ):
        inconsistencies.append(
            "Multiple skill representations normalize to the same terminology."
        )

    return list(
        dict.fromkeys(
            inconsistencies
        )
    )


def _normalize_term(
    value: str,
) -> str:
    """Normalize common technology naming variants."""

    normalized = value.strip().lower()

    aliases = {
        "reactjs": "react.js",
        "react js": "react.js",
        "nodejs": "node.js",
        "node js": "node.js",
        "nextjs": "next.js",
        "next js": "next.js",
        "mongo db": "mongodb",
        "postgres": "postgresql",
        "postgres db": "postgresql",
        "ml": "machine learning",
        "js": "javascript",
    }

    return aliases.get(
        normalized,
        normalized,
    )


def _build_prompt_signals(
    resume_document: ResumeDocument,
    text_integrity_data: dict[str, Any],
    terminology_inconsistencies: list[str],
    normalized_terms: list[str],
) -> dict[str, Any]:
    """Build a compact evidence package for Gemini."""

    signals = resume_document.signals
    layout = signals.layout

    return {
        "document": {
            "file_type": resume_document.file_type,
            "file_size_bytes": (
                resume_document.file_size_bytes
            ),
            "page_count": resume_document.page_count,
        },
        "document_signals": {
            "extracted_character_count": (
                signals.extracted_character_count
            ),
            "text_block_count": (
                signals.text_block_count
            ),
            "image_count": signals.image_count,
            "drawing_count": signals.drawing_count,
            "table_count": signals.table_count,
            "link_count": signals.link_count,
            "font_count": signals.font_count,
            "pages_with_text": (
                signals.pages_with_text
            ),
            "pages_without_text": (
                signals.pages_without_text
            ),
            "image_only_pages": (
                signals.image_only_pages
            ),
            "extraction_warnings": (
                signals.extraction_warnings
            ),
        },
        "layout": {
            "box_class_counts": (
                layout.box_class_counts
            ),
            "section_header_count": (
                layout.section_header_count
            ),
            "list_item_count": (
                layout.list_item_count
            ),
            "picture_count": (
                layout.picture_count
            ),
            "table_count": (
                layout.table_count
            ),
            "page_header_count": (
                layout.page_header_count
            ),
            "page_footer_count": (
                layout.page_footer_count
            ),
            "likely_multi_column_pages": (
                layout.likely_multi_column_pages
            ),
        },
        "text_integrity": {
            "suspicious_concatenations": (
                text_integrity_data[
                    "suspicious_concatenations"
                ]
            ),
            "suspicious_tokens": (
                text_integrity_data[
                    "suspicious_tokens"
                ]
            ),
            "suspicious_characters": (
                text_integrity_data[
                    "suspicious_characters"
                ]
            ),
        },
        "terminology": {
            "normalized_terms": normalized_terms,
            "inconsistencies": (
                terminology_inconsistencies
            ),
        },
    }


def _build_layout_risk_rationale(
    document: ResumeDocument,
) -> str:
    """Build an evidence-based layout rationale."""

    signals = document.signals
    layout = signals.layout

    risk_factors: list[str] = []

    if signals.table_count:
        risk_factors.append(
            f"{signals.table_count} table(s)"
        )

    if signals.image_only_pages:
        risk_factors.append(
            "image-only page(s)"
        )

    if layout.picture_count:
        risk_factors.append(
            f"{layout.picture_count} picture region(s)"
        )

    if layout.page_header_count:
        risk_factors.append(
            f"{layout.page_header_count} page header(s)"
        )

    if layout.page_footer_count:
        risk_factors.append(
            f"{layout.page_footer_count} page footer(s)"
        )

    if layout.likely_multi_column_pages:
        risk_factors.append(
            "multi-column layout evidence"
        )

    if not risk_factors:
        return (
            "No material layout-risk signals were "
            "detected by the document analysis."
        )

    return (
        "Observed layout-risk signals: "
        + ", ".join(
            risk_factors
        )
        + "."
    )


def _build_issues(
    deterministic: dict[str, Any],
    gemini_evaluation: GeminiATSEvaluation,
) -> list[ATSIssue]:
    """Combine deterministic and AI-supported issues."""

    issues: list[ATSIssue] = []

    for item in (
        deterministic[
            "suspicious_concatenations"
        ]
    ):
        issues.append(
            ATSIssue(
                category="text_integrity",
                title="Possible text concatenation",
                description=item,
                severity="low",
                source="text",
            )
        )

    for item in (
        deterministic[
            "suspicious_tokens"
        ]
    ):
        issues.append(
            ATSIssue(
                category="text_integrity",
                title="Possible merged text token",
                description=item,
                severity="low",
                source="text",
            )
        )

    for item in (
        deterministic[
            "suspicious_characters"
        ]
    ):
        issues.append(
            ATSIssue(
                category="text_integrity",
                title="Unexpected control character",
                description=item,
                severity="medium",
                source="text",
            )
        )

    for warning in (
        deterministic[
            "prompt_signals"
        ]["document_signals"].get(
            "extraction_warnings",
            [],
        )
    ):
        issue = _warning_to_issue(
            warning
        )

        if issue is not None:
            issues.append(issue)

    for item in gemini_evaluation.issues:
        issues.append(
            ATSIssue(
                category=item.category,
                title=item.title,
                description=item.description,
                severity=item.severity,
                source="ai",
            )
        )

    return _deduplicate_issues(
        issues
    )


def _build_recommendations(
    gemini_evaluation: GeminiATSEvaluation,
    deterministic: dict[str, Any],
) -> list[ATSRecommendation]:
    """Build recommendations without repeating the same action."""

    recommendations: list[
        ATSRecommendation
    ] = []

    for item in gemini_evaluation.recommendations:
        recommendations.append(
            ATSRecommendation(
                category=item.category,
                title=item.title,
                description=item.description,
                priority=item.priority,
            )
        )

    has_spacing_recommendation = any(
        _is_text_integrity_recommendation(
            recommendation
        )
        for recommendation in recommendations
    )

    has_text_integrity_issue = bool(
        deterministic[
            "suspicious_concatenations"
        ]
        or deterministic[
            "suspicious_tokens"
        ]
        or deterministic[
            "suspicious_characters"
        ]
    )

    if (
        has_text_integrity_issue
        and not has_spacing_recommendation
    ):
        recommendations.append(
            ATSRecommendation(
                category="text_integrity",
                title="Correct extracted text spacing",
                description=(
                    "Review punctuation and spacing in the "
                    "source document so adjacent terms remain "
                    "separately readable during parsing."
                ),
                priority=2,
            )
        )

    return _deduplicate_recommendations(
        recommendations
    )


def _is_text_integrity_recommendation(
    recommendation: ATSRecommendation,
) -> bool:
    """Identify recommendations covering text-spacing problems."""

    category = (
        recommendation.category
        .strip()
        .lower()
    )

    title = (
        recommendation.title
        .strip()
        .lower()
    )

    description = (
        recommendation.description
        .strip()
        .lower()
    )

    text_categories = {
        "text integrity",
        "text_integrity",
        "formatting",
        "document formatting",
    }

    return (
        category in text_categories
        or "spacing" in title
        or "punctuation" in title
        or "concatenat" in title
        or "spacing" in description
        or "concatenat" in description
    )


def _warning_to_issue(
    warning: str,
) -> ATSIssue | None:
    """Convert a document warning into an ATS issue."""

    mapping = {
        "no_extractable_text": (
            "document",
            "No extractable text",
            "The document produced no readable text through the current extraction pipeline.",
            "high",
            "document",
        ),
        "image_only_page_detected": (
            "parsing",
            "Image-only page detected",
            "At least one page does not provide extractable text and may depend on an image representation.",
            "high",
            "document",
        ),
        "table_layout_detected": (
            "layout",
            "Table layout detected",
            "A table structure was detected and may require additional parser handling.",
            "low",
            "layout",
        ),
        "picture_layout_detected": (
            "layout",
            "Picture region detected",
            "A picture region was detected in the document.",
            "low",
            "layout",
        ),
        "multi_column_layout_detected": (
            "layout",
            "Multi-column layout detected",
            "The document contains spatial evidence consistent with multiple text columns.",
            "medium",
            "layout",
        ),
        "possible_ocr_required": (
            "parsing",
            "OCR may be required",
            "The current extraction pipeline could not obtain sufficient readable text.",
            "high",
            "document",
        ),
    }

    values = mapping.get(
        warning
    )

    if values is None:
        return None

    (
        category,
        title,
        description,
        severity,
        source,
    ) = values

    return ATSIssue(
        category=category,
        title=title,
        description=description,
        severity=severity,
        source=source,
    )


def _calculate_confidence(
    resume_document: ResumeDocument,
    deterministic: dict[str, Any],
    gemini_evaluation: GeminiATSEvaluation,
) -> str:
    """Estimate confidence in the ATS analysis."""

    signals = resume_document.signals

    if (
        signals.page_count == 0
        or signals.extracted_character_count == 0
    ):
        return "low"

    if signals.extraction_warnings:
        return "medium"

    if (
        deterministic[
            "suspicious_characters"
        ]
    ):
        return "medium"

    score_pairs = [
        (
            deterministic[
                "parsing_interpretability"
            ],
            gemini_evaluation.parsing_interpretability,
        ),
        (
            deterministic[
                "structure_interpretability"
            ],
            gemini_evaluation.structure_interpretability,
        ),
        (
            deterministic[
                "text_integrity"
            ],
            gemini_evaluation.text_integrity,
        ),
        (
            deterministic[
                "terminology_consistency"
            ],
            gemini_evaluation.terminology_consistency,
        ),
    ]

    disagreement = max(
        abs(
            deterministic_score
            - ai_score
        )
        for deterministic_score, ai_score
        in score_pairs
    )

    if disagreement >= 25:
        return "low"

    if disagreement >= 15:
        return "medium"

    return "high"


def _calculate_weighted_score(
    dimensions: dict[
        str,
        ATSScoreDimension,
    ],
) -> int:
    """Calculate the final weighted ATS score."""

    total = 0
    total_weight = 0

    for dimension in dimensions.values():
        total += (
            dimension.score
            * dimension.weight
        )

        total_weight += dimension.weight

    if total_weight == 0:
        return 0

    return _clamp_score(
        total / total_weight
    )


def _reconcile_scores(
    deterministic_score: int | float,
    ai_score: int | float,
    deterministic_weight: float,
    ai_weight: float,
) -> int:
    """Reconcile deterministic evidence with AI interpretation."""

    deterministic = _clamp_score(
        deterministic_score
    )

    ai = _clamp_score(
        ai_score
    )

    return _clamp_score(
        (
            deterministic
            * deterministic_weight
        )
        + (
            ai
            * ai_weight
        )
    )


def _deduplicate_issues(
    issues: list[ATSIssue],
) -> list[ATSIssue]:
    """Remove duplicate issues while preserving order."""

    result: list[ATSIssue] = []
    seen: set[str] = set()

    for issue in issues:
        key = (
            f"{issue.category}|"
            f"{issue.title}|"
            f"{issue.description}"
        ).strip().lower()

        if key in seen:
            continue

        seen.add(key)
        result.append(issue)

    return result


def _deduplicate_recommendations(
    recommendations: list[ATSRecommendation],
) -> list[ATSRecommendation]:
    """Remove duplicate recommendations while preserving order."""

    result: list[ATSRecommendation] = []
    seen: set[str] = set()

    for recommendation in recommendations:
        key = (
            f"{recommendation.category}|"
            f"{recommendation.title}|"
            f"{recommendation.description}"
        ).strip().lower()

        if key in seen:
            continue

        seen.add(key)
        result.append(recommendation)

    return result


def _safe_list(
    value: Any,
) -> list[Any]:
    """Return a value when it is already a list."""

    if isinstance(
        value,
        list,
    ):
        return value

    return []


def _is_populated(
    value: Any,
) -> bool:
    """Determine whether a structured field contains data."""

    if value is None:
        return False

    if isinstance(
        value,
        str,
    ):
        return bool(
            value.strip()
        )

    if isinstance(
        value,
        (
            list,
            tuple,
            set,
            dict,
        ),
    ):
        return bool(value)

    return True


def _clamp_score(
    score: int | float,
) -> int:
    """Clamp a score to the 0-100 range."""

    return max(
        0,
        min(
            100,
            int(
                round(
                    score
                )
            ),
        ),
    )


def _get_score_label(
    score: int,
) -> str:
    """Return a user-facing ATS compatibility label."""

    if score >= 90:
        return "Excellent"

    if score >= 80:
        return "Strong"

    if score >= 70:
        return "Good"

    if score >= 60:
        return "Needs Improvement"

    if score >= 40:
        return "Needs Work"

    return "High Risk"