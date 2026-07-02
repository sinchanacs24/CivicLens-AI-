# CivicLens AI

**AI-Powered Community Intelligence Platform**

CivicLens AI helps city officials turn raw public-complaint data into fast,
confident decisions. Upload a CSV of complaints and get an instant risk
dashboard, GPU-accelerated processing benchmarks, and Gemini-generated
recommendations.

Built for the hackathon problem statement:
> "Create a data intelligence tool people would actually use, and show how
> acceleration helps them make a faster or better decision."

---

## Overview

City departments receive thousands of complaints — water supply, road
damage, garbage collection, and more — but manually digging through
spreadsheets to find which wards need urgent attention is slow. CivicLens AI:

1. Cleans and validates uploaded complaint data.
2. Computes a weighted **risk score** per ward.
3. Uses **NVIDIA RAPIDS (cuDF)** to accelerate processing, with an automatic
   Pandas fallback and a live **CPU vs GPU benchmark**.
4. Sends the aggregated analytics to **Google Gemini** to generate a plain-language
   summary, top risks, recommendations, and an action plan.
5. Displays everything in an interactive, modern dashboard.

---

## Features

- 📂 CSV upload with progress indicator and validation
- 🧹 Automatic data cleaning (dedup, missing values, normalization, date parsing)
- ⚡ GPU-accelerated data processing via NVIDIA RAPIDS / cuDF, with graceful CPU fallback
- 📊 Interactive dashboard: KPI cards, trend line, category breakdown, risk pie chart,
  ward leaderboard, department workload
- 🧮 Weighted ward risk scoring (complaint volume, priority mix, rainfall, traffic, population)
- 🤖 Gemini-generated summary, top risks, recommendations, action plan, and future concerns
- 🏁 CPU vs GPU benchmark panel with measured speedup
- ☁️ Optional Google Cloud Storage + BigQuery sync on upload
- 🌓 Dark, glassmorphic SaaS-style UI with Framer Motion animations

---

## Architecture

```
                ┌─────────────┐        ┌──────────────────┐
   CSV Upload → │   React UI  │──────▶│   FastAPI Backend  │
                └─────────────┘        └────────┬──────────┘
                                                 │
                        ┌────────────────────────┼─────────────────────────┐
                        ▼                        ▼                         ▼
                ┌───────────────┐       ┌────────────────┐        ┌────────────────┐
                │ Cloud Storage │       │  cuDF / Pandas  │        │  Gemini API     │
                │ + BigQuery    │       │  clean + score  │        │  AI insights    │
                │ (best-effort) │       └────────┬────────┘        └────────┬────────┘
                └───────────────┘                │                          │
                                                  ▼                          │
                                        ┌──────────────────┐                │
                                        │ Dashboard JSON    │◀───────────────┘
                                        └──────────────────┘
```

**Upload workflow:** Upload CSV → store locally → best-effort push to Cloud
Storage → best-effort load into BigQuery → read with cuDF if a GPU is
available, else Pandas → clean → compute risk scores + analytics → return
dashboard JSON.

---

## Folder Structure

```
CivicLens-AI/
├── frontend/                  React + Vite + TypeScript + Tailwind
│   ├── public/
│   └── src/
│       ├── components/        Navbar, Charts, StatCard, RiskTable, ...
│       ├── pages/              Landing, Upload, Dashboard, About
│       ├── hooks/              useDashboard
│       ├── services/           api.ts (Axios client)
│       └── utils/               types.ts, format.ts
├── backend/                   FastAPI + Pandas/cuDF
│   └── app/
│       ├── routers/            upload, dashboard, risk, gemini, benchmark, health
│       ├── services/           data_processing, risk_engine, analytics,
│       │                       gemini_service, gcp_service, benchmark_service
│       └── utils/               cleaning.py
├── sample_data/
│   └── complaints.csv         10,000+ row realistic sample dataset
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS, React Router, Axios, Recharts, Framer Motion, Heroicons |
| Backend | FastAPI, Pandas, cuDF (optional GPU path), Pydantic, Uvicorn |
| Google Cloud | Cloud Storage, BigQuery, Gemini API, Cloud Run |
| NVIDIA | RAPIDS, cuDF |
| Deployment | Docker, Docker Compose |

---

## Installation

### Prerequisites

- Node.js 18+
- Python 3.11+
- (Optional, for GPU acceleration) a CUDA-enabled GPU with RAPIDS/cuDF installed

### 1. Clone and configure environment

```bash
git clone <your-repo-url>
cd CivicLens-AI
cp .env.example .env
# Fill in GEMINI_API_KEY and (optionally) your Google Cloud settings
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env .env             # or export the variables another way
uvicorn app.main:app --reload --port 8000
```

The API will be live at `http://localhost:8000` with interactive docs at
`http://localhost:8000/docs`.

**Optional GPU acceleration:** on a CUDA-enabled machine, additionally install:

```bash
pip install cudf-cu12 --extra-index-url=https://pypi.nvidia.com
```

If cuDF or a GPU isn't available, the backend automatically uses Pandas —
no configuration needed.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app will be live at `http://localhost:5173`. It proxies `/api/*`
requests to the backend at `http://localhost:8000` (see `vite.config.ts`).

### 4. Try it out

1. Open `http://localhost:5173`.
2. Go to **Upload** and upload `sample_data/complaints.csv`.
3. View the **Dashboard** for risk scores, charts, AI insights, and the
   CPU vs GPU benchmark.

---

## Google Cloud Setup (Optional)

CivicLens AI works fully **without** any Google Cloud configuration — the
Cloud Storage/BigQuery sync steps are best-effort and silently skipped if
not configured. To enable them:

1. Create a GCP project and note its `PROJECT_ID`.
2. Create a Cloud Storage bucket and set `GCS_BUCKET_NAME`.
3. Create a BigQuery dataset matching `BIGQUERY_DATASET`.
4. Create a service account with Storage Object Admin + BigQuery Data
   Editor roles, download its JSON key, and point
   `GOOGLE_APPLICATION_CREDENTIALS` at the file path.

## Gemini API Setup

1. Get an API key from [Google AI Studio](https://aistudio.google.com/).
2. Set `GEMINI_API_KEY` in your `.env`.

If no key is set, `/gemini` automatically returns a deterministic,
rule-based summary instead of failing, so the demo always works.

---

## Docker

Build and run the full stack:

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

GPU acceleration inside Docker requires a host with the NVIDIA Container
Toolkit installed — uncomment the `deploy.resources` block for the
`backend` service in `docker-compose.yml`.

---
## Verified Evidence

**Google Cloud (2 services used):**
- ✅ Cloud Storage — uploaded CSVs verified in bucket `civiclens-hackathon-sinchanacs`
- ✅ BigQuery — complaint data loaded into `gen-lang-client-0885267984.civiclens.complaints` (10,040 rows, auto-detected schema)

**NVIDIA GPU Acceleration:**
- Benchmarked on real Tesla T4 GPU (Google Colab) using an 800,000-row complaints dataset
- Pandas (CPU): 3.64s | cuDF (GPU): 1.25s | **Speedup: 2.92x**
- Production deployment runs on Pandas for cost-efficient hosting; GPU acceleration is demonstrated separately since Render's free tier has no GPU. The same `cuDF` code path in `backend/app/services/data_processing.py` runs automatically on any CUDA-enabled deployment.

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload` | Upload and process a complaints CSV |
| `GET` | `/dashboard` | Full dashboard analytics for the last uploaded dataset |
| `GET` | `/risk` | Ward-level risk scores and top risk wards |
| `POST` | `/gemini` | Gemini-generated summary and recommendations |
| `GET` | `/benchmark` | CPU (Pandas) vs GPU (cuDF) processing benchmark |
| `GET` | `/health` | Health check |

---

## Screenshots

> _Add screenshots of the Landing page, Upload flow, and Dashboard here before submission._

- `docs/screenshot-landing.png`
- `docs/screenshot-upload.png`
- `docs/screenshot-dashboard.png`

---

## Future Improvements

- Persist datasets in a real database instead of in-memory state
- Multi-file / multi-source ingestion (APIs, IoT feeds, live databases)
- Natural language querying over the dataset ("Which ward had the most water complaints last month?")
- Anomaly detection and automated alerting
- Role-based access for different departments
- Looker/Vertex AI integration for deeper forecasting

---

## License

Built for hackathon submission purposes.
