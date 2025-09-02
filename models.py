from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    subscription_type = db.Column(db.String(20), default='free')  # free, premium, annual
    subscription_status = db.Column(db.String(20), default='inactive')  # active, inactive, canceled
    subscription_end = db.Column(db.DateTime, nullable=True)
    
    journal_entries = db.relationship('JournalEntry', backref='user', lazy=True)
    payments = db.relationship('Payment', backref='user', lazy=True)

class JournalEntry(db.Model):
    __tablename__ = 'journal_entries'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    sentiment = db.Column(db.String(20), nullable=False)  # positive, negative, neutral
    score = db.Column(db.Float, nullable=False)  # 0-100 sentiment score
    emotion = db.Column(db.String(50), nullable=True)  # happy, sad, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'sentiment': self.sentiment,
            'score': self.score,
            'emotion': self.emotion,
            'created_at': self.created_at.isoformat()
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    payment_method = db.Column(db.String(20), nullable=False)  # clickpesa, card, paypal
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    transaction_id = db.Column(db.String(100), nullable=True)
    plan_type = db.Column(db.String(20), nullable=False)  # monthly, annual
    created_at = db.Column(db.DateTime, default=datetime.utcnow)