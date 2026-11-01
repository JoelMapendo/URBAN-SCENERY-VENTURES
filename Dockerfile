FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY core ./core
COPY models ./models
COPY routers ./routers
COPY schemas ./schemas
COPY services ./services
COPY main.py seed_data.py settings.py ./

RUN mkdir -p /app/data

ENV DATABASE_URL=sqlite:////app/data/urban_ventures.db \
    AUTO_SEED=true

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

