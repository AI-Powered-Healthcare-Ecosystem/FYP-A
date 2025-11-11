import os
import mysql.connector
from mysql.connector import Error
import logging
import uuid
import requests

# ---- MySQL connection helper ----
def _get_mysql_conn():
    """Connect to Laravel MySQL database"""
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", "3306")),
            user=os.getenv("DB_USERNAME", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_DATABASE", "laravel")
        )
        return conn
    except Error as e:
        logging.debug(f"MySQL connection error: {e}")
        return None

# ---- Read from Laravel patients table ----
def latest_get(patient_id: int | None, model_version: str = "risk_v1") -> float | None:
    """Get last_risk_score from patients table in Laravel database"""
    if patient_id is None:
        return None

    try:
        conn = _get_mysql_conn()
        if conn is None:
            return None

        cursor = conn.cursor()
        cursor.execute(
            "SELECT last_risk_score, risk_model_version FROM patients WHERE id = %s",
            (patient_id,)
        )
        row = cursor.fetchone()

        if row:
            score, db_model_version = row
            if score is not None and (db_model_version == model_version or db_model_version is None):
                cursor.close()
                conn.close()
                return float(score)

        cursor.close()
        conn.close()
        return None
    except Exception:
        return None

def latest_set(patient_id: int | None, value: float, model_version: str = "risk_v1") -> None:
    """This is now handled by Laravel backend via POST /api/patients/{id}/risk"""
    # No-op: Laravel handles the database write
    pass

# ---- Write to Laravel patients table ----
def save_latest_to_mysql(patient_id: int, value: float, label: str, model_version: str = "risk_v1") -> None:
    try:
        conn = _get_mysql_conn()
        if conn is None:
            return
        cursor = conn.cursor()
        # Read current HbA1c (2nd) to compute reduction_a_2_3
        cursor.execute("SELECT hba1c_2nd_visit FROM patients WHERE id = %s", (int(patient_id),))
        row = cursor.fetchone()
        hba1c2 = float(row[0]) if row and row[0] is not None else None
        reduction_a_2_3 = (hba1c2 - float(value)) if hba1c2 is not None else None

        cursor.execute(
            """
            UPDATE patients
            SET last_risk_score = %s,
                last_risk_label = %s,
                risk_model_version = %s,
                last_predicted_at = NOW(),
                hba1c_3rd_visit = %s,
                reduction_a_2_3 = %s
            WHERE id = %s
            """,
            (float(value), str(label), str(model_version), float(value), reduction_a_2_3, int(patient_id))
        )
        conn.commit()
        cursor.close()
        conn.close()
    except Exception:
        # silent fail; caller will still return the computed value
        pass

# Deprecated cache functions (no longer used)
def cache_get(features: list[float], patient_id: int | None = None, model_version: str = "risk_v1"):
    """Deprecated: Now reads from MySQL via latest_get"""
    return latest_get(patient_id, model_version)

def cache_set(features: list[float], value: float, patient_id: int | None = None, model_version: str = "risk_v1"):
    """Deprecated: Laravel handles writes"""
    pass

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import warnings
import numpy as np
import pandas as pd

load_dotenv()

# Configure logging level via env (default INFO)
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO))

# Initialize FastAPI
app = FastAPI()

# CORS
def _load_cors_origins() -> list[str]:
    # Accept comma-separated list in FRONTEND_ORIGINS, plus single FRONTEND_ORIGIN/LARAVEL_ORIGIN fallbacks
    origins_raw = os.getenv("FRONTEND_ORIGINS", "")
    origins = [o.strip() for o in origins_raw.split(",") if o.strip()]
    fo = os.getenv("FRONTEND_ORIGIN")
    lo = os.getenv("LARAVEL_ORIGIN")
    if fo:
        origins.append(fo.strip())
    if lo:
        origins.append(lo.strip())
    # Sensible default to current Azure URL if nothing provided
    if not origins:
        origins = [
            "https://104384876laravel-cwh4axg4d4h5f0ha.southeastasia-01.azurewebsites.net",
        ]
    # Deduplicate
    dedup: list[str] = []
    for o in origins:
        if o and o not in dedup:
            dedup.append(o)
    logging.info(f"[CORS] allow_origins: {dedup}")
    return dedup

allow_origin_regex = os.getenv("FRONTEND_ORIGIN_REGEX")  # optional regex for wildcard subdomains

app.add_middleware(
    CORSMiddleware,
    allow_origins=_load_cors_origins(),
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Suppress noisy sklearn warning about feature names mismatch
warnings.filterwarnings(
    "ignore",
    message=r"X does not have valid feature names, but .* was fitted with feature names",
)

# --- Lazy-loaded resources ---
_ridge_model = None
_therapy_pathline_model = None
_pinecone_client = None
_pinecone_index = None
_groq_client = None
_embedder = None


def get_ridge_model():
    global _ridge_model
    if _ridge_model is None:
        import joblib, os
        base_dir = os.path.dirname(__file__)
        model_path = os.path.join(base_dir, "lasso_model.pkl")  # Switched to Lasso model
        _ridge_model = joblib.load(model_path)
    return _ridge_model


def get_therapy_model():
    global _therapy_pathline_model
    if _therapy_pathline_model is None:
        import joblib, os
        base_dir = os.path.dirname(__file__)
        model_path = os.path.join(base_dir, "therapy_effectiveness_model.pkl")
        _therapy_pathline_model = joblib.load(model_path)
    return _therapy_pathline_model


def get_pinecone_client():
    global _pinecone_client
    if _pinecone_client is None:
        from pinecone import Pinecone
        api_key = os.getenv("PINECONE_API_KEY")
        if not api_key:
            raise RuntimeError("PINECONE_API_KEY not set")
        _pinecone_client = Pinecone(api_key=api_key)
    return _pinecone_client


def get_pinecone_index():
    global _pinecone_index
    if _pinecone_index is None:
        pc = get_pinecone_client()
        _pinecone_index = pc.Index("medicalbooks-1536")
    return _pinecone_index


def get_groq_client():
    global _groq_client
    if _groq_client is None:
        from groq import Groq
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY not set")
        _groq_client = Groq(api_key=api_key)
    return _groq_client


def get_openai_client():
    # Keep OpenAI lightweight; just set key on demand
    import openai
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        openai.api_key = api_key
    return openai


def get_embedder():
    global _embedder
    if _embedder is None:
        # Lazy import to avoid pulling torch/transformers at startup
        from sentence_transformers import SentenceTransformer
        _embedder = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedder


@app.get("/health")
def health():
    return {"status": "ok"}


# --- Effectiveness helpers (mirror training script semantics where possible) ---
def _improvement_ratio(baseline: float | None, followup: float | None, direction: str) -> float:
    try:
        b = float(baseline) if baseline is not None else float('nan')
        f = float(followup) if followup is not None else float('nan')
    except Exception:
        return 0.0
    if np.isnan(b) or np.isnan(f) or b == 0:
        return 0.0
    change = f - b
    if direction == "down":
        change = -change
    ratio = change / abs(b)
    return float(np.clip(ratio, -1.0, 1.0))


def compute_effectiveness_from_patient(p: "PatientData") -> dict:
    """Compute overall effectiveness similar to therapy_effectiveness_final.py
    using available fields. Where training used FPG, map to FVG; missing metrics
    are treated as neutral (0 contribution).
    """
    # Map available fields
    HbA1c1 = getattr(p, 'hba1c1', None)
    HbA1c3 = getattr(p, 'hba1c3', None)
    FPG1   = getattr(p, 'fvg1', None)  # map FPG -> FVG in deployment schema
    FPG3   = getattr(p, 'fvg3', None)
    BMI1   = getattr(p, 'bmi1', None)
    BMI3   = getattr(p, 'bmi3', None)
    SBP    = getattr(p, 'sbp', None)
    DBP    = getattr(p, 'dbp', None)
    eGFR1  = getattr(p, 'egfr1', None)
    eGFR3  = getattr(p, 'egfr3', None)
    # Fallback: single egfr value if individual visits not available
    if eGFR1 is None and hasattr(p, 'egfr'):
        eGFR1 = getattr(p, 'egfr')
    if eGFR3 is None and hasattr(p, 'egfr'):
        eGFR3 = getattr(p, 'egfr')
    UACR1  = getattr(p, 'uacr1', None)
    UACR3  = getattr(p, 'uacr3', None)
    DDS1   = getattr(p, 'dds1', None)
    DDS3   = getattr(p, 'dds3', None)

    comps: dict[str, float] = {}
    comps["HbA1c"]    = _improvement_ratio(HbA1c1, HbA1c3, "down")
    comps["FPG"]      = _improvement_ratio(FPG1,   FPG3,   "down")
    comps["BMI"]      = _improvement_ratio(BMI1,   BMI3,   "down")
    comps["SBP"]      = _improvement_ratio(SBP,    SBP,    "down")  # single
    comps["DBP"]      = _improvement_ratio(DBP,    DBP,    "down")  # single
    comps["eGFR"]     = _improvement_ratio(eGFR1,  eGFR3,  "up")
    comps["UACR"]     = _improvement_ratio(UACR1,  UACR3,  "down")
    comps["Distress"] = _improvement_ratio(DDS1,   DDS3,   "down")

    weights = {"HbA1c":0.30,"FPG":0.20,"BMI":0.10,"SBP":0.05,"DBP":0.05,"eGFR":0.10,"UACR":0.10,"Distress":0.10}
    raw = sum(weights[k] * comps.get(k, 0.0) for k in weights)
    score = float(np.clip((raw + 1.0) / 2.0, 0.0, 1.0))
    label = "Effective" if score >= 0.5 else "Not Effective"
    return {"score": score, "label": label, "components": comps}


def get_openai_embedding(text: str) -> list:
    try:
        openai = get_openai_client()
        response = openai.embeddings.create(
            model="text-embedding-3-small",
            input=[text]
        )
        return response.data[0].embedding
    except Exception as e:
        print("❌ OpenAI Embedding Error:", e)
        raise

def retrieve_context(query, top_k=3):
    query_vec = get_openai_embedding(query)
    index = get_pinecone_index()
    results = index.query(vector=query_vec, top_k=top_k, include_metadata=True)

    context_chunks = []
    for match in results.get("matches", []):
        metadata = match.get("metadata", {})
        if "text" in metadata:
            context_chunks.append(metadata["text"])
    
    return context_chunks

def generate_rag_response(user_query, patient_context=""):
    try:
        context_chunks = retrieve_context(user_query)
        print("[RAG] Retrieved context:", context_chunks)

        all_context = f"Patient Info:\n{patient_context}\n\nMedical Book Context:\n" + "\n".join(context_chunks)

        prompt = f"""
You are a clinical AI. Only use the information in the provided context.

Context:
{all_context}

User Question:
{user_query}

Instructions:
- Do not guess or fabricate.
- If context lacks a specific answer, say so.
- Mention insulin regimen (e.g. PBD) only if clearly stated in the context.
""".strip()

        groq_client = get_groq_client()
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )

        return {
            "response": response.choices[0].message.content,
            "context_used": all_context
        }

    except Exception as e:
        print("[RAG ERROR]", str(e))
        return {
            "response": "❌ AI backend error: " + str(e),
            "context_used": ""
        }

# Data models
class PredictionRequest(BaseModel):
    features: list[float]
    patient_id: int | None = None
    model_version: str | None = None

class BulkPredictRequest(BaseModel):
    rows: list[list[float]]

class TreatmentRequest(BaseModel):
    patient: dict
    question: str

class PatientChatRequest(BaseModel):
    patient: dict
    query: str

class PatientData(BaseModel):
    # Core fields (nullable for missing data)
    insulin_regimen: str
    hba1c1: float | None
    hba1c2: float | None
    hba1c3: float | None
    hba1c_delta_1_2: float | None
    gap_initial_visit: float | None
    gap_first_clinical: float | None
    egfr: float | None
    reduction_percent: float | None
    fvg1: float | None
    fvg2: float | None
    fvg3: float | None
    fvg_delta_1_2: float | None
    dds1: float | None
    dds3: float | None
    dds_trend_1_3: float | None
    # Therapy model fields (nullable)
    age: float | None
    sex: str
    ethnicity: str
    height_cm: float | None
    weight1: float | None
    weight2: float | None
    weight3: float | None
    bmi1: float | None
    bmi3: float | None
    sbp: float | None
    dbp: float | None
    egfr1: float | None
    egfr3: float | None
    uacr1: float | None
    uacr3: float | None
    gap_1_2_days: float | None
    gap_2_3_days: float | None

class DashboardRequest(BaseModel):
    features: list[float]
    patient_id: int | None = None
    model_version: str | None = None
    patient: dict | None = None  # optional; used for key factor strings

# Routes
@app.post("/predict")
def predict(req: PredictionRequest, force: bool = False):
    try:
        model_version = req.model_version or "risk_v1"

        # Check MySQL for cached prediction (unless force recompute)
        if not force and req.patient_id:
            cached = latest_get(req.patient_id, model_version=model_version)
            if cached is not None:
                return {"prediction": cached, "cached": True, "model_version": model_version}

        # Compute fresh prediction
        m = get_ridge_model()
        input_data = np.array(req.features, dtype=float).reshape(1, -1)
        prediction = float(m.predict(input_data)[0])
        
        # Laravel will save via POST /api/patients/{id}/risk
        return {"prediction": prediction, "cached": False, "model_version": model_version}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")


@app.post("/predict-bulk")
def predict_bulk(req: BulkPredictRequest):
    try:
        m = get_ridge_model()
        if not req.rows:
            return {"predictions": []}

        # Compute all predictions (no caching for bulk endpoint)
        X = np.array(req.rows, dtype=float)
        y = m.predict(X)
        predictions = [float(val) for val in y]

        return {"predictions": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk prediction failed: {e}")

def _risk_label(val: float) -> str:
    if val < 5.7:
        return "Normal"
    if val < 6.5:
        return "At Risk"
    if val < 7.1:
        return "Moderate Risk"
    if val < 8.1:
        return "Risky"
    if val <= 9.0:
        return "Very Risky"
    return "Critical"

def _key_factors_from_patient(patient: dict | None) -> list[str]:
    if not patient:
        return []
    items: list[str] = []
    try:
        hba1c1 = float(patient.get("hba1c_1st_visit")) if patient.get("hba1c_1st_visit") is not None else None
        fvg1 = float(patient.get("fvg_1")) if patient.get("fvg_1") is not None else None
        rad = patient.get("reduction_a_per_day")
        rad = float(rad) if rad is not None else None
        fvg_delta_1_2 = patient.get("fvg_delta_1_2")
        fvg_delta_1_2 = float(fvg_delta_1_2) if fvg_delta_1_2 is not None else None

        if hba1c1 is not None:
            if hba1c1 > 8:
                items.append(f"High initial HbA1c ({hba1c1}%)")
            elif hba1c1 < 5.7:
                items.append(f"Normal initial HbA1c ({hba1c1}%)")
        if fvg1 is not None and fvg1 > 130:
            items.append(f"Elevated FVG @ V1 ({int(fvg1)} mg/dL)")
        if rad is not None and rad < 0.01:
            items.append(f"Low daily HbA1c drop ({rad:.3f})")
        if fvg_delta_1_2 is not None and fvg_delta_1_2 > 0:
            items.append(f"FVG increase between visits (+{fvg_delta_1_2})")
    except Exception:
        # Best-effort only
        pass
    return items[:6]

@app.post("/risk-dashboard")
def risk_dashboard(req: DashboardRequest, force: bool = False):
    try:
        model_version = req.model_version or "risk_v1"

        # 1) Check MySQL for last saved prediction (unless force recalculate)
        if not force and req.patient_id:
            cached_score = latest_get(req.patient_id, model_version=model_version)
            if cached_score is not None:
                label = _risk_label(float(cached_score))
                factors = _key_factors_from_patient(req.patient)
                return {
                    "prediction": float(cached_score),
                    "risk_label": label,
                    "key_factors": factors,
                    "cached": True,
                    "stale": False,
                    "model_version": model_version,
                }

        # 2) No cached value or force=true: compute fresh prediction
        m = get_ridge_model()
        input_data = np.array(req.features, dtype=float).reshape(1, -1)
        prediction_val = float(m.predict(input_data)[0])

        label = _risk_label(prediction_val)
        # Persist fresh score directly to MySQL so future calls hit cache
        if req.patient_id:
            save_latest_to_mysql(int(req.patient_id), prediction_val, label, model_version=model_version)
        factors = _key_factors_from_patient(req.patient)
        return {
            "prediction": prediction_val,
            "risk_label": label,
            "key_factors": factors,
            "cached": False,
            "stale": False,
            "model_version": model_version,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk dashboard failed: {e}")

@app.post("/rag")
async def rag_query(request: Request):
    query = (await request.json())["query"]
    response_text = generate_rag_response(query)
    return {"response": response_text}

@app.post("/treatment-recommendation")
async def treatment_recommendation(request: Request):
    try:
        body = await request.json()
        patient = body["patient"]
        question = body["question"]

        # Serialize patient data as context
        patient_data = "\n".join([f"{k}: {v}" for k, v in patient.items()])
        
        # Combine question with patient context
        full_input = f"{question}\n\nPatient Data:\n{patient_data}"

        # Call Langflow API
        langflow_url = "https://host-langflow.delightfulflower-50ef0bcd.westus2.azurecontainerapps.io/api/v1/run/6c9b582f-d64a-44de-add3-b075a051dccc"
        
        # Get API key from environment variable (try different formats)
        langflow_api_key = os.getenv("LANGFLOW_API_KEY", "")
        langflow_token = os.getenv("LANGFLOW_TOKEN", "")
        
        headers = {
            "Content-Type": "application/json"
        }
        
        # Try different authentication methods
        if langflow_api_key:
            headers["x-api-key"] = langflow_api_key  # Common API key header
        elif langflow_token:
            headers["Authorization"] = f"Bearer {langflow_token}"
        
        payload = {
            "output_type": "chat",
            "input_type": "chat",
            "input_value": full_input,
            "session_id": str(uuid.uuid4())
        }
        
        logging.info("="*80)
        logging.info(f"TREATMENT RECOMMENDATION - Langflow API Call")
        logging.info(f"Headers: {headers}")
        logging.info(f"Payload keys: {list(payload.keys())}")
        logging.info(f"Session ID: {payload['session_id']}")
        logging.info("="*80)
        
        langflow_response = requests.post(langflow_url, json=payload, headers=headers, timeout=90)
        
        logging.info("="*80)
        logging.info(f"LANGFLOW RESPONSE - Status Code: {langflow_response.status_code}")
        logging.info(f"LANGFLOW RESPONSE - Headers: {dict(langflow_response.headers)}")
        logging.info(f"LANGFLOW RESPONSE - Body: {langflow_response.text}")
        logging.info("="*80)
        
        langflow_response.raise_for_status()
        
        result = langflow_response.json()
        
        # Extract response from Langflow output
        response_text = result.get("outputs", [{}])[0].get("outputs", [{}])[0].get("results", {}).get("message", {}).get("text", "No response generated")

        return {
            "response": response_text,
            "context_used": "Langflow API with trained context"
        }

    except Exception as e:
        print("❌ Treatment Recommendation Error:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/treatment-chat")
async def treatment_chat(request: Request):
    try:
        body = await request.json()
        patient = body["patient"]
        question = body["question"]

        # Build patient context
        patient_context = f"""Patient Information:
        - Name: {patient.get('name', 'N/A')}
        - Age: {patient.get('age', 'N/A')} years
        - Gender: {patient.get('gender', 'N/A')}
        - HbA1c (1st visit): {patient.get('hba1c_1st_visit', 'N/A')}%
        - HbA1c (2nd visit): {patient.get('hba1c_2nd_visit', 'N/A')}%
        - HbA1c (3rd visit): {patient.get('hba1c_3rd_visit', 'N/A')}%
        - FVG (1st): {patient.get('fvg_1', 'N/A')} mmol/L
        - FVG (2nd): {patient.get('fvg_2', 'N/A')} mmol/L
        - Insulin Regimen: {patient.get('insulin_regimen_type', 'N/A')}
        - DDS (1st): {patient.get('dds_1', 'N/A')}
        - DDS (3rd): {patient.get('dds_3', 'N/A')}
        - Freq SMBG: {patient.get('freq_smbg', 'N/A')} checks/month
        - Medical History: {patient.get('medical_history', 'N/A')}
        - Current Medications: {patient.get('medications', 'N/A')}
        """

        # Combine patient context with user question
        full_input = f"""{patient_context}

        User Question: {question} 
        """

        # Call Langflow API (SAME URL as treatment-recommendation)
        langflow_url = "https://host-langflow.delightfulflower-50ef0bcd.westus2.azurecontainerapps.io/api/v1/run/6c9b582f-d64a-44de-add3-b075a051dccc"
        
        # Get API key from environment variable
        langflow_api_key = os.getenv("LANGFLOW_API_KEY", "")
        langflow_token = os.getenv("LANGFLOW_TOKEN", "")
        
        headers = {
            "Content-Type": "application/json"
        }
        
        # Try different authentication methods
        if langflow_api_key:
            headers["x-api-key"] = langflow_api_key
        elif langflow_token:
            headers["Authorization"] = f"Bearer {langflow_token}"
        
        payload = {
            "output_type": "chat",
            "input_type": "chat",
            "input_value": full_input,
            "session_id": str(uuid.uuid4())
        }
        
        logging.info("="*80)
        logging.info(f"TREATMENT CHAT - Langflow API Call")
        logging.info(f"Session ID: {payload['session_id']}")
        logging.info("="*80)
        
        langflow_response = requests.post(langflow_url, json=payload, headers=headers, timeout=90)
        
        logging.info("="*80)
        logging.info(f"LANGFLOW RESPONSE - Status Code: {langflow_response.status_code}")
        logging.info("="*80)
        
        langflow_response.raise_for_status()
        
        result = langflow_response.json()
        
        # Extract response from Langflow output
        response_text = result.get("outputs", [{}])[0].get("outputs", [{}])[0].get("results", {}).get("message", {}).get("text", "No response generated")

        return {
            "response": response_text
        }

    except Exception as e:
        print("❌ Treatment Chat Error:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chatbot-patient-query")
async def chatbot_patient_query(req: PatientChatRequest):
    try:
        patient_data = "\n".join([f"{k}: {v}" for k, v in req.patient.items()])
        
        # Combine user query with patient context
        full_input = f"""Patient Context:
{patient_data}

User Question: {req.query}

Please provide a concise, friendly clinical response based on the patient's data and medical knowledge."""

        # Call Langflow API
        langflow_url = "https://host-langflow.delightfulflower-50ef0bcd.westus2.azurecontainerapps.io/api/v1/run/a9c7468e-417c-4289-80b4-0d6bec3d846d"
        
        # Get API key from environment variable (try different formats)
        langflow_api_key = os.getenv("LANGFLOW_API_KEY", "")
        langflow_token = os.getenv("LANGFLOW_TOKEN", "")
        
        headers = {
            "Content-Type": "application/json"
        }
        
        # Try different authentication methods
        if langflow_api_key:
            headers["x-api-key"] = langflow_api_key  # Common API key header
        elif langflow_token:
            headers["Authorization"] = f"Bearer {langflow_token}"
        
        payload = {
            "output_type": "chat",
            "input_type": "chat",
            "input_value": full_input,
            "session_id": str(uuid.uuid4())
        }
        
        logging.info("="*80)
        logging.info(f"CHATBOT QUERY - Langflow API Call")
        logging.info(f"Headers: {headers}")
        logging.info(f"Payload keys: {list(payload.keys())}")
        logging.info(f"Session ID: {payload['session_id']}")
        logging.info("="*80)
        
        langflow_response = requests.post(langflow_url, json=payload, headers=headers, timeout=30)
        
        logging.info("="*80)
        logging.info(f"LANGFLOW RESPONSE - Status Code: {langflow_response.status_code}")
        logging.info(f"LANGFLOW RESPONSE - Headers: {dict(langflow_response.headers)}")
        logging.info(f"LANGFLOW RESPONSE - Body: {langflow_response.text}")
        logging.info("="*80)
        
        langflow_response.raise_for_status()
        
        result = langflow_response.json()
        
        # Extract response from Langflow output
        response_text = result.get("outputs", [{}])[0].get("outputs", [{}])[0].get("results", {}).get("message", {}).get("text", "No response generated")
        
        return {"response": response_text}
        
    except Exception as e:
        print("❌ Chatbot Query Error:", e)
        raise HTTPException(status_code=500, detail=str(e))


def _forecast_hba1c_simple(hba1c_values: list[float], steps: int = 2) -> list[float]:
    """Lightweight linear forecast for HbA1c (mirrors script's fallback for <3 visits)"""
    valid = [v for v in hba1c_values if not np.isnan(v)]
    if len(valid) < 2:
        return [np.nan] * steps
    x = np.arange(len(valid), dtype=float)
    a, b = np.polyfit(x, valid, 1)
    future_x = np.arange(len(valid), len(valid) + steps, dtype=float)
    return [float(a * fx + b) for fx in future_x]


@app.post("/predict-therapy-pathline")
def predict_therapy_pathline(data: PatientData):
    try:
        # Build complete DataFrame with all training columns
        # Map categorical values to match training data
        # Handle both uppercase database values and model-expected values
        sex_map = {
            'MALE': 'Male', 'FEMALE': 'Female', 'M': 'Male', 'F': 'Female',
            'Male': 'Male', 'Female': 'Female',
            '0': 'Male', '1': 'Female'
        }
        ethnicity_map = {
            # Map database ethnicities to model's expected categories
            'CAUCASIAN': 'Others', 'AFRICAN': 'Others', 'HISPANIC': 'Others', 'ASIAN': 'Chinese',
            'Caucasian': 'Others', 'African': 'Others', 'Hispanic': 'Others', 'Asian': 'Chinese',
            # Model's original categories
            'Chinese': 'Chinese', 'Malay': 'Malay', 'Indian': 'Indian', 'Others': 'Others',
            '0': 'Chinese', '1': 'Malay', '2': 'Indian', '3': 'Others'
        }
        
        sex_value = sex_map.get(str(data.sex).upper() if data.sex else '', 'Male')
        ethnicity_value = ethnicity_map.get(str(data.ethnicity).upper() if data.ethnicity else '', 'Chinese')
        
        patient_dict = {
            'Age': [data.age if data.age is not None else np.nan],
            'Sex': [sex_value],
            'Ethnicity': [ethnicity_value],
            'Height_cm': [data.height_cm if data.height_cm is not None else np.nan],
            'Weight1': [data.weight1 if data.weight1 is not None else np.nan],
            'Weight2': [data.weight2 if data.weight2 is not None else np.nan],
            'Weight3': [data.weight3 if data.weight3 is not None else np.nan],
            'BMI1': [data.bmi1 if data.bmi1 is not None else np.nan],
            'BMI3': [data.bmi3 if data.bmi3 is not None else np.nan],
            'Regimen1': [data.insulin_regimen],
            'Regimen2': [data.insulin_regimen],
            'Regimen3': [data.insulin_regimen],
            'HbA1c1': [data.hba1c1],
            'HbA1c2': [data.hba1c2],
            'HbA1c3': [data.hba1c3],
            'FPG1': [data.fvg1],
            'FPG2': [data.fvg2],
            'FPG3': [data.fvg3],
            'SBP': [data.sbp if data.sbp is not None else np.nan],
            'DBP': [data.dbp if data.dbp is not None else np.nan],
            'eGFR1': [data.egfr1 if data.egfr1 is not None else data.egfr],
            'eGFR3': [data.egfr3 if data.egfr3 is not None else data.egfr],
            'UACR1': [data.uacr1 if data.uacr1 is not None else np.nan],
            'UACR3': [data.uacr3 if data.uacr3 is not None else np.nan],
            'DDS1': [data.dds1],
            'DDS3': [data.dds3],
            'Gap_1_2_days': [data.gap_1_2_days if data.gap_1_2_days is not None else np.nan],
            'Gap_2_3_days': [data.gap_2_3_days if data.gap_2_3_days is not None else np.nan],
        }

        df = pd.DataFrame(patient_dict)
        tm = get_therapy_model()
        
        # Model probability (single row, matches script)
        model_probability = float(tm.predict_proba(df)[0][1])

        # Effectiveness (matches script compute_effectiveness)
        eff = compute_effectiveness_from_patient(data)

        # Forecast HbA1c (matches script forecast_metric)
        hba1c_series = [data.hba1c1, data.hba1c2, data.hba1c3]
        forecast_vals = _forecast_hba1c_simple(hba1c_series, steps=2)

        # LLM summary (matches script llm_analysis prompt structure)
        hb = [data.hba1c1, data.hba1c2, data.hba1c3]
        regimen = data.insulin_regimen
        pred_text = f"""Therapy effectiveness score: {eff['score']:.2f} ({eff['label']}).
HbA1c across visits: {', '.join(f"{x:.2f}" for x in hb if not np.isnan(x))}.
Forecast HbA1c next visits: {', '.join(f"{x:.2f}" for x in forecast_vals if not np.isnan(x))}.
Regimen: {regimen}."""

        # Fallback if no GROQ_API_KEY
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            trend = "improving" if eff["components"]["HbA1c"] > 0 else ("worsening" if eff["components"]["HbA1c"] < 0 else "flat")
            recs = []
            if eff["score"] < 0.5:
                recs.append("consider regimen intensification or adherence review")
            else:
                recs.append("continue current regimen with monitoring")
            if data.sbp >= 140 or data.dbp >= 90:
                recs.append("optimize blood pressure control")
            if data.uacr3 >= 30:
                recs.append("monitor albuminuria and kidney function")
            summary = f"Glycemic trend is {trend}. Overall therapy appears {eff['label'].lower()} (score {eff['score']:.2f}). Recommendation: " + "; ".join(recs) + "."
        else:
            try:
                prompt = f"""You are a helpful medical assistant.
Summarize the patient's trajectory and give a concise, clinically-relevant recommendation (<120 words).

{pred_text}"""
                groq_client = get_groq_client()
                chat = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": "You are a helpful medical AI assistant."},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.2,
                    max_tokens=220,
                )
                summary = chat.choices[0].message.content.strip()
            except Exception as e:
                summary = f"(LLM unavailable) {str(e)}"

        # Match script output structure
        return {
            "patient_id": None,  # not passed in request, can add if needed
            "effectiveness": eff,
            "model_probability": round(model_probability, 4),
            "forecast_hba1c": [round(f, 2) if not np.isnan(f) else None for f in forecast_vals],
            "summary": summary,
        }

    except Exception as e:
        print("❌ LLM Pathline Error:", e)
        raise HTTPException(status_code=500, detail=str(e))
