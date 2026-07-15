import torch
import torch.nn as nn

class VitalsAutoencoder(nn.Module):
    def __init__(self, input_size=1, hidden_size=32, seq_len=10):
        super().__init__()
        self.seq_len = seq_len

        # Encoder: compresses the sequence into a small hidden representation
        self.encoder = nn.LSTM(input_size, hidden_size, batch_first=True)

        # Decoder: tries to reconstruct the original sequence from that representation
        self.decoder = nn.LSTM(hidden_size, hidden_size, batch_first=True)
        self.output_layer = nn.Linear(hidden_size, input_size)

    def forward(self, x):
        # x shape: (batch, seq_len, input_size)
        _, (hidden, cell) = self.encoder(x)

        # Repeat the compressed representation for each timestep, so the
        # decoder has something to work with at every step of the sequence
        decoder_input = hidden.repeat(self.seq_len, 1, 1).permute(1, 0, 2)
        decoded, _ = self.decoder(decoder_input)

        return self.output_layer(decoded)