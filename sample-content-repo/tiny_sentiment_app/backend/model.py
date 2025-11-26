import torch.nn as nn

class SentimentModel(nn.Module):
    def __init__(self, vocab_size, embed_dim, num_classes):
        super(SentimentModel, self).__init__()
        # EmbeddingBag is efficient for variable length text sequences
        # sparse=False is used because we are training on CPU usually
        self.embedding = nn.EmbeddingBag(vocab_size, embed_dim, sparse=False)
        self.fc = nn.Linear(embed_dim, num_classes)
        self.init_weights()

    def init_weights(self):
        initrange = 0.5
        self.embedding.weight.data.uniform_(-initrange, initrange)
        self.fc.weight.data.uniform_(-initrange, initrange)
        self.fc.bias.data.zero_()

    def forward(self, text, offsets):
        # text: 1D tensor of all tokens in batch
        # offsets: 1D tensor of start indices for each sequence
        # Returns: [Batch_Size, Num_Classes]
        embedded = self.embedding(text, offsets)
        return self.fc(embedded)