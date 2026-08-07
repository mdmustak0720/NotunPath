# Purpose: Cleans extracted resume text before AI analysis.

import re


def clean_resume_text(text: str) -> str:

    # Replace multiple spaces with a single space.
    text = re.sub(r"[ \t]+", " ", text)

    # Replace multiple blank lines with a single blank line.
    text = re.sub(r"\n\s*\n+", "\n\n", text)

    # Remove leading and trailing whitespace.
    text = text.strip()

    return text