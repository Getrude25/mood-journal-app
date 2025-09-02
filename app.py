from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from models import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app)  # Enable CORS for all routes
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.journal import journal_bp
    from routes.payment import payment_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(journal_bp, url_prefix='/api/journal')
    app.register_blueprint(payment_bp, url_prefix='/api/payment')
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy'})
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)