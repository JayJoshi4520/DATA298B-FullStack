
import torch
from torch.utils.data import Dataset
from PIL import Image
import os

class ImageDataset(Dataset):
    def __init__(self, data_dir, transform=None):
        self.data_dir = data_dir
        self.image_paths = []
        self.labels = []
        self.transform = transform

        classes = os.listdir(data_dir)
        self.class_to_idx = {c: i for i, c in enumerate(classes)}

        for class_name in classes:
            class_dir = os.path.join(data_dir, class_name)
            for image_name in os.listdir(class_dir):
                image_path = os.path.join(class_dir, image_name)
                self.image_paths.append(image_path)
                self.labels.append(self.class_to_idx[class_name])

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, self, idx):
        image_path = self.image_paths[idx]
        image = Image.open(image_path).convert('RGB')  # Ensure RGB
        label = self.labels[idx]

        if self.transform:
            image = self.transform(image)

        return image, label
