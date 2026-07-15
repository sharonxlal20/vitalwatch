import torch
import torch.nn as nn
import numpy as np
from model import VitalsAutoencoder

VITAL_PROFILES = {
    "glucose": {"base": 100, "amplitude": 15, "noise": 3},
    "heart_rate": {"base": 75, "amplitude": 8, "noise": 2},
    "spo2": {"base": 97, "amplitude": 1.5, "noise": 0.5},
}

def generate_normal_sequences(profile, num_sequences=1000, seq_len=10):
    sequences = []
    for _ in range(num_sequences):
        wave = profile["base"] + profile["amplitude"] * np.sin(np.linspace(0, 2 * np.pi, seq_len))
        noise = np.random.normal(0, profile["noise"], seq_len)
        sequences.append(wave + noise)
    return np.array(sequences, dtype=np.float32)

def train_for_type(vital_type, profile, seq_len=10):
    data = generate_normal_sequences(profile, seq_len=seq_len)
    mean, std = data.mean(), data.std()
    data = torch.tensor((data - mean) / std).unsqueeze(-1)

    model = VitalsAutoencoder(input_size=1, hidden_size=32, seq_len=seq_len)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    loss_fn = nn.MSELoss()

    for epoch in range(50):
        optimizer.zero_grad()
        output = model(data)
        loss = loss_fn(output, data)
        loss.backward()
        optimizer.step()

    filename = f"vitals_model_{vital_type}.pt"
    torch.save({'model_state': model.state_dict(), 'mean': mean, 'std': std}, filename)
    print(f"{vital_type}: final loss {loss.item():.4f} -> saved to {filename}")

if __name__ == "__main__":
    for vital_type, profile in VITAL_PROFILES.items():
        train_for_type(vital_type, profile)