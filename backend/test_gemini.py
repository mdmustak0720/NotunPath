# Purpose: Tests the Gemini provider independently.

from app.ai.providers.gemini_provider import generate_response


def main():
    response = generate_response(
        "Reply with exactly this sentence: Gemini connection successful."
    )

    print("\n===== Gemini Response =====\n")
    print(response)


if __name__ == "__main__":
    main()