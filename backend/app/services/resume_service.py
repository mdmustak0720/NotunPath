"""
Resume Service

Handles resume storage and PDF document extraction.

Provides:
- PDF file storage
- Structured PDF extraction
- Layout-aware document signals
- Plain-text extraction for resume analysis
"""

from __future__ import annotations

import shutil
from pathlib import Path
from uuid import uuid4

import pymupdf
import pymupdf4llm
from fastapi import UploadFile

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


UPLOAD_FOLDER = Path("app/uploads")
ALLOWED_EXTENSION = ".pdf"


def save_resume(
    file: UploadFile,
) -> str:
    """
    Save an uploaded resume PDF and return its file path.
    """

    UPLOAD_FOLDER.mkdir(
        parents=True,
        exist_ok=True,
    )

    original_filename = Path(
        file.filename or "resume.pdf"
    ).name

    extension = Path(
        original_filename
    ).suffix.lower()

    if extension != ALLOWED_EXTENSION:
        extension = ALLOWED_EXTENSION

    file_path = (
        UPLOAD_FOLDER
        / f"{uuid4().hex}{extension}"
    )

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer,
            )
    except Exception:
        if file_path.exists():
            file_path.unlink()

        raise

    return str(file_path)


def extract_resume_document(
    file_path: str,
) -> ResumeDocument:
    """
    Extract a structured and layout-aware resume document.

    Preserves:
    - Page boundaries
    - Text
    - Text positions
    - Font metadata
    - Images
    - Tables
    - Links
    - Vector drawings
    - Layout signals
    - Extraction warnings
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Resume file not found: {file_path}"
        )

    if not path.is_file():
        raise ValueError(
            f"Resume path is not a file: {file_path}"
        )

    if path.suffix.lower() != ALLOWED_EXTENSION:
        raise ValueError(
            "Only PDF resumes are supported."
        )

    document = None

    try:
        document = pymupdf.open(file_path)

        if document.is_encrypted:
            raise ValueError(
                "Encrypted PDF resumes are not supported."
            )

        pages: list[ResumePage] = []
        page_text_parts: list[str] = []

        total_text_blocks = 0
        total_images = 0
        total_drawings = 0
        total_tables = 0
        total_links = 0

        fonts: set[str] = set()

        pages_with_text = 0
        pages_without_text = 0
        image_only_pages: list[int] = []

        for page_index in range(
            document.page_count
        ):
            page = document[page_index]
            page_number = page_index + 1

            page_text = page.get_text(
                "text",
                sort=True,
            ).strip()

            if page_text:
                pages_with_text += 1
                page_text_parts.append(page_text)
            else:
                pages_without_text += 1

            page_dict = page.get_text(
                "dict",
                sort=True,
            )

            blocks = _extract_blocks(
                page_dict
            )

            text_block_count = sum(
                1
                for block in blocks
                if block.type == 0
            )

            image_count = sum(
                1
                for block in blocks
                if block.type == 1
            )

            drawing_count = len(
                page.get_drawings()
            )

            table_count = _count_tables(
                page
            )

            link_count = len(
                page.get_links()
            )

            for block in blocks:
                for line in block.lines:
                    for span in line.spans:
                        if span.font:
                            fonts.add(
                                span.font
                            )

            if (
                not page_text
                and image_count > 0
            ):
                image_only_pages.append(
                    page_number
                )

            total_text_blocks += (
                text_block_count
            )
            total_images += image_count
            total_drawings += drawing_count
            total_tables += table_count
            total_links += link_count

            pages.append(
                ResumePage(
                    page_number=page_number,
                    width=float(
                        page.rect.width
                    ),
                    height=float(
                        page.rect.height
                    ),
                    rotation=int(
                        page.rotation
                    ),
                    text=page_text,
                    text_block_count=(
                        text_block_count
                    ),
                    image_count=image_count,
                    drawing_count=drawing_count,
                    table_count=table_count,
                    link_count=link_count,
                    text_blocks=blocks,
                )
            )

        extracted_text = "\n".join(
            page_text_parts
        ).strip()

        layout = _extract_layout_signals(
            document
        )

        extraction_warnings = (
            _build_extraction_warnings(
                extracted_text=extracted_text,
                page_count=document.page_count,
                image_only_pages=image_only_pages,
                layout=layout,
            )
        )

        signals = DocumentSignals(
            page_count=document.page_count,
            extracted_character_count=len(
                extracted_text
            ),
            text_block_count=total_text_blocks,
            image_count=total_images,
            drawing_count=total_drawings,
            table_count=total_tables,
            link_count=total_links,
            font_count=len(fonts),
            pages_with_text=pages_with_text,
            pages_without_text=(
                pages_without_text
            ),
            image_only_pages=image_only_pages,
            extraction_warnings=(
                extraction_warnings
            ),
            layout=layout,
        )

        return ResumeDocument(
            file_name=path.name,
            file_path=str(path),
            file_size_bytes=path.stat().st_size,
            file_type="application/pdf",
            page_count=document.page_count,
            text=extracted_text,
            pages=pages,
            signals=signals,
        )

    finally:
        if document is not None:
            document.close()


def extract_resume_text(
    file_path: str,
) -> str:
    """
    Return plain text for the existing resume-analysis pipeline.
    """

    document = extract_resume_document(
        file_path
    )

    return document.text


def _extract_blocks(
    page_dict: dict,
) -> list[DocumentBlock]:
    """
    Convert PyMuPDF page blocks into application models.
    """

    blocks: list[DocumentBlock] = []

    for raw_block in page_dict.get(
        "blocks",
        [],
    ):
        raw_bbox = raw_block.get(
            "bbox"
        )

        if not raw_bbox:
            continue

        block_type = int(
            raw_block.get(
                "type",
                0,
            )
        )

        block_bbox = _build_bbox(
            raw_bbox
        )

        if block_type == 1:
            blocks.append(
                DocumentBlock(
                    type=1,
                    bbox=block_bbox,
                )
            )

            continue

        if block_type != 0:
            continue

        lines: list[TextLine] = []

        for raw_line in raw_block.get(
            "lines",
            [],
        ):
            raw_line_bbox = raw_line.get(
                "bbox"
            )

            if not raw_line_bbox:
                continue

            spans: list[TextSpan] = []

            for raw_span in raw_line.get(
                "spans",
                [],
            ):
                raw_span_bbox = raw_span.get(
                    "bbox"
                )

                if not raw_span_bbox:
                    continue

                font = raw_span.get(
                    "font"
                )

                size = raw_span.get(
                    "size"
                )

                flags = raw_span.get(
                    "flags"
                )

                spans.append(
                    TextSpan(
                        text=str(
                            raw_span.get(
                                "text",
                                "",
                            )
                        ),
                        bbox=_build_bbox(
                            raw_span_bbox
                        ),
                        font=(
                            str(font)
                            if font
                            else None
                        ),
                        size=(
                            float(size)
                            if size is not None
                            else None
                        ),
                        flags=(
                            int(flags)
                            if flags is not None
                            else None
                        ),
                    )
                )

            lines.append(
                TextLine(
                    bbox=_build_bbox(
                        raw_line_bbox
                    ),
                    spans=spans,
                )
            )

        blocks.append(
            DocumentBlock(
                type=0,
                bbox=block_bbox,
                lines=lines,
            )
        )

    return blocks


def _extract_layout_signals(
    document: pymupdf.Document,
) -> LayoutSignals:
    """
    Extract semantic layout information using PyMuPDF4LLM.
    """

    chunks = pymupdf4llm.to_markdown(
        document,
        page_chunks=True,
    )

    box_class_counts: dict[str, int] = {}
    multi_column_pages: list[int] = []

    for page_index, chunk in enumerate(
        chunks
    ):
        page_boxes = chunk.get(
            "page_boxes",
            [],
        )

        for box in page_boxes:
            class_name = box.get(
                "class"
            )

            if not class_name:
                continue

            class_name = str(
                class_name
            )

            box_class_counts[
                class_name
            ] = (
                box_class_counts.get(
                    class_name,
                    0,
                )
                + 1
            )

        if _has_multi_column_evidence(
            page_boxes
        ):
            multi_column_pages.append(
                page_index + 1
            )

    return LayoutSignals(
        box_class_counts=box_class_counts,
        title_count=box_class_counts.get(
            "title",
            0,
        ),
        section_header_count=box_class_counts.get(
            "section-header",
            0,
        ),
        table_count=box_class_counts.get(
            "table",
            0,
        ),
        picture_count=box_class_counts.get(
            "picture",
            0,
        ),
        page_header_count=box_class_counts.get(
            "page-header",
            0,
        ),
        page_footer_count=box_class_counts.get(
            "page-footer",
            0,
        ),
        list_item_count=box_class_counts.get(
            "list-item",
            0,
        ),
        likely_multi_column_pages=(
            multi_column_pages
        ),
    )


def _has_multi_column_evidence(
    page_boxes: list[dict],
) -> bool:
    """
    Detect substantial parallel text regions.

    This is intentionally conservative because normal
    resume layouts can contain text blocks at different
    horizontal positions without being true columns.
    """

    candidates: list[
        tuple[float, float, float, float]
    ] = []

    for box in page_boxes:
        class_name = box.get(
            "class"
        )

        bbox = box.get(
            "bbox"
        )

        if class_name not in {
            "text",
            "list-item",
        }:
            continue

        if not bbox or len(bbox) != 4:
            continue

        x0, y0, x1, y1 = map(
            float,
            bbox,
        )

        width = x1 - x0
        height = y1 - y0

        if width <= 0 or height <= 0:
            continue

        candidates.append(
            (
                x0,
                y0,
                x1,
                y1,
            )
        )

    if len(candidates) < 6:
        return False

    page_width = max(
        x1
        for _, _, x1, _ in candidates
    )

    if page_width <= 0:
        return False

    midpoint = page_width / 2

    left: list[
        tuple[float, float, float, float]
    ] = []

    right: list[
        tuple[float, float, float, float]
    ] = []

    for bbox in candidates:
        x0, y0, x1, y1 = bbox

        center_x = (
            x0 + x1
        ) / 2

        width_ratio = (
            (x1 - x0)
            / page_width
        )

        if width_ratio > 0.55:
            continue

        if center_x < midpoint * 0.85:
            left.append(bbox)

        elif center_x > midpoint * 1.15:
            right.append(bbox)

    if len(left) < 3 or len(right) < 3:
        return False

    overlapping_pairs = 0

    for left_box in left:
        for right_box in right:
            left_y0 = left_box[1]
            left_y1 = left_box[3]

            right_y0 = right_box[1]
            right_y1 = right_box[3]

            overlap_start = max(
                left_y0,
                right_y0,
            )

            overlap_end = min(
                left_y1,
                right_y1,
            )

            overlap_height = max(
                0.0,
                overlap_end - overlap_start,
            )

            left_height = (
                left_y1 - left_y0
            )

            right_height = (
                right_y1 - right_y0
            )

            minimum_height = min(
                left_height,
                right_height,
            )

            if minimum_height <= 0:
                continue

            overlap_ratio = (
                overlap_height
                / minimum_height
            )

            if overlap_ratio >= 0.35:
                overlapping_pairs += 1

    return overlapping_pairs >= 3


def _count_tables(
    page: pymupdf.Page,
) -> int:
    """
    Count tables detected by PyMuPDF.
    """

    try:
        return len(
            page.find_tables().tables
        )
    except Exception:
        return 0


def _build_bbox(
    value,
) -> BoundingBox:
    """
    Convert a PyMuPDF bounding box into the application model.
    """

    if value is None or len(value) != 4:
        raise ValueError(
            "Invalid PDF bounding box."
        )

    return BoundingBox(
        x0=float(value[0]),
        y0=float(value[1]),
        x1=float(value[2]),
        y1=float(value[3]),
    )


def _build_extraction_warnings(
    extracted_text: str,
    page_count: int,
    image_only_pages: list[int],
    layout: LayoutSignals,
) -> list[str]:
    """
    Create objective extraction warnings.
    """

    warnings: list[str] = []

    if not extracted_text:
        warnings.append(
            "no_extractable_text"
        )

    if image_only_pages:
        warnings.append(
            "image_only_page_detected"
        )

    if layout.table_count > 0:
        warnings.append(
            "table_layout_detected"
        )

    if layout.picture_count > 0:
        warnings.append(
            "picture_layout_detected"
        )

    if layout.likely_multi_column_pages:
        warnings.append(
            "multi_column_layout_detected"
        )

    if (
        page_count > 0
        and not extracted_text
    ):
        warnings.append(
            "possible_ocr_required"
        )

    return warnings