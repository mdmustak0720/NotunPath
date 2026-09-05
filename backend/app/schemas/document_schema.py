"""
Resume Document Schema

Defines the canonical in-memory representation of a resume PDF.

Used by document extraction, ATS analysis, and document diagnostics.
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field
from typing import Literal

class BoundingBox(BaseModel):
    """Position and size of an element on a PDF page."""

    model_config = ConfigDict(extra="forbid")

    x0: float
    y0: float
    x1: float
    y1: float


class TextSpan(BaseModel):
    """Text with position and formatting metadata."""

    model_config = ConfigDict(extra="forbid")

    text: str
    bbox: BoundingBox
    font: str | None = None
    size: float | None = None
    flags: int | None = None


class TextLine(BaseModel):
    """A logical text line containing one or more spans."""

    model_config = ConfigDict(extra="forbid")

    bbox: BoundingBox
    spans: list[TextSpan] = Field(
        default_factory=list
    )


class DocumentBlock(BaseModel):
    """
    A page-level PDF content block.

    0 = text
    1 = image
    """

    model_config = ConfigDict(extra="forbid")

    type: Literal[0, 1]
    bbox: BoundingBox
    lines: list[TextLine] = Field(
        default_factory=list
    )


class LayoutSignals(BaseModel):
    """Layout information detected from the PDF."""

    model_config = ConfigDict(extra="forbid")

    box_class_counts: dict[str, int] = Field(
        default_factory=dict
    )

    title_count: int = Field(
        default=0,
        ge=0,
    )

    section_header_count: int = Field(
        default=0,
        ge=0,
    )

    table_count: int = Field(
        default=0,
        ge=0,
    )

    picture_count: int = Field(
        default=0,
        ge=0,
    )

    page_header_count: int = Field(
        default=0,
        ge=0,
    )

    page_footer_count: int = Field(
        default=0,
        ge=0,
    )

    list_item_count: int = Field(
        default=0,
        ge=0,
    )

    likely_multi_column_pages: list[int] = Field(
        default_factory=list
    )


class ResumePage(BaseModel):
    """Structured representation of one resume page."""

    model_config = ConfigDict(extra="forbid")

    page_number: int = Field(
        ...,
        ge=1,
    )

    width: float = Field(
        ...,
        gt=0,
    )

    height: float = Field(
        ...,
        gt=0,
    )

    rotation: int = 0

    text: str = ""

    text_block_count: int = Field(
        default=0,
        ge=0,
    )

    image_count: int = Field(
        default=0,
        ge=0,
    )

    drawing_count: int = Field(
        default=0,
        ge=0,
    )

    table_count: int = Field(
        default=0,
        ge=0,
    )

    link_count: int = Field(
        default=0,
        ge=0,
    )

    text_blocks: list[DocumentBlock] = Field(
        default_factory=list
    )


class DocumentSignals(BaseModel):
    """Objective document signals for ATS analysis."""

    model_config = ConfigDict(extra="forbid")

    page_count: int = Field(
        ...,
        ge=0,
    )

    extracted_character_count: int = Field(
        ...,
        ge=0,
    )

    text_block_count: int = Field(
        ...,
        ge=0,
    )

    image_count: int = Field(
        ...,
        ge=0,
    )

    drawing_count: int = Field(
        ...,
        ge=0,
    )

    table_count: int = Field(
        ...,
        ge=0,
    )

    link_count: int = Field(
        ...,
        ge=0,
    )

    font_count: int = Field(
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
        default_factory=list
    )

    layout: LayoutSignals


class ResumeDocument(BaseModel):
    """Canonical in-memory representation of a resume PDF."""

    model_config = ConfigDict(extra="forbid")

    file_name: str
    file_path: str

    file_size_bytes: int = Field(
        ...,
        ge=0,
    )

    file_type: str

    page_count: int = Field(
        ...,
        ge=0,
    )

    text: str = ""

    pages: list[ResumePage] = Field(
        default_factory=list
    )

    signals: DocumentSignals