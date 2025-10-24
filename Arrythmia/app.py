import os
import tempfile
import numpy as np
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import wfdb

app = Flask(__name__)

# Load model once at startup
model = load_model('arrhythmia_cnn.h5')
print("✅ Model loaded!")

# 👇 Add this new route for the home page
@app.route('/')
def home():
    return "Welcome to Heart Arrhythmia Prediction Backend! Use POST /predict with .dat and .hea files."

@app.route('/predict/arrythmia/', methods=['POST'])
def predict():
    try:
        if 'dat' not in request.files or 'hea' not in request.files:
            return jsonify({"error": "Please upload both .dat and .hea files"}), 400

        dat_file = request.files['dat']
        hea_file = request.files['hea']

        if not (dat_file.filename.endswith('.dat') and hea_file.filename.endswith('.hea')):
            return jsonify({"error": "Files must have .dat and .hea extensions"}), 400

        base_name = dat_file.filename.rsplit('.', 1)[0]
        if base_name != hea_file.filename.rsplit('.', 1)[0]:
            return jsonify({"error": "File names must match (e.g., 107.dat and 107.hea)"}), 400

        with tempfile.TemporaryDirectory() as tmpdir:
            dat_path = os.path.join(tmpdir, dat_file.filename)
            hea_path = os.path.join(tmpdir, hea_file.filename)
            dat_file.save(dat_path)
            hea_file.save(hea_path)

            record = wfdb.rdrecord(os.path.join(tmpdir, base_name), channels=[0])
            signal = record.p_signal.flatten()

            if len(signal) < 360:
                return jsonify({"error": "ECG signal too short (< 1 second)"}), 400

            ecg_segment = signal[:360].reshape(1, 360, 1)
            prob = model.predict(ecg_segment, verbose=0)[0][0]
            risk = "High risk of dangerous arrhythmia" if prob > 0.5 else "Normal rhythm"

            return jsonify({
                "prediction": risk,
                "probability": float(prob),
                "record_id": base_name,
                "message": "⚠️ High risk: Consult cardiologist immediately." if prob > 0.5 else "✅ Low risk: Normal rhythm detected."
            })

    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)