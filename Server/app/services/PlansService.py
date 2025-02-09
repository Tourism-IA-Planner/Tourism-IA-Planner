from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from datetime import datetime
from app.db.models import User,Plans
from sqlalchemy.exc import SQLAlchemyError


def createPlansService(db: Session, idUser: int):
    try:
        
        user = db.query(User).filter(User.id == idUser).first()
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

        
        newPlan = Plans(
            dateCreation=datetime.now(),
            idUser=idUser
        )

        
        db.add(newPlan)
        db.commit()
        db.refresh(newPlan)

        return newPlan

    except IntegrityError as e:
        
        db.rollback()  
        raise HTTPException(status_code=400, detail="Erreur d'intégrité des données : " + str(e.orig))

    except Exception as e:
       
        db.rollback()
        raise HTTPException(status_code=500, detail="Erreur interne du serveur : " + str(e))
