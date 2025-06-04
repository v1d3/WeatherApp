from fastapi import FastAPI
from app.api.routes import router as chatbot_router

app = FastAPI(title="Chatbot API")

app.include_router(chatbot_router, prefix="/api")