# Use official Python lightweight image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy only the requirements file first (to leverage Docker cache)
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend source code
COPY backend/ .

# Expose the port dynamically based on Railway's environment
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
