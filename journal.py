from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, JournalEntry, User
from utils.sentiment import analyze_sentiment
from datetime import datetime, timedelta

journal_bp = Blueprint('journal', __name__)

@journal_bp.route('/entries', methods=['GET'])
@jwt_required()
def get_entries():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.subscription_type == 'free':
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            recent_entries_count = JournalEntry.query.filter(
                JournalEntry.user_id == user_id,
                JournalEntry.created_at >= thirty_days_ago
            ).count()
            
            if recent_entries_count >= 5:
                return jsonify({
                    'error': 'Free plan limit reached. Upgrade to premium for unlimited entries.',
                    'limit_reached': True
                }), 403
        
        entries = JournalEntry.query.filter_by(user_id=user_id).order_by(JournalEntry.created_at.desc()).all()
        
        return jsonify({
            'entries': [entry.to_dict() for entry in entries]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@journal_bp.route('/entries', methods=['POST'])
@jwt_required()
def create_entry():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
         return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        content = data.get('content')
        emotion = data.get('emotion')
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        if user.subscription_type == 'free':
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            recent_entries_count = JournalEntry.query.filter(
                JournalEntry.user_id == user_id,
                JournalEntry.created_at >= thirty_days_ago
            ).count()
            
            if recent_entries_count >= 5:
                return jsonify({
                    'error': 'Free plan limit reached. Upgrade to premium for unlimited entries.',
                    'limit_reached': True
                }), 403
        
        sentiment_result = analyze_sentiment(content)
        
        new_entry = JournalEntry(
            user_id=user_id,
            content=content,
            sentiment=sentiment_result['sentiment'],
            score=sentiment_result['score'],
            emotion=emotion
        )
        
        db.session.add(new_entry)
        db.session.commit()
        
        return jsonify({
            'message': 'Journal entry created successfully',
            'entry': new_entry.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@journal_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    try:
        user_id = get_jwt_identity()
        
        entries = JournalEntry.query.filter_by(user_id=user_id).order_by(JournalEntry.created_at).all()
        
        chart_data = {
            'labels': [entry.created_at.strftime('%Y-%m-%d') for entry in entries],
            'scores': [float(entry.score) for entry in entries]
        }
        
        return jsonify({
            'chart_data': chart_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
