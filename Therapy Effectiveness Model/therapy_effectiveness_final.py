from __future__ import annotations

import os, textwrap, warnings, json, glob
from typing import Dict, Any, Optional, Tuple

import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tools.sm_exceptions import ValueWarning as SMValueWarning
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from dotenv import load_dotenv

# Silence non-actionable warnings
warnings.filterwarnings("ignore", category=SMValueWarning)
warnings.filterwarnings("ignore", message="Too few observations")
warnings.filterwarnings("ignore", message="No supported index is available")

# --- Paths ---
CANDIDATE_CSV = [
    "/content/therapy_effectiveness_synthetic.csv",
    "/content/sample_data/therapy_effectiveness_synthetic.csv",
    "/mnt/data/therapy_effectiveness_synthetic.csv", 
]
PIPELINE_PATH = "/content/therapy_effectiveness_pipeline.pkl"
PLOTS_DIR = "/content/plots"
os.makedirs(PLOTS_DIR, exist_ok=True)

def _find_csv() -> str:
    for p in CANDIDATE_CSV:
        if os.path.exists(p):
            return p
    # Last resort: scan content
    matches = glob.glob("/content/**/*.csv", recursive=True)
    if matches:
        return matches[0]
    raise FileNotFoundError(
        "CSV not found. Upload 'therapy_effectiveness_synthetic.csv' to /content and re-run."
    )

CSV_PATH = _find_csv()

# --- Data ---
def load_dataset(path: str = CSV_PATH) -> pd.DataFrame:
    df = pd.read_csv(path)
    for c in ["VisitDate1", "VisitDate2", "VisitDate3"]:
        if c in df.columns:
            df[c] = pd.to_datetime(df[c])
    return df

# --- Model ---
def build_model(df: pd.DataFrame) -> Pipeline:
    df_model = df.drop(columns=["Patient_ID", "VisitDate1", "VisitDate2", "VisitDate3"])
    X = df_model.drop(columns=["Therapy_Effective"])
    y = df_model["Therapy_Effective"]

    num_cols = X.select_dtypes(include=["int64", "float64"]).columns.tolist()
    cat_cols = X.select_dtypes(include=["object"]).columns.tolist()

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(drop="first", handle_unknown="ignore"), cat_cols),
        ]
    )
    pipe = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(n_estimators=200, random_state=42)),
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    pipe.fit(X_train, y_train)
    # Optional metrics - not printed to avoid noise
    _ = classification_report(y_test, pipe.predict(X_test))
    _ = roc_auc_score(y_test, pipe.predict_proba(X_test)[:, 1])

    joblib.dump(pipe, PIPELINE_PATH)
    return pipe

def load_or_train_model(df: pd.DataFrame) -> Pipeline:
    if os.path.exists(PIPELINE_PATH):
        try:
            return joblib.load(PIPELINE_PATH)
        except Exception:
            pass
    return build_model(df)

# --- Effectiveness ---
def _improvement_ratio(baseline: float, followup: float, direction: str) -> float:
    if pd.isna(baseline) or pd.isna(followup) or baseline == 0:
        return 0.0
    change = followup - baseline
    if direction == "down":
        change = -change
    ratio = change / abs(baseline)
    return float(np.clip(ratio, -1.0, 1.0))

def compute_effectiveness(df_row: pd.Series) -> dict:
    comps: Dict[str, float] = {}
    comps["HbA1c"]    = _improvement_ratio(df_row.get("HbA1c1"), df_row.get("HbA1c3"), "down")
    comps["FPG"]      = _improvement_ratio(df_row.get("FPG1"),   df_row.get("FPG3"),   "down")
    comps["BMI"]      = _improvement_ratio(df_row.get("BMI1"),   df_row.get("BMI3"),   "down")
    comps["SBP"]      = _improvement_ratio(df_row.get("SBP"),    df_row.get("SBP"),    "down")  # single
    comps["DBP"]      = _improvement_ratio(df_row.get("DBP"),    df_row.get("DBP"),    "down")  # single
    comps["eGFR"]     = _improvement_ratio(df_row.get("eGFR1"),  df_row.get("eGFR3"),  "up")
    comps["UACR"]     = _improvement_ratio(df_row.get("UACR1"),  df_row.get("UACR3"),  "down")
    comps["Distress"] = _improvement_ratio(df_row.get("DDS1"),   df_row.get("DDS3"),   "down")

    weights = {"HbA1c":0.30,"FPG":0.20,"BMI":0.10,"SBP":0.05,"DBP":0.05,"eGFR":0.10,"UACR":0.10,"Distress":0.10}
    raw = sum(weights[k] * comps[k] for k in weights)
    score = float(np.clip((raw + 1.0) / 2.0, 0.0, 1.0))
    label = "Effective" if score >= 0.5 else "Not Effective"
    return {"score": score, "label": label, "components": comps}

# --- Forecast + Plot ---
def _coerce_monthly_index(idx_like) -> tuple[pd.DatetimeIndex, str]:
    idx = pd.DatetimeIndex(idx_like)
    inferred = pd.infer_freq(idx)
    if inferred is None:
        freq = "ME"
        start = idx.min() if len(idx) else pd.Timestamp("2023-01-31")
        idx = pd.date_range(start=start, periods=len(idx_like), freq=freq)
    else:
        freq = "ME" if inferred.endswith("M") and not inferred.endswith("MS") else inferred
        if freq.endswith("M") and not freq.endswith("MS"):
            freq = "ME"
        idx = pd.date_range(start=idx.min(), periods=len(idx_like), freq=freq)
    return idx, freq

def forecast_metric(series: pd.Series, steps: int = 2) -> tuple[pd.Series, pd.DataFrame]:
    series = series.dropna()
    if series.empty:
        idx = pd.date_range("2023-03-31", periods=steps, freq="ME")
        return pd.Series([np.nan]*steps, index=idx), pd.DataFrame({"lower": np.nan, "upper": np.nan}, index=idx)

    idx, freq = _coerce_monthly_index(series.index)
    series = pd.Series(series.values, index=idx)

    if len(series) < 3:
        x = np.arange(len(series), dtype=float)
        a, b = np.polyfit(x, series.values, 1)
        future_x = np.arange(len(series), len(series) + steps, dtype=float)
        fc_vals = a * future_x + b
        fc_idx = pd.date_range(series.index[-1] + pd.tseries.frequencies.to_offset("ME"), periods=steps, freq="ME")
        fc = pd.Series(fc_vals, index=fc_idx)
        ci = pd.DataFrame({"lower": np.nan, "upper": np.nan}, index=fc_idx)
        return fc, ci

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        model = SARIMAX(series, order=(1,1,1), seasonal_order=(0,0,0,0),
                        trend="c", enforce_stationarity=False, enforce_invertibility=False)
        res = model.fit(disp=False)
        fc = res.get_forecast(steps=steps)
        ci = fc.conf_int()

    fc_idx = pd.date_range(series.index[-1] + pd.tseries.frequencies.to_offset("ME"), periods=steps, freq="ME")
    fc_series = pd.Series(np.asarray(fc.predicted_mean), index=fc_idx)
    ci = pd.DataFrame({"lower": np.asarray(ci.iloc[:, 0]), "upper": np.asarray(ci.iloc[:, 1])}, index=fc_idx)
    return fc_series, ci

def make_patient_plot(df_row: pd.Series, patient_id: int, out_path: str) -> str:
    idx = []
    for c in ["VisitDate1", "VisitDate2", "VisitDate3"]:
        val = df_row.get(c)
        idx.append(pd.to_datetime(val) if not pd.isna(val) else None)
    if any(v is None or pd.isna(v) for v in idx):
        idx = pd.date_range("2023-01-31", periods=3, freq="ME")
    idx, _ = _coerce_monthly_index(idx)

    series_hba1c = pd.Series([df_row.get("HbA1c1"), df_row.get("HbA1c2"), df_row.get("HbA1c3")], index=idx)
    series_fpg   = pd.Series([df_row.get("FPG1"),   df_row.get("FPG2"),   df_row.get("FPG3")], index=idx)

    fc, ci = forecast_metric(series_hba1c, steps=2)

    plt.figure(figsize=(9, 5))
    plt.plot(series_hba1c, marker="o", label="HbA1c")
    plt.plot(series_fpg,   marker="o", linestyle="--", label="FPG")
    plt.plot(fc, marker="x", linestyle="--", label="HbA1c forecast")
    try:
        plt.fill_between(ci.index, ci["lower"], ci["upper"], alpha=0.2)
    except Exception:
        pass
    plt.title(f"Patient {patient_id} — Glycemic Trend and Forecast")
    plt.xlabel("Visit Date"); plt.ylabel("Value")
    plt.legend(); plt.grid(True); plt.tight_layout()
    plt.savefig(out_path); plt.close()
    return out_path

# --- LLM summary (Groq) ---
def llm_analysis(df_row: pd.Series, eff: dict, forecast_vals: Optional[pd.Series]) -> str:
    load_dotenv("/mnt/data/therapy_effectiveness_llm.env")  
    api_key = os.getenv("GROQ_API_KEY")

    hb = [df_row.get("HbA1c1"), df_row.get("HbA1c2"), df_row.get("HbA1c3")]
    regimen = df_row.get("Regimen1")
    pred_text = textwrap.dedent(f"""
    Therapy effectiveness score: {eff['score']:.2f} ({eff['label']}).
    HbA1c across visits: {', '.join(f"{x:.2f}" for x in hb if not pd.isna(x))}.
    Forecast HbA1c next visits: {', '.join(f"{x:.2f}" for x in (forecast_vals.values.tolist() if forecast_vals is not None else []) if not pd.isna(x))}.
    Regimen: {regimen}.
    """).strip()

    if not api_key:
        trend = "improving" if eff["components"]["HbA1c"] > 0 else ("worsening" if eff["components"]["HbA1c"] < 0 else "flat")
        recs = []
        if eff["score"] < 0.5: recs.append("consider regimen intensification or adherence review")
        else: recs.append("continue current regimen with monitoring")
        if df_row.get("SBP", np.nan) >= 140 or df_row.get("DBP", np.nan) >= 90: recs.append("optimize blood pressure control")
        if df_row.get("UACR3", np.nan) >= 30: recs.append("monitor albuminuria and kidney function")
        return f"Glycemic trend is {trend}. Overall therapy appears {eff['label'].lower()} (score {eff['score']:.2f}). Recommendation: " + "; ".join(recs) + "."

    try:
        from groq import Groq
    except ImportError:
        return "LLM not enabled: install with `pip install groq` and set GROQ_API_KEY in env"

    try:
        client = Groq(api_key=api_key)
        prompt = (
            "You are a helpful medical assistant.\n"
            "Summarize the patient's trajectory and give a concise, clinically-relevant recommendation (<120 words).\n\n"
            + pred_text
        )
        chat = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful medical AI assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=220,
        )
        return chat.choices[0].message.content.strip()
    except Exception as e:
        return f"(LLM unavailable) {str(e)}"

# --- Orchestration ---
def _get_row_by_patient_id(df: pd.DataFrame, patient_id: int):
    m = df[df["Patient_ID"] == patient_id]
    return None if m.empty else m.iloc[0]

def run_for_patient_id(patient_id: int) -> Dict[str, Any]:
    df = load_dataset(CSV_PATH)
    row = _get_row_by_patient_id(df, patient_id)
    if row is None:
        raise ValueError(f"Patient_ID {patient_id} not found")

    pipe = load_or_train_model(df)

    df_model = df.drop(columns=["Patient_ID", "VisitDate1", "VisitDate2", "VisitDate3"])
    X = df_model.drop(columns=["Therapy_Effective"])
    row_df = pd.DataFrame([{col: row.get(col, np.nan) for col in X.columns}])[X.columns]
    model_prob = float(pipe.predict_proba(row_df)[0][1])

    eff = compute_effectiveness(row)

    out_plot = os.path.join(PLOTS_DIR, f"patient_{patient_id}_glycemic_trend.png")
    fc_vals, _ = forecast_metric(
        pd.Series([row.get("HbA1c1"), row.get("HbA1c2"), row.get("HbA1c3")],
                  index=[row.get("VisitDate1"), row.get("VisitDate2"), row.get("VisitDate3")])
    )
    plot_path = make_patient_plot(row, int(patient_id), out_plot)
    summary = llm_analysis(row, eff, fc_vals)
    return {
        "patient_id": int(patient_id),
        "effectiveness": eff,
        "model_probability": model_prob,
        "plot_path": plot_path,
        "summary": summary,
    }
