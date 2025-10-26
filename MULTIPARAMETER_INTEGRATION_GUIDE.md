# Multi-Parameter Integration Guide

## 🎯 Overview

This guide explains how to connect the frontend upload multiparameter functionality with the backend multiparameter system for real-time cardiac arrest prediction.

## 🏗️ Architecture

### Backend (FastAPI)
- **Location**: `Basic Backend/Multi_parameter/main.py`
- **Port**: 8001
- **Features**:
  - Real-time cardiac arrest prediction
  - Time-series feature engineering
  - Patient history management
  - JWT-based authentication (optional)

### Frontend (React + TypeScript)
- **API Service**: `frontend/src/lib/multiparameter-api.ts`
- **Upload Component**: `frontend/src/components/dashboard/UploadSection.tsx`
- **Test Component**: `frontend/src/components/dashboard/MultiparameterTest.tsx`

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
# Navigate to multiparameter backend
cd "Basic Backend/Multi_parameter"

# Install dependencies
pip install fastapi uvicorn pandas numpy scikit-learn joblib

# Start the server
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Frontend Setup

The frontend is already configured to connect to the multiparameter API. The default URL is `http://localhost:8001`.

### 3. Environment Configuration

Create a `.env` file in the frontend directory (optional):
```env
VITE_MULTIPARAMETER_API_URL=http://localhost:8001
```

## 📡 API Endpoints

### Health Check
- **GET** `/` - Check if the API is running
- **Response**: `{"status": "Cardiac Arrest Prediction API is running"}`

### Prediction
- **POST** `/predict/{patient_id}` - Predict cardiac arrest risk
- **Body**: JSON with 17 vital signs parameters
- **Response**: Prediction result with risk probability

## 🔧 Required Data Format

### CSV File Structure
The CSV file must contain the following columns:

```csv
Patient_ID,time,HR [bpm],SpO2 [%],NBPs [mmHg],NBPd [mmHg],NBPm [mmHg],RR [rpm],QTc [msec],DeltaQTc [msec],QT [msec],QT-HR [bpm],ST-III [mm],ST-V [mm],PVC [/min],Perf [NU],Pulse (NBP) [bpm],Pulse (SpO2) [bpm],btbHR [bpm]
Patient_001,2024-01-01 10:00:00,85,98,100,70,85,16,420,15.2,380,85,0.1,0.2,2.1,0.8,85,85,85
```

### Vital Signs Parameters
1. **HR [bpm]** - Heart Rate (beats per minute)
2. **SpO2 [%]** - Oxygen Saturation (percentage)
3. **NBPs [mmHg]** - Systolic Blood Pressure (mmHg)
4. **NBPd [mmHg]** - Diastolic Blood Pressure (mmHg)
5. **NBPm [mmHg]** - Mean Blood Pressure (mmHg)
6. **RR [rpm]** - Respiratory Rate (respirations per minute)
7. **QTc [msec]** - Corrected QT Interval (milliseconds)
8. **DeltaQTc [msec]** - Delta QTc (milliseconds)
9. **QT [msec]** - QT Interval (milliseconds)
10. **QT-HR [bpm]** - QT-HR (beats per minute)
11. **ST-III [mm]** - ST Segment Lead III (millimeters)
12. **ST-V [mm]** - ST Segment Lead V (millimeters)
13. **PVC [/min]** - Premature Ventricular Contractions (per minute)
14. **Perf [NU]** - Performance (Normalized Units)
15. **Pulse (NBP) [bpm]** - Pulse from NBP (beats per minute)
16. **Pulse (SpO2) [bpm]** - Pulse from SpO2 (beats per minute)
17. **btbHR [bpm]** - Beat-to-beat Heart Rate (beats per minute)

## 🎯 Frontend Integration

### 1. Upload Process
1. User navigates to the Upload section
2. Selects the "Vitals" tab
3. Enters a Patient ID
4. Uploads a CSV file with vitals data
5. Clicks "Generate AI Prediction"

### 2. Processing Flow
1. Frontend reads the CSV file
2. Parses each row of data
3. Sends each row to the multiparameter API
4. Collects all predictions
5. Displays comprehensive results

### 3. Results Display
The results include:
- **Total Rows**: Number of data rows processed
- **Predictions Made**: Number of successful predictions
- **Average Risk**: Average risk probability across all predictions
- **High Risk Alerts**: Number of high-risk predictions
- **Recent Predictions**: Timeline of recent predictions

## 🧪 Testing

### 1. Test Component
Use the `MultiparameterTest` component to:
- Test API connection
- Test prediction with sample data
- Verify the integration is working

### 2. Sample Data
The test component includes sample vitals data for testing:
```typescript
const sampleVitals: VitalsInput = {
  'DeltaQTc [msec]': 15.2,
  'HR [bpm]': 85,
  'NBPd [mmHg]': 70,
  'NBPm [mmHg]': 85,
  'NBPs [mmHg]': 100,
  'PVC [/min]': 2.1,
  'Perf [NU]': 0.8,
  'Pulse (NBP) [bpm]': 85,
  'Pulse (SpO2) [bpm]': 85,
  'QT [msec]': 380,
  'QT-HR [bpm]': 85,
  'QTc [msec]': 420,
  'RR [rpm]': 16,
  'ST-III [mm]': 0.1,
  'ST-V [mm]': 0.2,
  'SpO2 [%]': 98,
  'btbHR [bpm]': 85,
};
```

## 🚨 Risk Assessment

### Risk Levels
- **Low Risk**: Risk probability < 0.5 (50%)
- **High Risk**: Risk probability ≥ 0.5 (50%)

### Alerts
- High-risk predictions trigger immediate alerts
- Visual indicators show risk levels
- Color-coded results for quick assessment

## 🔧 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if the multiparameter API is running on port 8001
   - Verify the API URL in the frontend configuration
   - Check firewall settings

2. **Prediction Failed**
   - Ensure all required vital signs are present
   - Check data format and column names
   - Verify numeric values are valid

3. **CSV Parsing Error**
   - Check CSV file format
   - Ensure proper column headers
   - Verify data types

### Debug Steps
1. Use the test component to verify API connection
2. Check browser console for errors
3. Verify backend logs for processing errors
4. Test with sample data first

## 📊 Performance Considerations

### Data Processing
- Large CSV files are processed row by row
- Each row requires a separate API call
- Processing time depends on file size and API response time

### Optimization
- Consider implementing batch processing for large files
- Add progress indicators for long-running operations
- Implement caching for repeated predictions

## 🔐 Security

### API Security
- The multiparameter API runs on localhost by default
- No authentication is required for local development
- Consider adding authentication for production deployment

### Data Privacy
- Patient data is processed locally
- No data is stored permanently on the server
- Consider implementing data encryption for sensitive information

## 📝 Files Modified/Created

### New Files
- `frontend/src/lib/multiparameter-api.ts` - API service for multiparameter backend
- `frontend/src/components/dashboard/MultiparameterTest.tsx` - Test component
- `MULTIPARAMETER_INTEGRATION_GUIDE.md` - This guide

### Modified Files
- `frontend/src/components/dashboard/UploadSection.tsx` - Added multiparameter support

## ✅ Integration Status: COMPLETE

The multiparameter integration is now complete and ready for use:

- ✅ **API Service**: Complete HTTP client for multiparameter backend
- ✅ **Upload Integration**: CSV file upload and processing
- ✅ **Real-time Prediction**: Row-by-row prediction processing
- ✅ **Results Display**: Comprehensive results with risk assessment
- ✅ **Error Handling**: Robust error handling and user feedback
- ✅ **Testing**: Test component for verification

**Ready to use!** 🚀

## 🧪 Test the Integration

1. **Start the multiparameter backend**:
   ```bash
   cd "Basic Backend/Multi_parameter"
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the integration**:
   - Navigate to the Upload section
   - Select the "Vitals" tab
   - Upload a CSV file with vitals data
   - Generate predictions

The complete multiparameter integration is now functional! 🎉
