import numpy as np
from tensorflow.keras.models import load_model
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Step 1: Load test data (you must have X_test, y_test saved or re-created)
# Option A: Re-split the data (same as in training)
X = np.load('X.npy')
y = np.load('y.npy')
X = X.reshape(X.shape[0], X.shape[1], 1)

from sklearn.model_selection import train_test_split
_, X_test, _, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

# Step 2: Load the saved model
model = load_model('arrhythmia_cnn.h5')

# Step 3: Predict on test set
y_pred = (model.predict(X_test) > 0.5).astype("int32")

# Step 4: Evaluate
test_acc = accuracy_score(y_test, y_pred)
print(f"Test Accuracy: {test_acc:.4f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Normal', 'Abnormal']))