"""
Resume Normalizer

Purpose:
Cleans and normalizes structured resume analysis
returned by the AI model before persistence.
"""


# ---------------------------------------------------------
# Placeholder values
# ---------------------------------------------------------

EMPTY_PLACEHOLDERS = {
    "not specified",
    "not available",
    "not provided",
    "unknown",
    "n/a",
    "na",
    "none",
    "null",
    "nil",
    "-",
    "--",
}


def normalize_resume_analysis(
    analysis: dict,
) -> dict:
    """
    Normalize structured resume analysis.

    Removes:
    - None values
    - Empty strings
    - Empty lists
    - Empty dictionaries
    - AI placeholder values

    Preserves meaningful values such as:
    - 0
    - False
    - Non-empty strings
    - Non-empty lists
    - Non-empty dictionaries
    """

    if not isinstance(analysis, dict):
        raise ValueError(
            "Resume analysis must be a dictionary."
        )

    return _remove_empty_values(analysis)


def _is_empty_string(value: str) -> bool:
    """
    Determine whether a string represents missing data.
    """

    normalized = value.strip().lower()

    return (
        not normalized
        or normalized in EMPTY_PLACEHOLDERS
    )


def _remove_empty_values(value):
    """
    Recursively remove empty and placeholder values.
    """

    # -----------------------------------------------------
    # Dictionary
    # -----------------------------------------------------

    if isinstance(value, dict):

        cleaned = {}

        for key, item in value.items():

            normalized_item = _remove_empty_values(item)

            if normalized_item is None:
                continue

            if isinstance(normalized_item, str):
                if _is_empty_string(normalized_item):
                    continue

            if (
                isinstance(normalized_item, list)
                and not normalized_item
            ):
                continue

            if (
                isinstance(normalized_item, dict)
                and not normalized_item
            ):
                continue

            cleaned[key] = normalized_item

        return cleaned

    # -----------------------------------------------------
    # List
    # -----------------------------------------------------

    if isinstance(value, list):

        cleaned_items = []

        for item in value:

            normalized_item = _remove_empty_values(item)

            if normalized_item is None:
                continue

            if isinstance(normalized_item, str):
                if _is_empty_string(normalized_item):
                    continue

            if (
                isinstance(normalized_item, list)
                and not normalized_item
            ):
                continue

            if (
                isinstance(normalized_item, dict)
                and not normalized_item
            ):
                continue

            cleaned_items.append(
                normalized_item
            )

        return cleaned_items

    # -----------------------------------------------------
    # String
    # -----------------------------------------------------

    if isinstance(value, str):

        stripped_value = value.strip()

        if _is_empty_string(stripped_value):
            return None

        return stripped_value

    # -----------------------------------------------------
    # Other valid values
    # -----------------------------------------------------

    return value