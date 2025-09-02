def analyze_sentiment(text):
    """
    Simple sentiment analysis using keyword matching
    """
    positive_words = ['happy', 'joy', 'excited', 'good', 'great', 'love', 'wonderful', 'amazing', 'best', 'grateful', 'calm', 'peaceful']
    negative_words = ['sad', 'angry', 'hate', 'bad', 'terrible', 'awful', 'worst', 'depressed', 'anxious', 'tired', 'stress']
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        sentiment = 'positive'
        score = min(70 + (positive_count * 5), 100)
    elif negative_count > positive_count:
        sentiment = 'negative'
        score = max(30 - (negative_count * 5), 0)
    else:
        sentiment = 'neutral'
        score = 50
    
    return {
        'sentiment': sentiment,
        'score': score
    }
