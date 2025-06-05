from fastapi import FastAPI
from genral import main as analysis_report
import uvicorn
from pydantic import BaseModel

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow specific origins (or use ["*"] to allow all)
origins = ["*"]

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use ["*"] to allow all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class QueryRequest(BaseModel):
    user_query: str


@app.get("/")
def hello():
    return "hello"

@app.post("/query")
async def read_item(req: QueryRequest):
    print()
    response=await analysis_report(req.user_query)
    return response

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=3000)