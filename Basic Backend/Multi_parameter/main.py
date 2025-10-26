import pandas as pd
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Any, List

# --- Constants ---
MIN_HISTORY_SIZE = 5  # Min rows needed to start predicting (from our 5-min window)
MAX_HISTORY_SIZE = 100 # Max rows to keep in memory per patient

# --- Pydantic Models (API Data Contracts) ---

# This Pydantic model defines the *input* your API will accept.
# We use clean JSON names (like 'hr_bpm') instead of 'HR [bpm]'.
class VitalsInput(BaseModel):
    delta_qtc_msec: float = Field(..., alias='DeltaQTc [msec]')
    hr_bpm: float = Field(..., alias='HR [bpm]')
    nbpd_mmhg: float = Field(..., alias='NBPd [mmHg]')
    nbpm_mmhg: float = Field(..., alias='NBPm [mmHg]')
    nbps_mmhg: float = Field(..., alias='NBPs [mmHg]')
    pvc_per_min: float = Field(..., alias='PVC [/min]')
    perf_nu: float = Field(..., alias='Perf [NU]')
    pulse_nbp_bpm: float = Field(..., alias='Pulse (NBP) [bpm]')
    pulse_spo2_bpm: float = Field(..., alias='Pulse (SpO2) [bpm]')
    qt_msec: float = Field(..., alias='QT [msec]')
    qt_hr_bpm: float = Field(..., alias='QT-HR [bpm]')
    qtc_msec: float = Field(..., alias='QTc [msec]')
    rr_rpm: float = Field(..., alias='RR [rpm]')
    st_iii_mm: float = Field(..., alias='ST-III [mm]')
    st_v_mm: float = Field(..., alias='ST-V [mm]')
    spo2_percent: float = Field(..., alias='SpO2 [%]')
    btbhr_bpm: float = Field(..., alias='btbHR [bpm]')

    class Config:
        # This allows you to send JSON with the 'dirty' names too
        populate_by_name = True

# This model defines the *output* your API will send back.
class PredictionResponse(BaseModel):
    patient_id: str
    timestamp: datetime
    risk_probability: float
    predicted_class: int
    status_message: str

# --- In-Memory Patient History ---
# In a production system, you would replace this with a database (like Redis or InfluxDB).
# This dict will store: {'patient_001': DataFrame, 'patient_002': DataFrame}
patient_histories: Dict[str, pd.DataFrame] = {}

# --- Feature Engineering Function ---
# This MUST be identical to the function used in training.
def create_timeseries_features(df: pd.DataFrame) -> pd.DataFrame:
    """Engineers time-series features for a single patient's DataFrame."""
    # Ensure dataframe is sorted by time
    df = df.sort_values(by='time')
    
    vitals = ['HR [bpm]', 'SpO2 [%]', 'NBPs [mmHg]', 'RR [rpm]']
    
    for col in vitals:
        df[f'{col}_lag_1'] = df[col].shift(1)
        df[f'{col}_roll_avg_5'] = df[col].rolling(window=5, min_periods=1).mean()
        df[f'{col}_roll_std_5'] = df[col].rolling(window=5, min_periods=1).std()
        
    return df

# --- FastAPI Application ---
app = FastAPI(
    title="Cardiac Arrest Prediction API",
    description="A real-time API to predict cardiac arrest risk from time-series vital signs.",
    version="1.0.0"
)

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# --- Startup Event: Load Models ---
@app.on_event("startup")
def load_model_assets():
    """Load all model assets from disk into memory on startup."""
    print("--- Loading model assets ---")
    try:
        app.state.model = joblib.load('ts_prediction_model.joblib')
        app.state.scaler = joblib.load('ts_prediction_scaler.joblib')
        app.state.feature_cols = joblib.load('ts_feature_columns.joblib')
        print("✅ Model, scaler, and feature list loaded successfully.")
    except FileNotFoundError:
        print("❌ CRITICAL ERROR: Could not find one or more .joblib files.")
        print("   Make sure 'ts_prediction_model.joblib', 'ts_prediction_scaler.joblib',")
        print("   and 'ts_feature_columns.joblib' are in the same folder as main.py.")
        # In a real app, you might want to exit here
        # exit(1)
    except Exception as e:
        print(f"❌ CRITICAL ERROR: An error occurred during model loading: {e}")
        # exit(1)


# --- API Endpoint: /predict/{patient_id} ---
@app.post("/predict/{patient_id}", response_model=PredictionResponse)
async def predict_risk(patient_id: str, vitals: VitalsInput):
    """
    Accepts new vital signs for a patient, updates their history,
    and returns the latest risk prediction.
    """
    if not hasattr(app.state, 'model'):
        raise HTTPException(status_code=500, detail="Model assets not loaded. Check server logs.")

    current_time = datetime.utcnow()
    
    # 1. Convert Pydantic model to a dict with original column names
    # .dict(by_alias=True) uses the 'alias' fields we defined
    new_data_dict = vitals.dict(by_alias=True)
    new_data_dict['time'] = current_time
    new_row_df = pd.DataFrame([new_data_dict])

    # 2. Get or create patient history
    if patient_id not in patient_histories:
        patient_histories[patient_id] = pd.DataFrame()
    
    history_df = patient_histories[patient_id]
    
    # 3. Append new data and prune history
    history_df = pd.concat([history_df, new_row_df], ignore_index=True)
    # Keep only the last MAX_HISTORY_SIZE rows
    if len(history_df) > MAX_HISTORY_SIZE:
        history_df = history_df.iloc[-MAX_HISTORY_SIZE:]
    
    # Update the history in our "database"
    patient_histories[patient_id] = history_df
    
    # 4. Check if we have enough data to predict
    if len(history_df) < MIN_HISTORY_SIZE:
        return PredictionResponse(
            patient_id=patient_id,
            timestamp=current_time,
            risk_probability=0.0,
            predicted_class=0,
            status_message=f"Gathering initial data ({len(history_df)}/{MIN_HISTORY_SIZE} rows)"
        )

    # 5. Perform Prediction
    try:
        # Create features on a copy of the history
        engineered_df = create_timeseries_features(history_df.copy())
        
        # Get the *last row* (which has all features)
        prediction_row = engineered_df.iloc[[-1]]
        
        # Fill any NaNs (from std dev on first few rows)
        prediction_row = prediction_row.fillna(0)
        
        # Ensure columns are in the *exact* order
        final_data = prediction_row[app.state.feature_cols]
        
        # Scale the data
        final_data_scaled = app.state.scaler.transform(final_data)
        
        # Make predictions
        prediction_class = app.state.model.predict(final_data_scaled)[0]
        prediction_proba = app.state.model.predict_proba(final_data_scaled)[0]
        
        risk_prob = prediction_proba[1] # Probability of Class 1 (Positive)
        
        return PredictionResponse(
            patient_id=patient_id,
            timestamp=current_time,
            risk_probability=float(risk_prob),
            predicted_class=int(prediction_class),
            status_message="Prediction complete"
        )
        
    except Exception as e:
        # This catches errors during feature engineering or prediction
        raise HTTPException(status_code=500, detail=f"Error during prediction: {str(e)}")

# --- Root Endpoint (for health check) ---
@app.get("/")
def read_root():
    return {"status": "Cardiac Arrest Prediction API is running"}

# --- OPTIONS endpoint for CORS preflight ---
@app.options("/predict/{patient_id}")
async def options_predict(patient_id: str):
    return {"message": "OK"}