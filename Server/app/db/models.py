from sqlalchemy import Column, Integer, String, Date, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.db.database import Base
from sqlalchemy import PrimaryKeyConstraint


class Plans(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    dateCreation = Column(Date) 
    preference = relationship("Preferences", back_populates="plan", uselist=False)


class Preferences(Base):
    __tablename__ = "preferences"

    id = Column(Integer, autoincrement=True) 
    lieuDepart = Column(String)  
    budget = Column(Float)
    dateDepart = Column(Date) 
    dateRetour = Column(Date)  
    idPlan = Column(Integer, ForeignKey("plans.id"), unique=True)  
    plan = relationship("Plans", back_populates="preference")
    userId = Column(Integer, ForeignKey("users.id"))  
    user = relationship("User", back_populates="preferences")
    villes = relationship("LieuxToVisit", back_populates="preference")

    __table_args__ = (
        PrimaryKeyConstraint('id', 'lieuDepart'),
    )

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String)
    prenom = Column(String)
    email = Column(String)
    password = Column(String)
    preferences = relationship("Preferences", back_populates="user")


class Villes(Base):
    __tablename__ = "villes"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String)
    budget = Column(Float)
    activities = relationship("Activities", back_populates="ville")
    itineraries = relationship("Itineraires", secondary="ville_itineraire", back_populates="villes")
    hotels = relationship("Hotels", back_populates="ville")
    lieuxToVisit = relationship("LieuxToVisit", back_populates="ville")


class Activities(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String)
    description = Column(String)
    cout = Column(Float)
    adresse = Column(String) 
    idVille = Column(Integer, ForeignKey("villes.id"))  
    ville = relationship("Villes", back_populates="activities")


class Itineraires(Base):
    __tablename__ = "itineraires"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    budget = Column(Float)
    villes = relationship("Villes", secondary="ville_itineraire", back_populates="itineraries")


class Hotels(Base):

    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String)
    adresse = Column(String)
    description = Column(String)
    cout = Column(Float)
    idVille = Column(Integer, ForeignKey("villes.id"))
    ville = relationship("Villes", back_populates="hotels")


class VilleItineraire(Base): 
    __tablename__ = "ville_itineraire"

    idVille = Column(Integer, ForeignKey("villes.id"), primary_key=True)  
    idItineraire = Column(Integer, ForeignKey("itineraires.id"), primary_key=True)


class LieuxToVisit(Base):
    __tablename__ = "lieux_to_visit"

    idPreference = Column(Integer, ForeignKey("preferences.id"), primary_key=True)
    idVille = Column(Integer, ForeignKey("villes.id"), primary_key=True)

    preference = relationship("Preferences", back_populates="villes")
    ville = relationship("Villes", back_populates="lieuxToVisit")
