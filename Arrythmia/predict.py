import numpy as np
from tensorflow.keras.models import load_model
import wfdb

model = load_model('arrhythmia_cnn.h5')

# Example: load record 200, take first 1-sec window
record = wfdb.rdrecord('mitdb/107', channels=[0])
ecg_segment = record.p_signal[:360].flatten()  # First second

# Preprocess
ecg_segment = ecg_segment.reshape(1, 360, 1)

# Predict
prob = model.predict(ecg_segment)[0][0]
risk = "High risk of dangerous arrhythmia" if prob > 0.5 else "Normal rhythm"

print(f"Prediction: {risk} (Probability: {prob:.2f})")