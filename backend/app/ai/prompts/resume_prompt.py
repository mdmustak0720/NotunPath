"""
Resume Prompt

Purpose:
Builds a strict, universal resume parsing prompt
for structured AI extraction.
"""

import json


def build_resume_prompt(resume_text: str) -> str:
    """
    Build a strict prompt for universal resume parsing.

    The prompt enforces a stable canonical structure
    so downstream services can safely process the result.
    """

    schema = {
        "personal_information": {
            "full_name": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin": "",
            "github": "",
            "portfolio": "",
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
        "custom_sections": [],
    }

    return f"""
You are an expert Resume Parsing AI.

Your task is to extract all meaningful and explicitly stated
information from the resume provided below.

The resume may belong to ANY profession, including:

- Software Engineer
- Data Scientist
- AI Engineer
- Doctor
- Nurse
- Lawyer
- Accountant
- Teacher
- Professor
- Mechanical Engineer
- Civil Engineer
- Researcher
- Designer
- Marketing Professional
- Business Analyst
- Student
- Any other professional field

============================================================
STRICT EXTRACTION RULES
============================================================

1. Extract ONLY information explicitly present in the resume.

2. NEVER invent, assume, infer, or hallucinate information.

3. Preserve the meaning of the original resume.

4. Do not add information merely because it would normally
   be expected in a resume.

5. If a field is NOT present in the resume:
   - DO NOT include that field in the final JSON object.
   - Do not use null.
   - Do not use "None".
   - Do not use "N/A".
   - Do not use "Not available".
   - Do not use an empty string.

6. If a section contains no information:
   - DO NOT include that section in the final JSON object.

7. Do not create empty arrays for missing sections.

8. Do not create empty objects for missing sections.

9. Preserve the exact information whenever practical,
   including names, organizations, dates, technologies,
   certifications, job titles, and project names.

10. Do not convert missing information into assumptions.

============================================================
STRICT SCHEMA RULES
============================================================

Use ONLY the field names defined in the schema below.

Do not rename fields.

Do not create alternative field names.

For example:

- Use "title" for project title.
- Do NOT use "name" for project title.

- Use "dates" for education dates.
- Do NOT replace it with "start_date" and "end_date".

- Use "description" for project description.

The structure of each object must remain consistent.

============================================================
EXPECTED JSON STRUCTURE
============================================================

The following structure defines the canonical schema:

{json.dumps(schema, indent=4)}

IMPORTANT:

The schema above defines the allowed field names.

However, fields that are not supported by the resume
MUST BE OMITTED from the final JSON.

Do NOT return null values.

Do NOT return empty strings.

Do NOT return empty arrays.

============================================================
OUTPUT REQUIREMENTS
============================================================

Return ONLY valid JSON.

Do NOT return Markdown.

Do NOT use triple backticks.

Do NOT include explanations before or after the JSON.

The response must be directly parseable using Python's
json.loads().

============================================================
RESUME
============================================================

{resume_text}
"""