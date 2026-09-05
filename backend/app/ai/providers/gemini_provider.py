"""
Gemini Provider

Purpose:
Provides a centralized interface for Google Gemini.

Responsibilities:
- Manage Gemini client configuration.
- Support multiple Pydantic response schemas.
- Request structured JSON output.
- Configure request timeout.
- Configure retry behavior.
- Keep provider details out of analyzers.
- Return raw structured JSON for downstream validation.
"""

from __future__ import annotations

import logging
import os
from typing import TypeVar

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel


# =========================================================
# Environment
# =========================================================

load_dotenv()


# =========================================================
# Logging
# =========================================================

logger = logging.getLogger(__name__)


# =========================================================
# Type Definition
# =========================================================

SchemaT = TypeVar(
    "SchemaT",
    bound=BaseModel,
)


# =========================================================
# Configuration
# =========================================================

GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY"
)

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured."
    )


MODEL_NAME = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.6-flash",
).strip()

if not MODEL_NAME:
    raise RuntimeError(
        "GEMINI_MODEL cannot be empty."
    )


GEMINI_TIMEOUT_MS = int(
    os.getenv(
        "GEMINI_TIMEOUT_MS",
        "120000",
    )
)


GEMINI_MAX_ATTEMPTS = int(
    os.getenv(
        "GEMINI_MAX_ATTEMPTS",
        "3",
    )
)


if GEMINI_TIMEOUT_MS <= 0:
    raise RuntimeError(
        "GEMINI_TIMEOUT_MS must be greater than 0."
    )


if GEMINI_MAX_ATTEMPTS < 1:
    raise RuntimeError(
        "GEMINI_MAX_ATTEMPTS must be at least 1."
    )


# =========================================================
# Gemini Client
# =========================================================

client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options=types.HttpOptions(
        timeout=GEMINI_TIMEOUT_MS,
        retry_options=types.HttpRetryOptions(
            attempts=GEMINI_MAX_ATTEMPTS,
            initial_delay=1.0,
            max_delay=8.0,
            exp_base=2.0,
            jitter=1.0,
            http_status_codes=[
                408,
                429,
                500,
                502,
                503,
                504,
            ],
        ),
    ),
)


# =========================================================
# Generate Structured Content
# =========================================================

def generate_content(
    prompt: str,
    response_schema: type[SchemaT] | None = None,
) -> str:
    """
    Generate structured content using Gemini.

    Args:
        prompt:
            Prompt sent to Gemini.

        response_schema:
            Pydantic model describing the expected
            structured response.

    Returns:
        Raw structured JSON response.

    Raises:
        ValueError:
            Invalid input or empty response.

        RuntimeError:
            Gemini request failure.
    """

    # -----------------------------------------------------
    # Step 1: Validate prompt
    # -----------------------------------------------------

    if not isinstance(
        prompt,
        str,
    ):
        raise ValueError(
            "Gemini prompt must be a string."
        )

    prompt = prompt.strip()

    if not prompt:
        raise ValueError(
            "Gemini prompt cannot be empty."
        )

    # -----------------------------------------------------
    # Step 2: Resolve default schema
    # -----------------------------------------------------

    if response_schema is None:

        from app.ai.schemas.resume_schema import (
            ResumeAnalysis,
        )

        response_schema = ResumeAnalysis

    # -----------------------------------------------------
    # Step 3: Validate response schema
    # -----------------------------------------------------

    if not (
        isinstance(
            response_schema,
            type,
        )
        and issubclass(
            response_schema,
            BaseModel,
        )
    ):
        raise TypeError(
            "response_schema must be a "
            "Pydantic BaseModel class."
        )

    # -----------------------------------------------------
    # Step 4: Build Gemini configuration
    # -----------------------------------------------------

    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=response_schema,
    )

    # -----------------------------------------------------
    # Step 5: Log request start
    # -----------------------------------------------------

    schema_name = (
        response_schema.__name__
    )

    logger.info(
        "Gemini request started: model=%s schema=%s attempts=%s",
        MODEL_NAME,
        schema_name,
        GEMINI_MAX_ATTEMPTS,
    )

    # -----------------------------------------------------
    # Step 6: Call Gemini
    # -----------------------------------------------------

    try:

        response = (
            client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=config,
            )
        )

    except Exception as error:

        logger.exception(
            "Gemini request failed: model=%s schema=%s",
            MODEL_NAME,
            schema_name,
        )

        raise RuntimeError(
            "Gemini API request failed."
        ) from error

    # -----------------------------------------------------
    # Step 7: Extract response text
    # -----------------------------------------------------

    response_text = getattr(
        response,
        "text",
        None,
    )

    if not response_text:
        raise ValueError(
            "Gemini returned an empty response."
        )

    response_text = (
        response_text.strip()
    )

    if not response_text:
        raise ValueError(
            "Gemini returned an empty response."
        )

    # -----------------------------------------------------
    # Step 8: Log request completion
    # -----------------------------------------------------

    logger.info(
        "Gemini request completed: model=%s schema=%s",
        MODEL_NAME,
        schema_name,
    )

    return response_text