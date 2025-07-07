from fastapi.testclient import TestClient
from main import app  

client = TestClient(app)

def test_question_invalid_type():
    response = client.post("/api/ask", json={"question": 123})
    assert response.status_code == 422
    assert "string_type" in response.text

def test_question_missing_field():
    response = client.post("/api/ask", json={})
    assert response.status_code == 422
    assert "Field required" in response.text

def test_question_null_value():
    response = client.post("/api/ask", json={"question": None})
    assert response.status_code == 422
    assert "string_type" in response.text