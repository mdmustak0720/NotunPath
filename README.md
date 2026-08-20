# NotunPath

AI-powered resume analysis and career profile platform.

## Features

- Google OAuth authentication
- JWT-based API authentication
- PDF resume upload
- Resume text extraction with PyMuPDF
- Resume text cleaning and normalization
- Structured AI resume analysis with Gemini
- Pydantic-validated AI output
- MongoDB persistence
- Resume history and latest-resume retrieval
- AI-generated career profile dashboard
- Protected frontend routes
- Drag-and-drop PDF upload
- Responsive dashboard UI

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Zustand
- Axios
- React Dropzone
- Motion
- Lucide React
- Google OAuth

### Backend

- Python
- FastAPI
- Pydantic
- PyMuPDF
- PyMongo
- Python-JOSE
- Google Auth
- Google GenAI SDK

### Database & AI

- MongoDB Atlas
- Gemini
- Structured JSON output

## Architecture

```text
NotunPath/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   └── resume/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── store/
│       ├── styles/
│       ├── App.jsx
│       └── main.jsx
│
└── backend/
    ├── app/
    │   ├── ai/
    │   │   ├── analyzers/
    │   │   ├── prompts/
    │   │   ├── providers/
    │   │   ├── schemas/
    │   │   └── utils/
    │   ├── api/
    │   │   └── routes/
    │   ├── config/
    │   ├── core/
    │   ├── database/
    │   ├── models/
    │   ├── repositories/
    │   ├── schemas/
    │   ├── services/
    │   └── main.py
    └── requirements.txt
```

## Flow

```text
Google Login
    ↓
Google ID Token
    ↓
FastAPI Authentication
    ↓
Application JWT
    ↓
Protected Dashboard
    ↓
PDF Resume Upload
    ↓
PDF Text Extraction
    ↓
Text Cleaning
    ↓
Gemini Analysis
    ↓
Structured Resume Schema
    ↓
Normalization
    ↓
MongoDB
    ↓
Career Profile Dashboard
```

## Resume Analysis

The structured analysis supports:

- Personal information
- Professional summary
- Target roles
- Skills
- Work experience
- Projects
- Education
- Certifications
- Achievements
- Publications
- Research
- Licenses
- Languages
- Volunteer experience
- Internships
- Awards
- Custom sections

## API

Base path:

```text
/api/v1
```

### Authentication

```http
POST /auth/google
```

### User

```http
GET /user/me
```

### Resume

```http
POST /resume/upload
GET  /resume
GET  /resume/latest
```

### Health

```http
GET /health
```

## Setup

### Backend

```bash
cd backend
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `backend/.env`:

```env
APP_NAME=NotunPath
APP_VERSION=1.0.0
APP_DESCRIPTION=AI Resume Analysis Platform
DEBUG=True
HOST=127.0.0.1
PORT=8000

MONGODB_URI=your_mongodb_uri

GOOGLE_CLIENT_ID=your_google_client_id

JWT_SECRET_KEY=your_jwt_secret
JWT_ALGORITHM=HS256

AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model
```

Run:

```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Run:

```bash
npm run dev
```

## Environment Variables

| Variable | Used by |
|---|---|
| `MONGODB_URI` | MongoDB connection |
| `GOOGLE_CLIENT_ID` | Backend Google token verification |
| `JWT_SECRET_KEY` | JWT signing |
| `JWT_ALGORITHM` | JWT algorithm |
| `AI_PROVIDER` | AI provider selection |
| `GEMINI_API_KEY` | Gemini API |
| `GEMINI_MODEL` | Gemini model selection |
| `VITE_API_BASE_URL` | Frontend API base URL |
| `VITE_GOOGLE_CLIENT_ID` | Frontend Google OAuth |

## Project Structure

```text
Frontend
React → Router → Protected Routes → Zustand → API Services

Backend
FastAPI → Routes → Services → AI / Repositories → MongoDB

AI
Resume Text → Prompt → Gemini → Pydantic Schema → Normalizer
```

## License

MIT
