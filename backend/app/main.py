from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import analytics, data, departments, employees, salary

app = FastAPI(
    title="ACME Salary Management API",
    description="HR salary management for 10,000+ employees",
    version="1.0.0",
)

frontend_origins = [origin.strip() for origin in settings.FRONTEND_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router, prefix="/api")
app.include_router(salary.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(data.router, prefix="/api")
app.include_router(departments.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}
