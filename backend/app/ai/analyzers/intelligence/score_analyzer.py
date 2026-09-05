"""
Resume Score Analyzer

Purpose:
Evaluates resume quality using a hybrid architecture.

Gemini:
    - Semantic / qualitative evaluation
    - Evidence-based rationale
    - Strength identification
    - Improvement identification

Python:
    - Deterministic structural signals
    - Completeness calculations
    - Final weighted aggregation
    - Application-level validation
    - Gemini-to-application model mapping

This module evaluates the resume document itself.
It is NOT a hiring, rejection, employability, or
candidate-selection score.
"""

from __future__ import annotations

from typing import Any

from app.ai.prompts.intelligence.score_prompt import (
    build_score_prompt,
)

from app.ai.providers.gemini_provider import (
    generate_content,
)

from app.ai.schemas.intelligence.score_schema import (
    GeminiScoreEvaluation,
    ResumeScore,
    ScoreDimension,
    ScoreStrength,
    ScoreImprovement,
)


# =========================================================
# Configuration
# =========================================================

SCORING_VERSION = "1.0"


# =========================================================
# Final Scoring Weights
# =========================================================
#
# Total = 100
#
# These weights represent resume-quality dimensions.
# They do NOT represent hiring probability.
#
# =========================================================

SCORE_WEIGHTS: dict[str, int] = {
    "skills": 15,
    "projects": 20,
    "experience_evidence": 15,
    "education": 10,
    "career_direction": 10,
    "content_quality": 10,
    "professional_clarity": 10,
    "completeness": 10,
}


# =========================================================
# Core Resume Sections
# =========================================================

CORE_SECTION_FIELDS: tuple[str, ...] = (
    "personal_information",
    "professional_summary",
    "target_roles",
    "skills",
    "projects",
    "education",
)


# =========================================================
# Public API
# =========================================================

def analyze_resume_score(
    analysis: dict[str, Any],
) -> dict[str, Any]:
    """
    Analyze a normalized structured resume and return
    a validated Resume Quality Score.

    Args:
        analysis:
            Normalized ResumeAnalysis dictionary.

    Returns:
        ResumeScore serialized as a dictionary.

    Raises:
        ValueError:
            Invalid input or invalid AI output.

        RuntimeError:
            AI provider failure.
    """

    # -----------------------------------------------------
    # Step 1: Validate Input
    # -----------------------------------------------------

    if not isinstance(
        analysis,
        dict,
    ):
        raise ValueError(
            "Resume analysis must be a dictionary."
        )

    if not analysis:
        raise ValueError(
            "Resume analysis cannot be empty."
        )

    # -----------------------------------------------------
    # Step 2: Build Deterministic Signals
    # -----------------------------------------------------

    deterministic_signals = (
        _build_deterministic_signals(
            analysis
        )
    )

    # -----------------------------------------------------
    # Step 3: Build Gemini Prompt
    # -----------------------------------------------------

    prompt = build_score_prompt(
        analysis
    )

    # -----------------------------------------------------
    # Step 4: Call Configured AI Provider
    #
    # Gemini receives the dedicated Gemini-facing
    # Pydantic response schema.
    # -----------------------------------------------------

    try:

        response = generate_content(
            prompt,
            response_schema=(
                GeminiScoreEvaluation
            ),
        )

    except Exception as error:

        raise RuntimeError(
            "Resume score evaluation failed while "
            "calling the configured AI provider."
        ) from error

    # -----------------------------------------------------
    # Step 5: Validate AI Response
    #
    # Even though Gemini Structured Output is enabled,
    # the application performs explicit validation.
    # -----------------------------------------------------

    try:

        gemini_evaluation = (
            GeminiScoreEvaluation
            .model_validate_json(
                response
            )
        )

    except Exception as error:

        raise ValueError(
            "AI returned an invalid resume score "
            f"evaluation: {error}"
        ) from error

    # -----------------------------------------------------
    # Step 6: Build Final Score Breakdown
    # -----------------------------------------------------

    score_breakdown = (
        _build_score_breakdown(
            gemini_evaluation=(
                gemini_evaluation
            ),
            deterministic_signals=(
                deterministic_signals
            ),
        )
    )

    # -----------------------------------------------------
    # Step 7: Calculate Final Weighted Score
    # -----------------------------------------------------

    overall_score = (
        _calculate_weighted_score(
            score_breakdown
        )
    )

    # -----------------------------------------------------
    # Step 8: Convert Gemini Models to Application Models
    #
    # IMPORTANT:
    #
    # GeminiScoreStrength != ScoreStrength
    # GeminiScoreImprovement != ScoreImprovement
    #
    # Explicit mapping keeps the AI contract separate
    # from the application/domain contract.
    # -----------------------------------------------------

    strengths = _convert_strengths(
        gemini_evaluation.strengths
    )

    improvement_areas = (
        _convert_improvements(
            gemini_evaluation.improvement_areas
        )
    )

    # -----------------------------------------------------
    # Step 9: Build Final Validated Result
    # -----------------------------------------------------

    result = ResumeScore(
        score_version=SCORING_VERSION,

        overall_score=overall_score,

        score_label=_get_score_label(
            overall_score
        ),

        score_breakdown=score_breakdown,

        strengths=strengths,

        improvement_areas=(
            improvement_areas
        ),

        scoring_notes={
            "score_type": "resume_quality",

            "scoring_version": (
                SCORING_VERSION
            ),

            "sensitive_data_used": False,

            "ai_evaluation_used": True,

            "deterministic_signals_used": True,

            "deterministic_signals": (
                deterministic_signals
            ),

            "evidence": (
                gemini_evaluation
                .evidence
            ),
        },
    )

    # -----------------------------------------------------
    # Step 10: Return Serialized Result
    # -----------------------------------------------------

    return result.model_dump(
        exclude_none=False
    )


# =========================================================
# Final Weighted Score
# =========================================================

def _calculate_weighted_score(
    score_breakdown: dict[
        str,
        ScoreDimension,
    ],
) -> int:
    """
    Calculate the final weighted 0-100 score.

    The application controls the weighting formula.
    Gemini does NOT control the final aggregation.
    """

    weighted_total = 0
    total_weight = 0

    for result in score_breakdown.values():

        score = _clamp_score(
            result.score
        )

        weight = max(
            0,
            int(
                result.weight
            ),
        )

        weighted_total += (
            score * weight
        )

        total_weight += weight

    if total_weight == 0:
        return 0

    return _clamp_score(
        weighted_total
        / total_weight
    )


# =========================================================
# Score Breakdown
# =========================================================

def _build_score_breakdown(
    gemini_evaluation: GeminiScoreEvaluation,
    deterministic_signals: dict[str, Any],
) -> dict[str, ScoreDimension]:
    """
    Combine Gemini qualitative evaluation with
    deterministic application-level signals.

    Objective structural categories are calculated
    locally.

    Qualitative categories are evaluated by Gemini.
    """

    return {

        # -------------------------------------------------
        # Skills
        # -------------------------------------------------

        "skills": ScoreDimension(
            score=_combine_scores(
                ai_score=(
                    gemini_evaluation
                    .skills_presentation
                ),

                deterministic_score=(
                    deterministic_signals[
                        "skills_signal"
                    ]
                ),

                ai_weight=0.70,

                deterministic_weight=0.30,
            ),

            weight=SCORE_WEIGHTS[
                "skills"
            ],

            rationale=(
                gemini_evaluation
                .skills_presentation_rationale
            ),
        ),

        # -------------------------------------------------
        # Projects
        # -------------------------------------------------

        "projects": ScoreDimension(
            score=_combine_scores(
                ai_score=(
                    gemini_evaluation
                    .project_evidence
                ),

                deterministic_score=(
                    deterministic_signals[
                        "projects_signal"
                    ]
                ),

                ai_weight=0.70,

                deterministic_weight=0.30,
            ),

            weight=SCORE_WEIGHTS[
                "projects"
            ],

            rationale=(
                gemini_evaluation
                .project_evidence_rationale
            ),
        ),

        # -------------------------------------------------
        # Experience Evidence
        # -------------------------------------------------

        "experience_evidence": (
            ScoreDimension(
                score=_combine_scores(
                    ai_score=(
                        gemini_evaluation
                        .experience_evidence
                    ),

                    deterministic_score=(
                        deterministic_signals[
                            "experience_signal"
                        ]
                    ),

                    ai_weight=0.75,

                    deterministic_weight=0.25,
                ),

                weight=SCORE_WEIGHTS[
                    "experience_evidence"
                ],

                rationale=(
                    gemini_evaluation
                    .experience_evidence_rationale
                ),
            )
        ),

        # -------------------------------------------------
        # Education
        # -------------------------------------------------

        "education": ScoreDimension(
            score=_calculate_education_score(
                gemini_score=(
                    gemini_evaluation
                    .education_quality
                ),

                deterministic_signals=(
                    deterministic_signals
                ),
            ),

            weight=SCORE_WEIGHTS[
                "education"
            ],

            rationale=(
                gemini_evaluation
                .education_quality_rationale
            ),
        ),

        # -------------------------------------------------
        # Career Direction
        # -------------------------------------------------

        "career_direction": ScoreDimension(
            score=_clamp_score(
                gemini_evaluation
                .career_direction
            ),

            weight=SCORE_WEIGHTS[
                "career_direction"
            ],

            rationale=(
                gemini_evaluation
                .career_direction_rationale
            ),
        ),

        # -------------------------------------------------
        # Content Quality
        # -------------------------------------------------

        "content_quality": ScoreDimension(
            score=_clamp_score(
                gemini_evaluation
                .content_quality
            ),

            weight=SCORE_WEIGHTS[
                "content_quality"
            ],

            rationale=(
                gemini_evaluation
                .content_quality_rationale
            ),
        ),

        # -------------------------------------------------
        # Professional Clarity
        # -------------------------------------------------

        "professional_clarity": ScoreDimension(
            score=_clamp_score(
                gemini_evaluation
                .professional_clarity
            ),

            weight=SCORE_WEIGHTS[
                "professional_clarity"
            ],

            rationale=(
                gemini_evaluation
                .professional_clarity_rationale
            ),
        ),

        # -------------------------------------------------
        # Completeness
        # -------------------------------------------------

        "completeness": ScoreDimension(
            score=_clamp_score(
                deterministic_signals[
                    "completeness_score"
                ]
            ),

            weight=SCORE_WEIGHTS[
                "completeness"
            ],

            rationale=(
                _build_completeness_rationale(
                    deterministic_signals
                )
            ),
        ),
    }


# =========================================================
# Deterministic Signals
# =========================================================

def _build_deterministic_signals(
    analysis: dict[str, Any],
) -> dict[str, Any]:
    """
    Calculate objective structural signals.

    These signals measure presence/completeness.
    They do not attempt to make subjective judgments.
    """

    # -----------------------------------------------------
    # Extract normalized fields safely
    # -----------------------------------------------------

    skills = _safe_list(
        analysis.get(
            "skills"
        )
    )

    projects = _safe_list(
        analysis.get(
            "projects"
        )
    )

    work_experience = _safe_list(
        analysis.get(
            "work_experience"
        )
    )

    internships = _safe_list(
        analysis.get(
            "internships"
        )
    )

    research = _safe_list(
        analysis.get(
            "research"
        )
    )

    achievements = _safe_list(
        analysis.get(
            "achievements"
        )
    )

    awards = _safe_list(
        analysis.get(
            "awards"
        )
    )

    volunteer_experience = _safe_list(
        analysis.get(
            "volunteer_experience"
        )
    )

    education = _safe_list(
        analysis.get(
            "education"
        )
    )

    # -----------------------------------------------------
    # Skills Signal
    # -----------------------------------------------------

    unique_skills = (
        _normalized_unique_strings(
            skills
        )
    )

    skills_signal = _quantity_signal(
        count=len(
            unique_skills
        ),

        thresholds=[
            (0, 0),
            (3, 40),
            (6, 55),
            (10, 70),
            (15, 82),
            (20, 92),
        ],

        default=100,
    )

    # -----------------------------------------------------
    # Projects Signal
    # -----------------------------------------------------

    valid_projects = [
        project
        for project in projects
        if (
            isinstance(
                project,
                dict,
            )
            and _project_has_evidence(
                project
            )
        )
    ]

    projects_with_description = sum(
        1
        for project in valid_projects
        if _has_text(
            project.get(
                "description"
            )
        )
    )

    projects_with_technology = sum(
        1
        for project in valid_projects
        if _safe_list(
            project.get(
                "technologies"
            )
        )
    )

    projects_count_signal = (
        _quantity_signal(
            count=len(
                valid_projects
            ),

            thresholds=[
                (0, 0),
                (1, 50),
                (2, 75),
                (3, 90),
            ],

            default=100,
        )
    )

    if valid_projects:

        description_ratio = (
            projects_with_description
            / len(
                valid_projects
            )
        )

        technology_ratio = (
            projects_with_technology
            / len(
                valid_projects
            )
        )

        project_detail_signal = (
            description_ratio * 70
            + technology_ratio * 30
        )

    else:

        project_detail_signal = 0

    projects_signal = _clamp_score(
        (
            projects_count_signal
            * 0.45
        )
        + (
            project_detail_signal
            * 0.55
        )
    )

    # -----------------------------------------------------
    # Experience Evidence Signal
    # -----------------------------------------------------

    experience_count = (
        len(work_experience)
        + len(internships)
        + len(research)
        + len(achievements)
        + len(awards)
        + len(
            volunteer_experience
        )
    )

    experience_signal = (
        _quantity_signal(
            count=experience_count,

            thresholds=[
                (0, 25),
                (1, 50),
                (2, 70),
                (3, 85),
            ],

            default=100,
        )
    )

    # -----------------------------------------------------
    # Education Signal
    # -----------------------------------------------------

    education_entries = [
        item
        for item in education
        if isinstance(
            item,
            dict,
        )
    ]

    complete_education_entries = sum(
        1
        for item in education_entries
        if (
            _has_text(
                item.get(
                    "degree"
                )
            )
            and _has_text(
                item.get(
                    "institution"
                )
            )
        )
    )

    # -----------------------------------------------------
    # Core Completeness
    # -----------------------------------------------------

    core_sections = {
        "personal_information": (
            _is_populated(
                analysis.get(
                    "personal_information"
                )
            )
        ),

        "professional_summary": (
            _has_text(
                analysis.get(
                    "professional_summary"
                )
            )
        ),

        "target_roles": bool(
            _safe_list(
                analysis.get(
                    "target_roles"
                )
            )
        ),

        "skills": bool(
            unique_skills
        ),

        "projects": bool(
            valid_projects
        ),

        "education": bool(
            education_entries
        ),
    }

    populated_sections = sum(
        1
        for value in core_sections.values()
        if value
    )

    completeness_score = _clamp_score(
        (
            populated_sections
            / len(
                core_sections
            )
        )
        * 100
    )

    # -----------------------------------------------------
    # Return Objective Signals
    # -----------------------------------------------------

    return {
        "skills_count": len(
            unique_skills
        ),

        "skills_signal": _clamp_score(
            skills_signal
        ),

        "project_count": len(
            valid_projects
        ),

        "projects_with_descriptions": (
            projects_with_description
        ),

        "projects_with_technologies": (
            projects_with_technology
        ),

        "projects_signal": (
            _clamp_score(
                projects_signal
            )
        ),

        "experience_evidence_count": (
            experience_count
        ),

        "experience_signal": (
            _clamp_score(
                experience_signal
            )
        ),

        "education_count": len(
            education_entries
        ),

        "complete_education_entries": (
            complete_education_entries
        ),

        "core_sections": core_sections,

        "core_sections_present": (
            populated_sections
        ),

        "core_sections_total": (
            len(
                core_sections
            )
        ),

        "completeness_score": (
            completeness_score
        ),

        "sensitive_data_used": False,
    }


# =========================================================
# Education Score
# =========================================================

def _calculate_education_score(
    gemini_score: int,
    deterministic_signals: dict[str, Any],
) -> int:
    """
    Combine:

        40% Gemini contextual evaluation
        60% objective education completeness

    Institution reputation, ranking, prestige,
    location, and similar factors are intentionally
    excluded.
    """

    education_count = int(
        deterministic_signals.get(
            "education_count",
            0,
        )
    )

    complete_entries = int(
        deterministic_signals.get(
            "complete_education_entries",
            0,
        )
    )

    if education_count == 0:

        objective_score = 0

    else:

        objective_score = (
            complete_entries
            / education_count
            * 100
        )

    return _combine_scores(
        ai_score=gemini_score,

        deterministic_score=(
            objective_score
        ),

        ai_weight=0.40,

        deterministic_weight=0.60,
    )


# =========================================================
# Gemini → Application Model Mapping
# =========================================================

def _convert_strengths(
    strengths: list[Any],
) -> list[ScoreStrength]:
    """
    Convert Gemini-facing strength models into
    application-facing strength models.

    This explicit mapping prevents the application
    domain from depending on Gemini-specific model types.
    """

    converted: list[
        ScoreStrength
    ] = []

    for item in strengths:

        converted.append(
            ScoreStrength(
                category=item.category,
                title=item.title,
                description=item.description,
            )
        )

    return converted


def _convert_improvements(
    improvements: list[Any],
) -> list[ScoreImprovement]:
    """
    Convert Gemini-facing improvement models into
    application-facing improvement models.
    """

    converted: list[
        ScoreImprovement
    ] = []

    for item in improvements:

        converted.append(
            ScoreImprovement(
                category=item.category,
                title=item.title,
                description=item.description,
                priority=item.priority,
            )
        )

    return converted


# =========================================================
# Rationale Helpers
# =========================================================

def _build_completeness_rationale(
    signals: dict[str, Any],
) -> str:
    """
    Build factual completeness rationale.
    """

    present = signals.get(
        "core_sections_present",
        0,
    )

    total = signals.get(
        "core_sections_total",
        0,
    )

    return (
        f"{present} of {total} core resume "
        "sections contain meaningful information."
    )


# =========================================================
# Score Combination
# =========================================================

def _combine_scores(
    ai_score: int | float,
    deterministic_score: int | float,
    ai_weight: float,
    deterministic_weight: float,
) -> int:
    """
    Combine qualitative AI evaluation with
    deterministic application signals.
    """

    return _clamp_score(
        (
            _clamp_score(
                ai_score
            )
            * ai_weight
        )
        + (
            _clamp_score(
                deterministic_score
            )
            * deterministic_weight
        )
    )


# =========================================================
# Quantity Signal
# =========================================================

def _quantity_signal(
    count: int,
    thresholds: list[
        tuple[int, int]
    ],
    default: int,
) -> int:
    """
    Convert quantity into a bounded structural signal.

    Quantity is only one signal; Gemini evaluates
    contextual quality.
    """

    if count <= 0:
        return thresholds[0][1]

    for (
        upper_bound,
        score,
    ) in thresholds:

        if count <= upper_bound:
            return score

    return default


# =========================================================
# Score Label
# =========================================================

def _get_score_label(
    score: int,
) -> str:
    """
    Convert numeric score into a user-facing label.
    """

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

    return "Early Stage"


# =========================================================
# Validation Helpers
# =========================================================

def _clamp_score(
    score: int | float,
) -> int:
    """
    Clamp any score to the valid 0-100 range.
    """

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


def _safe_list(
    value: Any,
) -> list[Any]:
    """
    Safely return list values from normalized data.
    """

    if isinstance(
        value,
        list,
    ):
        return value

    return []


def _has_text(
    value: Any,
) -> bool:
    """
    Determine whether a value contains meaningful text.
    """

    return (
        isinstance(
            value,
            str,
        )
        and bool(
            value.strip()
        )
    )


def _is_populated(
    value: Any,
) -> bool:
    """
    Determine whether a normalized value contains
    meaningful information.
    """

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
        ),
    ):
        return bool(value)

    if isinstance(
        value,
        dict,
    ):
        return bool(value)

    return True


def _project_has_evidence(
    project: dict[str, Any],
) -> bool:
    """
    A project is valid when it has a title OR
    a description.

    Technologies are optional.
    """

    return (
        _has_text(
            project.get(
                "title"
            )
        )
        or _has_text(
            project.get(
                "description"
            )
        )
    )


def _normalized_unique_strings(
    values: list[Any],
) -> list[str]:
    """
    Normalize strings and remove duplicates
    while preserving order.
    """

    seen: set[str] = set()
    result: list[str] = []

    for value in values:

        if not isinstance(
            value,
            str,
        ):
            continue

        cleaned = value.strip()

        if not cleaned:
            continue

        normalized = cleaned.lower()

        if normalized in seen:
            continue

        seen.add(
            normalized
        )

        result.append(
            cleaned
        )

    return result