FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Run data prep and training during build
# This ensures the container starts with a ready-to-use model
# If these fail, the docker build will fail (good for CI/CD)
RUN python prepare_data.py
RUN python train.py

EXPOSE 5000

CMD ["python", "app.py"]