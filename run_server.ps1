Write-Host "Starting Urban Scenery Ventures Electronics Backend..." -ForegroundColor Green
& .\.venv\Scripts\python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
