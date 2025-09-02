import os
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'SK8UytTLcbyHwNXU4CGBzAyK9kPg1PfcRnpc41glXK'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-here'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'mysql+mysqlconnector://username:password@localhost/moodjournal'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # ClickPesa configuration
    CLICKPESA_API_KEY = os.environ.get('CLICKPESA_API_KEY')
    CLICKPESA_SECRET_KEY = os.environ.get('CLICKPESA_SECRET_KEY')
    CLICKPESA_BASE_URL = os.environ.get('CLICKPESA_BASE_URL') or 'https://api.clickpesa.com'
    
    # Hugging Face configuration
    HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY')