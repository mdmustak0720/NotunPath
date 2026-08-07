# Purpose: Tests the complete resume analysis pipeline.

from app.ai.analyzers.resume_analyzer import analyze_resume

sample_resume = """
John Doe

Python
React
Node.js
MongoDB

Built an E-Commerce Platform using MERN.

Bachelor of Computer Science
"""

analysis = analyze_resume(sample_resume)

print("\n===== Resume Analysis =====\n")
print(analysis)