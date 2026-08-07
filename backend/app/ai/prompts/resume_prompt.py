# Purpose: Builds the prompt for universal resume parsing.

import json


def build_resume_prompt(resume_text: str) -> str:
    """
    Build a prompt that extracts structured information
    from any professional resume.
    """

    schema = {
        "personal_information": {
            "full_name": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin": "",
            "github": "",
            "portfolio": ""
        },
        "professional_summary": "",
        "target_roles": [],
        "skills": [],
        "work_experience": [],
        "projects": [],
        "education": [],
        "certifications": [],
        "achievements": [],
        "publications": [],
        "research": [],
        "licenses": [],
        "languages": [],
        "volunteer_experience": [],
        "internships": [],
        "awards": [],
        "custom_sections": []
    }

    return f"""
You are an expert Resume Parsing AI.

Your task is to extract ALL meaningful information from a resume.

The resume may belong to ANY profession.

Return ONLY valid JSON.

Do not return markdown.

Do not use triple backticks.

Do not invent information.

If a field is missing, return null or an empty list.

Return the JSON in this format:

{json.dumps(schema, indent=4)}

Resume:

{resume_text}
"""