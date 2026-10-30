from fastapi import FastAPI, HTTPException
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import settings, check_database_connection
from app.routes.customers import router as customers_router
from app.routes.loans import router as loans_router
from app.routes.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.app_name,
    description="Loan lifecycle management platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(customers_router)
app.include_router(loans_router)
app.include_router(auth_router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "application": settings.app_name}


@app.get("/health/db")
def database_health_check():
    try:
        check_database_connection()
        return {"status": "connected", "database": settings.db_name}
    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable",
        )