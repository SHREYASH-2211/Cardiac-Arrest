Write-Host "Starting Multi-Parameter Backend..." -ForegroundColor Green
Write-Host ""

Set-Location "Basic Backend\Multi_parameter"

Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install fastapi uvicorn pandas numpy scikit-learn joblib

Write-Host ""
Write-Host "Starting Multi-Parameter API Server..." -ForegroundColor Yellow
Write-Host "Server will run on http://localhost:8001" -ForegroundColor Cyan
Write-Host ""

uvicorn main:app --host 0.0.0.0 --port 8001 --reload
