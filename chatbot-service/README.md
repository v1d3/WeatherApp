# Development Environment for ChatbotService

---

## Prerequisites

- [Conda](https://docs.conda.io/en/latest/) (recommended) or
  Python 3.10.x + pip

---

## Environment Setup

### Option 1: Using Conda (Recommended)

1. Clone this repository or download the files:

   ```bash
   git clone https://github.com/v1d3/WeatherApp.git
   cd WeatherApp
   ```

2. Navigate to the chatbot-service folder:

   ```bash
   cd chatbot-service
   ```

3. Create the Conda environment:

   ```bash
   conda env create -f environment.yml
   conda activate chatbot-env
   ```

4. (Optional) Verify that all dependencies were installed:

   ```bash
   conda list
   ```

5. To run the ChatbotService with Uvicorn:

   ```bash
   uvicorn main:app --reload --port 8000
   ```

---

### Option 2: Using `venv`

> Only if you are not using Conda.

1. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   . venv/bin/Activate   # On Linux/macOS
   venv\Scripts\activate.bat  # On Windows
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

---

## 📁 File Overview

- `environment.yml`: Defines the Conda environment and all dependencies.
- `requirements.txt`: Optional, for pip-based installation (non-Conda users).

---
