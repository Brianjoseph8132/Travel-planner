from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from enum import Enum


metadata = MetaData()

db = SQLAlchemy(metadata=metadata)


# Define the TripStatusEnum as a Python Enum
class TripStatusEnum(Enum):
    PENDING = "Pending"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


# user Model
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)

    # Relationship to Trip
    trips = db.relationship('Trip', backref='user', cascade="all, delete", lazy=True)

# Trip Model
class Trip(db.Model):
    __tablename__ = 'trips'
    id = db.Column(db.Integer, primary_key=True)
    destination = db.Column(db.String(120), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    budget = db.Column(db.Float, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default=TripStatusEnum.PENDING.value, nullable=False)

    # Relationship to Activity
    activities = db.relationship('Activity', backref='trip', cascade="all, delete", lazy=True)


# Activities Model
class Activity(db.Model):
    __tablename__ = 'activities'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    scheduled_time = db.Column(db.String(5), nullable=False)
    
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=False)



# 
class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False)
