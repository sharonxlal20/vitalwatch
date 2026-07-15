import torch
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from model import VitalsAutoencoder

app = FastAPI()

VITAL_TYPES = ["glucose", "heart_rate", "spo2"]
models = {}

for vital_type in VITAL_TYPES:
    checkpoint = torch.load(f'vitals_model_{vital_type}.pt', weights_only=False)
    model = VitalsAutoencoder(input_size=1, hidden_size=32, seq_len=10)
    model.load_state_dict(checkpoint['model_state'])
    model.eval()
    models[vital_type] = {'model': model, 'mean': checkpoint['mean'], 'std': checkpoint['std']}

class VitalsSequence(BaseModel):
    type: str
    values: list[float]

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/predict")
def predict(data: VitalsSequence):
    if data.type not in models:
        return {"error": f"Unsupported vital type: {data.type}"}
    if len(data.values) != 10:
        return {"error": "Expected exactly 10 values"}

    entry = models[data.type]
    raw = np.array(data.values, dtype=np.float32)
    normalized = (raw - entry['mean']) / entry['std']
    x = torch.tensor(normalized).reshape(1, 10, 1)

    with torch.no_grad():
        reconstructed = entry['model'](x)
        error = torch.mean((x - reconstructed) ** 2).item()

    threshold = 0.5
    is_anomaly = error > threshold

    return {
        "reconstruction_error": round(error, 4),
        "is_anomaly": is_anomaly,
        "severity": "high" if error > 1.0 else "medium" if is_anomaly else "low"
    }