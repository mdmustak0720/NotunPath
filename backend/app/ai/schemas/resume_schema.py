"""
Resume Schema

Purpose:
Defines the canonical structured data contract for
AI-powered resume analysis.

The schema provides stable field names and data types
while allowing information to be absent when it is not
supported by the source resume.
"""

from typing import Optional

from pydantic import BaseModel, Field


# =========================================================
# Personal Information
# =========================================================

class PersonalInformation(BaseModel):
    """
    Personal and contact information extracted from
    the resume.
    """

    full_name: Optional[str] = Field(
        default=None,
        description=(
            "Candidate's full name exactly as stated in "
            "the resume. Return null if not present."
        ),
    )

    email: Optional[str] = Field(
        default=None,
        description=(
            "Candidate's email address exactly as stated "
            "in the resume. Return null if not present."
        ),
    )

    phone: Optional[str] = Field(
        default=None,
        description=(
            "Candidate's phone number exactly as stated "
            "in the resume. Return null if not present."
        ),
    )

    location: Optional[str] = Field(
        default=None,
        description=(
            "Candidate's location if explicitly present "
            "in the resume. Return null if not present."
        ),
    )

    linkedin: Optional[str] = Field(
        default=None,
        description=(
            "LinkedIn profile URL if explicitly present. "
            "Return null if not present."
        ),
    )

    github: Optional[str] = Field(
        default=None,
        description=(
            "GitHub profile URL if explicitly present. "
            "Return null if not present."
        ),
    )

    portfolio: Optional[str] = Field(
        default=None,
        description=(
            "Portfolio or personal website URL if "
            "explicitly present. Return null if not present."
        ),
    )


# =========================================================
# Work Experience
# =========================================================

class WorkExperience(BaseModel):
    """
    A single professional work experience entry.
    """

    job_title: Optional[str] = Field(
        default=None,
        description=(
            "Job title or position exactly as stated "
            "in the resume."
        ),
    )

    company: Optional[str] = Field(
        default=None,
        description=(
            "Company or organization name exactly as "
            "stated in the resume."
        ),
    )

    location: Optional[str] = Field(
        default=None,
        description=(
            "Work location if explicitly stated."
        ),
    )

    dates: Optional[str] = Field(
        default=None,
        description=(
            "Employment period exactly as stated."
        ),
    )

    description: Optional[str] = Field(
        default=None,
        description=(
            "Responsibilities, contributions, or "
            "achievements explicitly stated."
        ),
    )


# =========================================================
# Project
# =========================================================

class Project(BaseModel):
    """
    A single project listed on the resume.
    """

    title: Optional[str] = Field(
        default=None,
        description=(
            "Project title exactly as stated in the "
            "resume. Return null if not present."
        ),
    )

    technologies: list[str] = Field(
        default_factory=list,
        description=(
            "Technologies, frameworks, tools, or "
            "platforms explicitly mentioned for this project."
        ),
    )

    description: Optional[str] = Field(
        default=None,
        description=(
            "Project description and contributions "
            "explicitly supported by the resume."
        ),
    )


# =========================================================
# Education
# =========================================================

class Education(BaseModel):
    """
    A single education or academic qualification entry.
    """

    degree: Optional[str] = Field(
        default=None,
        description=(
            "Degree, diploma, qualification, or "
            "educational program exactly as stated."
        ),
    )

    institution: Optional[str] = Field(
        default=None,
        description=(
            "Educational institution exactly as stated "
            "in the resume. Return null if not present."
        ),
    )

    dates: Optional[str] = Field(
        default=None,
        description=(
            "Education period exactly as stated."
        ),
    )

    cgpa: Optional[str] = Field(
        default=None,
        description=(
            "CGPA, GPA, percentage, grade, or equivalent "
            "result if explicitly stated."
        ),
    )


# =========================================================
# Certification
# =========================================================

class Certification(BaseModel):
    """
    A professional certification, course, or training
    credential.
    """

    title: Optional[str] = Field(
        default=None,
        description=(
            "Certification, course, or training title "
            "exactly as stated."
        ),
    )

    issuer: Optional[str] = Field(
        default=None,
        description=(
            "Organization that issued the credential "
            "if explicitly stated."
        ),
    )

    dates: Optional[str] = Field(
        default=None,
        description=(
            "Certification date or year if stated."
        ),
    )


# =========================================================
# Resume Analysis
# =========================================================

class ResumeAnalysis(BaseModel):
    """
    Canonical structured representation of a resume.
    """

    personal_information: Optional[PersonalInformation] = Field(
        default=None,
        description=(
            "Personal and contact information found "
            "in the resume."
        ),
    )

    professional_summary: Optional[str] = Field(
        default=None,
        description=(
            "Professional summary or objective explicitly "
            "present in the resume."
        ),
    )

    target_roles: list[str] = Field(
        default_factory=list,
        description=(
            "Job roles explicitly targeted or clearly "
            "indicated by the resume."
        ),
    )

    skills: list[str] = Field(
        default_factory=list,
        description=(
            "Technical, professional, or domain skills "
            "explicitly present."
        ),
    )

    work_experience: list[WorkExperience] = Field(
        default_factory=list,
        description=(
            "Professional work experience explicitly "
            "present in the resume."
        ),
    )

    projects: list[Project] = Field(
        default_factory=list,
        description=(
            "Projects explicitly listed in the resume."
        ),
    )

    education: list[Education] = Field(
        default_factory=list,
        description=(
            "Education and academic qualifications "
            "explicitly present."
        ),
    )

    certifications: list[Certification] = Field(
        default_factory=list,
        description=(
            "Certifications, courses, or professional "
            "training explicitly present."
        ),
    )

    achievements: list[str] = Field(
        default_factory=list,
        description=(
            "Achievements explicitly mentioned."
        ),
    )

    publications: list[str] = Field(
        default_factory=list,
        description=(
            "Publications explicitly mentioned."
        ),
    )

    research: list[str] = Field(
        default_factory=list,
        description=(
            "Research work explicitly mentioned."
        ),
    )

    licenses: list[str] = Field(
        default_factory=list,
        description=(
            "Professional licenses explicitly mentioned."
        ),
    )

    languages: list[str] = Field(
        default_factory=list,
        description=(
            "Languages explicitly mentioned."
        ),
    )

    volunteer_experience: list[str] = Field(
        default_factory=list,
        description=(
            "Volunteer experience explicitly mentioned."
        ),
    )

    internships: list[str] = Field(
        default_factory=list,
        description=(
            "Internship experience explicitly mentioned."
        ),
    )

    awards: list[str] = Field(
        default_factory=list,
        description=(
            "Awards or honors explicitly mentioned."
        ),
    )

    custom_sections: list[str] = Field(
        default_factory=list,
        description=(
            "Other meaningful resume sections that do "
            "not fit the predefined categories."
        ),
    )