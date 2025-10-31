from fastapi import FastAPI
from app.api import router as api_router

app = FastAPI(title="Todo App")

# Include all API endpoints from app.api
app.include_router(api_router)


@app.get("/")
def read_root():
    return {"message": "Welcome to Todo App!"}