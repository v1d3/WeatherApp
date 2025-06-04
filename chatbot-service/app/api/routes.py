from fastapi import APIRouter
from pydantic import BaseModel
from app.chatbot.chatbot_service import _chatbot_instance

router = APIRouter()

class ChatRequest(BaseModel):
    question: str

@router.post("/ask")
async def ask_question(request: ChatRequest):
    response = _chatbot_instance.get_chatbot_response(request.question)
    return {"response": response}