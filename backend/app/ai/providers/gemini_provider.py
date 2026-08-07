# Purpose: Handles communication with the Gemini API.

import os

from dotenv import load_dotenv
from google import genai

# Load environment variables.
load_dotenv()

# Initialize the Gemini client.
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# Load the Gemini model from the environment.
MODEL_NAME = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.6-flash"
)


def generate_content(prompt: str) -> str:
    """
    Sends a prompt to Gemini and returns the generated response.
    """

    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        # Ensure the model returned content.
        if not response.text:
            raise ValueError("Gemini returned an empty response.")

        # Return clean text.
        return response.text.strip()

    except Exception as error:
        raise RuntimeError(
            f"Gemini API Error: {error}"
        ) from error# Purpose: Handles communication with the Gemini API.

import os

from dotenv import load_dotenv
from google import genai

# Load environment variables.
load_dotenv()

# Initialize the Gemini client.
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# Load the Gemini model from the environment.
MODEL_NAME = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.6-flash"
)


def generate_content(prompt: str) -> str:
    """
    Sends a prompt to Gemini and returns the generated response.
    """

    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        # Ensure the model returned content.
        if not response.text:
            raise ValueError("Gemini returned an empty response.")

        # Return clean text.
        return response.text.strip()

    except Exception as error:
        raise RuntimeError(
            f"Gemini API Error: {error}"
        ) from error