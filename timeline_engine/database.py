"""
SOLIDARITY PLATFORM - TIMELINE ENGINE DATABASE
===============================================

TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
Owner: Scott Charles Olson
DOB: March 31, 1997
Phone: +1 (913) 548-5715
Location: Kansas, USA 66210
Trademark: TRADEMARKED BY SCOTT CHARLES OLSON

Handles the PostgreSQL connection and session management for the
Solidarity Timeline Engine pipeline.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Fetch the database URL from the environment.
# Set DATABASE_URL in your environment or .env file before running.
# Example format: postgresql://<user>:<password>@<host>/<dbname>
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is not set. "
        "Export it before running the Timeline Engine."
    )

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
