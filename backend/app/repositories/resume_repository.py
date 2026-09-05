"""
Resume Repository

Handles database operations for resume data,
including resume versioning, history, analysis,
and intelligence results.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pymongo import ASCENDING, DESCENDING

from app.database.mongodb import db


resumes_collection = db["resumes"]
resume_history_collection = db["resume_history"]


resumes_collection.create_index(
    [
        ("user_email", ASCENDING),
        ("version", DESCENDING),
        ("created_at", DESCENDING),
    ],
    name="user_version_created_idx",
)

resumes_collection.create_index(
    [
        ("user_email", ASCENDING),
    ],
    name="user_latest_unique_idx",
    unique=True,
    partialFilterExpression={
        "is_latest": True,
    },
)

resume_history_collection.create_index(
    [
        ("user_email", ASCENDING),
        ("version", DESCENDING),
        ("archived_at", DESCENDING),
    ]
)


def save_resume_analysis(
    user_email: str,
    file_path: str,
    analysis: dict[str, Any],
    intelligence: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Save a new analyzed resume version.

    The previous latest version is archived before the new
    version is inserted. Resume analysis and intelligence
    results are stored together with the same resume version.

    The entire version transition runs inside a MongoDB transaction.
    """

    now = datetime.now(timezone.utc)

    def transaction_callback(session):
        latest_resume = resumes_collection.find_one(
            {
                "user_email": user_email,
                "is_latest": True,
            },
            sort=[
                ("version", DESCENDING),
                ("created_at", DESCENDING),
            ],
            session=session,
        )

        if not latest_resume:
            latest_resume = resumes_collection.find_one(
                {
                    "user_email": user_email,
                },
                sort=[
                    ("version", DESCENDING),
                    ("created_at", DESCENDING),
                ],
                session=session,
            )

        if latest_resume:
            existing_version = latest_resume.get(
                "version"
            )

            if isinstance(
                existing_version,
                int,
            ):
                next_version = (
                    existing_version + 1
                )
            else:
                next_version = 2
        else:
            next_version = 1

        if latest_resume:
            previous_resume_id = (
                latest_resume["_id"]
            )

            resumes_collection.update_one(
                {
                    "_id": previous_resume_id,
                },
                {
                    "$set": {
                        "is_latest": False,
                        "updated_at": now,
                    },
                },
                session=session,
            )

            previous_version = latest_resume.get(
                "version",
                1,
            )

            history_document = {
                "source_resume_id": str(
                    previous_resume_id
                ),
                "user_email": latest_resume.get(
                    "user_email"
                ),
                "file_path": latest_resume.get(
                    "file_path"
                ),
                "analysis": latest_resume.get(
                    "analysis"
                ),
                "intelligence": latest_resume.get(
                    "intelligence"
                ),
                "version": previous_version,
                "created_at": latest_resume.get(
                    "created_at"
                ),
                "updated_at": latest_resume.get(
                    "updated_at"
                ),
                "archived_at": now,
                "archived_reason": (
                    "new_resume_uploaded"
                ),
            }

            resume_history_collection.insert_one(
                history_document,
                session=session,
            )

        resume_document = {
            "user_email": user_email,
            "file_path": file_path,
            "analysis": analysis,
            "intelligence": intelligence,
            "version": next_version,
            "is_latest": True,
            "created_at": now,
            "updated_at": now,
        }

        result = resumes_collection.insert_one(
            resume_document,
            session=session,
        )

        return {
            "resume_id": str(
                result.inserted_id
            ),
            "version": next_version,
        }

    with db.client.start_session() as session:
        return session.with_transaction(
            transaction_callback
        )


def get_latest_resume_by_user(
    user_email: str,
):
    """
    Return the latest resume belonging to the user.

    Falls back to the most recent version for resumes
    created before explicit latest-version tracking existed.
    """

    resume = resumes_collection.find_one(
        {
            "user_email": user_email,
            "is_latest": True,
        },
        sort=[
            ("version", DESCENDING),
            ("created_at", DESCENDING),
        ],
    )

    if resume:
        return resume

    return resumes_collection.find_one(
        {
            "user_email": user_email,
        },
        sort=[
            ("version", DESCENDING),
            ("created_at", DESCENDING),
        ],
    )


def get_resumes_by_user(
    user_email: str,
):
    """
    Return all resume versions belonging to the user.
    """

    return resumes_collection.find(
        {
            "user_email": user_email,
        }
    ).sort(
        [
            ("version", DESCENDING),
            ("created_at", DESCENDING),
        ]
    )


def get_resume_history_by_user(
    user_email: str,
):
    """
    Return archived resume versions belonging to the user.
    """

    return resume_history_collection.find(
        {
            "user_email": user_email,
        }
    ).sort(
        [
            ("version", DESCENDING),
            ("archived_at", DESCENDING),
        ]
    )