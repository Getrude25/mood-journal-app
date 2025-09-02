from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Payment
from datetime import datetime, timedelta

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/initiate', methods=['POST'])
@jwt_required()
def initiate_payment():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        plan_type = data.get('plan_type')
        payment_method = data.get('payment_method')
        
        if plan_type not in ['monthly', 'annual']:
            return jsonify({'error': 'Invalid plan type'}), 400
        
        amount = 4.99 if plan_type == 'monthly' else 49.99
        
        new_payment = Payment(
            user_id=user_id,
            amount=amount,
            payment_method=payment_method,
            plan_type=plan_type,
            status='pending'
        )
        
        db.session.add(new_payment)
        db.session.commit()
        
        # Simulate successful payment for demo
        new_payment.status = 'completed'
        new_payment.transaction_id = f'txn_{new_payment.id}'
        
        user.subscription_type = 'premium' if plan_type == 'monthly' else 'annual'
        user.subscription_status = 'active'
        
        if plan_type == 'monthly':
            user.subscription_end = datetime.utcnow() + timedelta(days=30)
        else:
            user.subscription_end = datetime.utcnow() + timedelta(days=365)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Payment completed successfully',
            'payment_id': new_payment.id,
            'amount': amount,
            'subscription_type': user.subscription_type
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
