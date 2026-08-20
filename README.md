# NotunPath

AI-powered resume analysis and career profile platform.

## Features

- Google OAuth + JWT authentication
- PDF resume upload
- Resume text extraction and cleaning
- Gemini-powered structured analysis
- MongoDB persistence
- Resume history and latest-resume retrieval
- AI-generated career profile dashboard
- Protected frontend routes
- Drag-and-drop PDF upload
- Responsive dashboard UI

## Tech Stack

**Frontend:** React 19, Vite, React Router, Zustand, Axios, React Dropzone, Motion, Lucide React

**Backend:** Python, FastAPI, Pydantic, PyMuPDF, PyMongo, Python-JOSE, Google Auth, Google GenAI SDK

**Database:** MongoDB Atlas

**AI:** Gemini

## Pipeline

```text
┌──────────────────┐
│   Google Login   │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Authentication   │
│  OAuth → JWT     │
└────────┬─────────┘
         ↓
┌──────────────────┐
│  Resume Upload   │
│      PDF         │
└────────┬─────────┘
         ↓
┌──────────────────┐
│  Text Extraction │
│    PyMuPDF       │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Text Cleaning &  │
│  Normalization   │
└────────┬─────────┘
         ↓
┌──────────────────┐
│  Gemini Analysis │
│  Structured JSON │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Schema Validation│
│   & Normalization│
└────────┬─────────┘
         ↓
┌──────────────────┐
│     MongoDB      │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Career Profile   │
│    Dashboard     │
└──────────────────┘
```

## Architecture

```text
NotunPath/
├── frontend/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── store/
│       └── styles/
│
└── backend/
    └── app/
        ├── ai/
        │   ├── analyzers/
        │   ├── prompts/
        │   ├── providers/
        │   ├── schemas/
        │   └── utils/
        ├── api/routes/
        ├── config/
        ├── core/
        ├── database/
        ├── models/
        ├── repositories/
        ├── schemas/
        └── services/
```

## API

Base path: `/api/v1`

```http
POST /auth/google
GET  /user/me
POST /resume/upload
GET  /resume
GET  /resume/latest
GET  /health
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

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET_KEY=your_jwt_secret
JWT_ALGORITHM=HS256
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## License

MIT
