from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from flask_cors import CORS  # 👈 added
import numpy as np
import os

# 🔹 Initialize Flask app
app = Flask(__name__)

# 🔹 Enable CORS only for your frontend
CORS(app, origins=["http://localhost:8080"])  # 👈 important

# 🔹 Load your trained model once when the server starts
model_path = 'ecg_image.h5'  # Replace with your actual model path
model = load_model(model_path)

# 🔹 Define class labels (must match training)
classes = [
    'ECG Images of Myocardial Infarction Patients (240x12=2880)',
    'ECG Images of Patient that have History of MI (172x12=2064)',
    'ECG Images of Patient that have abnormal heartbeat (233x12=2796)',
    'Normal Person ECG Images (284x12=3408)'
]

@app.route('/')
def home():
    return "Welcome to ECG Image Classification Backend! Use POST /predict with an ECG image file."

# 🔹 API endpoint for prediction
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # 🔹 Save the uploaded file temporarily
        os.makedirs("temp", exist_ok=True)
        file_path = os.path.join("temp", file.filename)
        file.save(file_path)

        # 🔹 Load and preprocess the image
        img = image.load_img(file_path, target_size=(224, 224))  # Adjust if model input differs
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0  # same normalization as during training

        # 🔹 Predict
        predictions = model.predict(img_array)

        # 🔹 Handle multi-output models
        if isinstance(predictions, list):
            predictions = predictions[0]

        predictions = np.array(predictions)

        # 🔹 Check prediction shape
        if predictions.size == 0 or predictions.shape[-1] != len(classes):
            os.remove(file_path)
            return jsonify({'error': 'Prediction shape mismatch'}), 500

        predicted_class_index = int(np.argmax(predictions[0]))
        predicted_class = classes[predicted_class_index]

        # 🔹 Clean up temporary file
        os.remove(file_path)

        # 🔹 Return JSON response
        return jsonify({
            'predicted_class': predicted_class,
            'confidence_scores': predictions[0].tolist()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 🔹 Run the Flask app (Render-ready)
if __name__ == '__main__':
    # Use Render's PORT environment variable, fallback to 10000
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=False)