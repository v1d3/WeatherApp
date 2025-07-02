from fastapi import APIRouter
from pydantic import BaseModel
from app.chatbot.chatbot_service import _chatbot_instance

router = APIRouter()

class QuestionRequest(BaseModel):
    question: str

@router.post("/ask")
async def ask_question(request: QuestionRequest):
    try:
        question = request.question.strip()
        print("Pregunta recibida por el chatbot:", question)

        if not isinstance(question, str) or not question.strip():
            return {"error": "The question should be a valid string and can not be empty"}

        response = _chatbot_instance.get_chatbot_response(question)
        print("Respuesta del chatbot:", response)
        return {"response": response}

    except Exception as e:
        print("Error al procesar la solicitud:", str(e))
        return {"error": str(e)}