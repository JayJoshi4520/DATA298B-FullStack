
# Image Classifier Project

This project demonstrates a simple image classification model using PyTorch.

## Setup

1.  Create a virtual environment: `python3 -m venv venv`
2.  Activate the virtual environment: `source venv/bin/activate`
3.  Install dependencies: `pip install -r requirements.txt`

## Data

Organize your image data into subdirectories under the `data/` directory, where each subdirectory represents a class.

## Training

Run the training script: `python src/train.py`

## Notes

*   The model architecture is defined in `src/model.py`.
*   The dataset loading logic is in `src/dataset.py`.
*   Training parameters can be adjusted in `src/train.py`.
