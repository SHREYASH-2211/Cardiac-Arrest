@echo off
echo Starting Multi-Parameter Backend...
echo.

cd "Basic Backend\Multi_parameter"

echo Installing dependencies...
pip install fastapi uvicorn pandas numpy scikit-learn joblib

echo.
echo Starting Multi-Parameter API Server...
echo Server will run on http://localhost:8001
echo.

uvicorn main:app --host 0.0.0.0 --port 8001 --reload

pause
