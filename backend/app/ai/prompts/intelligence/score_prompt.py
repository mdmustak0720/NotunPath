"""
Resume Score Prompt

Purpose:
Builds the structured evaluation prompt used by Gemini
for qualitative resume-quality assessment.

Gemini evaluates the resume content.
The application calculates the final weighted score.
"""

from __future__ import annotations


# =========================================================
# Prompt Builder
# =========================================================

def build_score_prompt(
    resume_analysis: dict,
) -> str:
    """
    Build the Gemini prompt for resume-quality evaluation.

    Args:
        resume_analysis:
            Normalized structured resume analysis.

    Returns:
        Prompt string.
    """

    if not isinstance(resume_analysis, dict):
        raise ValueError(
            "Resume analysis must be a dictionary."
        )

    return f"""
You are the Resume Quality Evaluation Engine
for NotunPath, an AI-powered career platform.

Your task is to evaluate the QUALITY of the resume
content provided below.

IMPORTANT RULES:

1. Evaluate the resume document, NOT the person.
2. Do not make hiring, rejection, ranking, or
   employability decisions.
3. Do not use sensitive personal information such as:
   - name
   - email
   - phone number
   - exact location
4. Do not invent missing information.
5. Use only information supported by the supplied
   structured resume data.
6. A missing optional section is NOT automatically a
   weakness.
7. Do not penalize students or fresh graduates merely
   because they lack full-time experience.
8. Projects without an explicit technology list are
   still valid projects.
9. Evaluate evidence quality, clarity, specificity,
   consistency, and professional presentation.
10. Return concise, evidence-based reasoning.

Evaluate these dimensions independently:

- content_quality
- skills_presentation
- project_evidence
- experience_evidence
- career_direction
- professional_clarity

Each dimension must be an integer from 0 to 100.

SCORING GUIDANCE:

0-39   = very weak evidence
40-59  = weak / incomplete
60-69  = developing
70-79  = good
80-89  = strong
90-100 = excellent

Do NOT simply count sections.

For example:

- Ten vague skills are not automatically better than
  five clearly supported skills.
- Three weak projects are not automatically better than
  one strong project.
- Lack of full-time experience is not automatically a
  weakness for students or fresh graduates.
- A project can still be valuable when technologies are
  not explicitly separated from its description.

For strengths:
Return only genuine strengths supported by the resume.

For improvement areas:
Return practical, specific improvements that could make
the resume clearer, stronger, or more complete.

For evidence:
Return short factual observations grounded directly
in the resume.

Do not fabricate metrics, technologies, job experience,
achievements, certifications, or responsibilities.

STRUCTURED RESUME DATA:

{resume_analysis}

Return ONLY the structured output matching the
GeminiScoreEvaluation schema.
Do not return Markdown.
Do not return commentary outside the schema.
""".strip()