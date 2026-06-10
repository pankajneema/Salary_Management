from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import employees, salary, analytics, data, departments

app = FastAPI(
    title="ACME Salary Management API",
    description="HR salary management for 10,000+ employees",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router, prefix="/api")
app.include_router(salary.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(data.router, prefix="/api")
app.include_router(departments.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
