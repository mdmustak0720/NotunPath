"""
ATS Analysis Schemas

Defines provider-facing and application-facing contracts
for ATS compatibility analysis.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class GeminiATSIssue(BaseModel):
    """Issue identified by the AI evaluation layer."""

    category: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)

    severity: Literal[
        "low",
        "medium",
        "high",
    ]


class GeminiATSRecommendation(BaseModel):
    """Recommendation returned by the AI evaluation layer."""

    category: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)

    priority: int = Field(
        ...,
        ge=1,
        le=5,
    )


class GeminiATSEvaluation(BaseModel):
    """
    Gemini-facing ATS evaluation.

    Gemini interprets evidence supplied by the document
    extraction layer. It does not calculate the final ATS score.
    """

    parsing_interpretability: int = Field(
        ...,
        ge=0,
        le=100,
    )

    parsing_interpretability_rationale: str = Field(
        ...,
        min_length=1,
    )

    structure_interpretability: int = Field(
        ...,
        ge=0,
        le=100,
    )

    structure_interpretability_rationale: str = Field(
        ...,
        min_length=1,
    )

    text_integrity: int = Field(
        ...,
        ge=0,
        le=100,
    )

    text_integrity_rationale: str = Field(
        ...,
        min_length=1,
    )

    terminology_consistency: int = Field(
        ...,
        ge=0,
        le=100,
    )

    terminology_consistency_rationale: str = Field(
        ...,
        min_length=1,
    )

    issues: list[GeminiATSIssue] = Field(
        default_factory=list,
    )

    recommendations: list[
        GeminiATSRecommendation
    ] = Field(
        default_factory=list,
    )


class ATSIssue(BaseModel):
    """Application-level validated ATS issue."""

    model_config = ConfigDict(
        extra="forbid",
    )

    category: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)

    severity: Literal[
        "low",
        "medium",
        "high",
    ]

    source: Literal[
        "document",
        "layout",
        "text",
        "terminology",
        "ai",
        "hybrid",
    ]


class ATSRecommendation(BaseModel):
    """Application-level ATS recommendation."""

    model_config = ConfigDict(
        extra="forbid",
    )

    category: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)

    priority: int = Field(
        ...,
        ge=1,
        le=5,
    )


class ATSScoreDimension(BaseModel):
    """One final ATS scoring dimension."""

    model_config = ConfigDict(
        extra="forbid",
    )

    score: int = Field(
        ...,
        ge=0,
        le=100,
    )

    weight: int = Field(
        ...,
        ge=0,
        le=100,
    )

    rationale: str = Field(
        ...,
        min_length=1,
    )


class ATSDocumentHealth(BaseModel):
    """Objective document health information."""

    model_config = ConfigDict(
        extra="forbid",
    )

    file_type: str = Field(
        ...,
        min_length=1,
    )

    file_size_bytes: int = Field(
        ...,
        ge=0,
    )

    page_count: int = Field(
        ...,
        ge=0,
    )

    extracted_character_count: int = Field(
        ...,
        ge=0,
    )

    pages_with_text: int = Field(
        ...,
        ge=0,
    )

    pages_without_text: int = Field(
        ...,
        ge=0,
    )

    image_only_pages: list[int] = Field(
        default_factory=list,
    )

    extraction_warnings: list[str] = Field(
        default_factory=list,
    )


class ATSLayoutAssessment(BaseModel):
    """Objective layout and document signals."""

    model_config = ConfigDict(
        extra="forbid",
    )

    text_block_count: int = Field(..., ge=0)
    image_count: int = Field(..., ge=0)
    drawing_count: int = Field(..., ge=0)
    table_count: int = Field(..., ge=0)
    link_count: int = Field(..., ge=0)
    font_count: int = Field(..., ge=0)

    section_header_count: int = Field(
        ...,
        ge=0,
    )

    list_item_count: int = Field(
        ...,
        ge=0,
    )

    picture_count: int = Field(
        ...,
        ge=0,
    )

    page_header_count: int = Field(
        ...,
        ge=0,
    )

    page_footer_count: int = Field(
        ...,
        ge=0,
    )

    likely_multi_column_pages: list[int] = Field(
        default_factory=list,
    )


class ATSTextIntegrity(BaseModel):
    """Evidence about text extraction integrity."""

    model_config = ConfigDict(
        extra="forbid",
    )

    suspicious_concatenations: list[str] = Field(
        default_factory=list,
    )

    suspicious_tokens: list[str] = Field(
        default_factory=list,
    )

    suspicious_characters: list[str] = Field(
        default_factory=list,
    )

    score: int = Field(
        ...,
        ge=0,
        le=100,
    )


class ATSTerminologyAssessment(BaseModel):
    """Normalized terminology information."""

    model_config = ConfigDict(
        extra="forbid",
    )

    score: int = Field(
        ...,
        ge=0,
        le=100,
    )

    normalized_terms: list[str] = Field(
        default_factory=list,
    )

    inconsistencies: list[str] = Field(
        default_factory=list,
    )


class ATSJobAlignment(BaseModel):
    """
    Job-specific alignment.

    This remains unavailable until a job description is supplied.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    available: bool

    score: int | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    matched_requirements: list[str] = Field(
        default_factory=list,
    )

    missing_requirements: list[str] = Field(
        default_factory=list,
    )

    evidence: list[str] = Field(
        default_factory=list,
    )


class ATSAnalysis(BaseModel):
    """Final application-level ATS compatibility result."""

    model_config = ConfigDict(
        extra="forbid",
    )

    analysis_version: str = Field(
        ...,
        min_length=1,
    )

    overall_score: int = Field(
        ...,
        ge=0,
        le=100,
    )

    score_label: str = Field(
        ...,
        min_length=1,
    )

    confidence: Literal[
        "low",
        "medium",
        "high",
    ]

    document_health: ATSDocumentHealth

    layout_assessment: ATSLayoutAssessment

    parsing_interpretability: ATSScoreDimension

    structure_interpretability: ATSScoreDimension

    text_integrity: ATSScoreDimension

    terminology_consistency: ATSScoreDimension

    layout_risk: ATSScoreDimension

    text_integrity_details: ATSTextIntegrity

    terminology: ATSTerminologyAssessment

    issues: list[ATSIssue] = Field(
        default_factory=list,
    )

    recommendations: list[
        ATSRecommendation
    ] = Field(
        default_factory=list,
    )

    job_alignment: ATSJobAlignment