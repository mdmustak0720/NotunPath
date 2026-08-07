# Purpose: Analyzes a resume using the configured AI provider.

from app.ai.prompts.resume_prompt import build_resume_prompt
from app.ai.providers.gemini_provider import generate_content
from app.ai.utils.json_parser import parse_json_response


def analyze_resume(resume_text: str) -> dict:
    """
    Analyze the resume text and return structured JSON.
    """

    # Build the AI prompt.
    prompt = build_resume_prompt(resume_text)

    # Generate the AI response.
    response = generate_content(prompt)

    # Convert the AI response into a Python dictionary.
    analysis = parse_json_response(response)

    return analysis