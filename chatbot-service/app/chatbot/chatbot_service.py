from langchain_deepseek import ChatDeepSeek
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from os import getenv

load_dotenv()

MODEL = "deepseek/deepseek-r1-0528:free"
API_BASE = "https://openrouter.ai/api/v1"

prompt = ChatPromptTemplate.from_messages([
    ("system","explica de manera sencilla solo usando los datos meteorológicos proporcionados. No escribas más de tres lineas, sé claro, conciso y en español"
    "usa un formato continuo sin saltos de línea o markdown"),
    ("user","¿Puedes responderme lo siguiente: '{question}' con respecto al clima?")])

#Por implementar Global exception Handler
class ChatbotServiceError(Exception):
    """Errores del servicio del chatbot."""
    pass

class InvalidAPIKeyError(ChatbotServiceError):
    """API key no está configurada."""
    pass

class Chatbot:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Chatbot, cls).__new__(cls)
            cls._instance._llm = cls._instance._initialize_llm()
            return cls._instance

    def __init__(self):
        self._llm = self._initialize_llm()
        self.chain = prompt|self._llm
        
    def _initialize_llm(self)->ChatDeepSeek:
        api_key=getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise InvalidAPIKeyError("The API key is not configured.")
        
        return ChatDeepSeek(model=MODEL,
                            temperature=0.4,
                            api_key=api_key,
                            api_base= API_BASE)

    def get_chatbot_response(self, question: str) -> str:

        try:
            response = self.chain.invoke({"question":question})
            print("Respuesta cruda del modelo:", response)
            return response.content
        
        except Exception as e:
            print("Excepción del modelo:", str(e))
            raise ChatbotServiceError(f"Error to generate an answered: {str(e)}")
        
_chatbot_instance = Chatbot()