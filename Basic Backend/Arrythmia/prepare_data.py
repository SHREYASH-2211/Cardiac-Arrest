import wfdb
import numpy as np
import os

# Define label mapping (binary: 0=normal, 1=abnormal)
label_map = {
    'N': 0, 'L': 0, 'R': 0, 'B': 0, 'A': 0, 'a': 0, 'J': 0, 'S': 0, 'j': 0,
    'V': 1, 'E': 1, 'F': 1,  # PVCs, VF risk
    '/': 2, 'Q': 2, 'f': 2   # Ignore noise/unknown
}

# Get all record names (from RECORDS file or list)
record_names = [f.replace('.dat', '') for f in os.listdir('mitdb') if f.endswith('.dat')]

X, y = [], []

for rec in record_names:
    try:
        # Load signal (use MLII = channel 0 if available)
        record = wfdb.rdrecord(f'mitdb/{rec}', channels=[0])
        ann = wfdb.rdann(f'mitdb/{rec}', 'atr')
        signal = record.p_signal.flatten()
        
        for i, sample in enumerate(ann.sample):
            sym = ann.symbol[i]
            if sym not in label_map or label_map[sym] == 2:
                continue  # Skip unknown/noise
            
            # Extract 1-second window centered on R-peak
            win_len = 360  # 1 sec at 360 Hz
            start = sample - win_len // 2
            end = sample + win_len // 2
            
            if start >= 0 and end < len(signal):
                X.append(signal[start:end])
                y.append(label_map[sym])
                
    except Exception as e:
        print(f"Skipped {rec}: {e}")

X = np.array(X)
y = np.array(y)

print(f"Dataset shape: {X.shape}, Labels: {np.bincount(y)}")
# Save for reuse
np.save('X.npy', X)
np.save('y.npy', y)