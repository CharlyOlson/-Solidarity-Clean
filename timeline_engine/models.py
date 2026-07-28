"""
SOLIDARITY PLATFORM - TIMELINE ENGINE MODELS
============================================

TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
Owner: Scott Charles Olson
DOB: March 31, 1997
Phone: +1 (913) 548-5715
Location: Kansas, USA 66210
Trademark: TRADEMARKED BY SCOTT CHARLES OLSON

SQLAlchemy ORM classes for the Solidarity Timeline Engine pipeline:

  Layer 1 – SecureInput    : Omega-Lock & TIMBR Compression
  Layer 2 – MCGEvaluation  : Mirror-Cubic Gradient Discriminant
  Layer 3 – HenryLadderScore : Henry Ladder & Recursive Judgment Offset
  Layer 4 – TimelinePath   : Solidarity Timeline Engine Output
"""

from sqlalchemy import Column, Integer, Float, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base


class SecureInput(Base):
    """Layer 1: Omega-Lock & TIMBR Compression.

    Validates and stores incoming socio-economic payloads.
    omega_clearance acts as the permission gate; only rows where
    omega_clearance is True are passed to the MCG classification step.
    timbr_payload holds the compressed, serialised parameters.
    """
    __tablename__ = 'secure_inputs'

    id = Column(Integer, primary_key=True)
    omega_clearance = Column(Boolean, nullable=False, default=False)
    timbr_payload = Column(JSON, nullable=False)

    evaluations = relationship("MCGEvaluation", back_populates="input_data")


class MCGEvaluation(Base):
    """Layer 2: Mirror-Cubic Gradient (MCG) Discriminant.

    Classifies the input state as either torus-preserving (stable) or
    torus-breaking (unstable).  gradient_value stores the raw MCG output;
    is_stable is the boolean classification derived from it.
    """
    __tablename__ = 'mcg_evaluations'

    id = Column(Integer, primary_key=True)
    input_id = Column(Integer, ForeignKey('secure_inputs.id'))

    gradient_value = Column(Float)
    is_stable = Column(Boolean)  # True = Torus-Preserving, False = Torus-Breaking

    input_data = relationship("SecureInput", back_populates="evaluations")
    harmonic_scores = relationship("HenryLadderScore", back_populates="evaluation")


class HenryLadderScore(Base):
    """Layer 3: Henry Ladder & Recursive Judgment Offset (RJO) Projection.

    Assigns a harmonic weight/score to stable configurations, determining
    which are structurally favoured for long-term survival.
    resonance_frequency is the position on the Henry Ladder (7→14→49).
    rjo_weight is the calculated Recursive Judgment Offset value.
    """
    __tablename__ = 'henry_ladder_scores'

    id = Column(Integer, primary_key=True)
    evaluation_id = Column(Integer, ForeignKey('mcg_evaluations.id'))

    resonance_frequency = Column(Float)  # Position on the Henry Ladder
    rjo_weight = Column(Float)           # Calculated offset weight

    evaluation = relationship("MCGEvaluation", back_populates="harmonic_scores")
    timelines = relationship("TimelinePath", back_populates="score")


class TimelinePath(Base):
    """Layer 4: Solidarity Timeline Engine Output.

    Stores the four mirrored socio-economic timeline paths generated from
    the harmonically favoured configurations.
    """
    __tablename__ = 'timeline_paths'

    id = Column(Integer, primary_key=True)
    score_id = Column(Integer, ForeignKey('henry_ladder_scores.id'))

    path_designation = Column(String)        # e.g., "Mirrored Path 1"
    socio_economic_outcome = Column(String)

    score = relationship("HenryLadderScore", back_populates="timelines")
