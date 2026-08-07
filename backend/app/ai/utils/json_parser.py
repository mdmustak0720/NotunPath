# Purpose: Converts AI responses into valid Python dictionaries.

import json


def parse_json_response(response: str) -> dict:
    """
    Cleans and parses a JSON response returned by the AI model.
    """

    # Remove Markdown code fences if present.
    response = response.replace("```json", "")
    response = response.replace("```", "")

    # Remove leading and trailing whitespace.
    response = response.strip()

    # Convert JSON string into Python dictionary.
    return json.loads(response)