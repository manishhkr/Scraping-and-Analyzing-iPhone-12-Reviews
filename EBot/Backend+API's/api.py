from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = Flask(__name__)
CORS(app)  # Enable CORS for the entire app

# Initialize VADER sentiment analyzer
analyzer = SentimentIntensityAnalyzer()

# Function to load reviews from the CSV file
def load_reviews():
    try:
        df = pd.read_csv('iphone_12_reviews.csv')
        return df
    except pd.errors.ParserError as e:
        return pd.DataFrame()  # Return an empty DataFrame on error
    except Exception as e:
        return pd.DataFrame()  # Return an empty DataFrame on error

# Function to analyze sentiment
def get_sentiment(text):
    score = analyzer.polarity_scores(text)
    compound_score = score['compound']
    if compound_score >= 0.05:
        return 'Positive'
    elif compound_score <= -0.05:
        return 'Negative'
    else:
        return 'Neutral'

# Endpoint to get reviews based on color, storage size, and optional rating
@app.route('/reviews', methods=['GET'])
def get_reviews():
    df = load_reviews()
    
    color = request.args.get('color')
    storage_size = request.args.get('storage_size')
    rating = request.args.get('rating', type=float)  # Optional rating filter

    # Start with the full DataFrame
    filtered_reviews = df

    # Filter by color
    if color:
        filtered_reviews = filtered_reviews[filtered_reviews['Colour'] == color]

    # Filter by storage size
    if storage_size:
        filtered_reviews = filtered_reviews[filtered_reviews['Storage Size'] == storage_size]

    # Filter by rating if provided
    if rating is not None:
        filtered_reviews = filtered_reviews[filtered_reviews['Rating'] >= rating]

    # Analyze sentiment for each review
    filtered_reviews['Sentiment'] = filtered_reviews['Review Text'].apply(get_sentiment)

    return jsonify(filtered_reviews.to_dict(orient='records'))

# Endpoint to analyze sentiment of a review
@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    data = request.json
    review = data.get('review')

    if not review:
        return jsonify({"error": "Review not provided"}), 400

    sentiment = get_sentiment(review)  # Use the get_sentiment function
    return jsonify({"sentiment": sentiment})

if __name__ == '__main__':
    app.run(debug=True, port=8000)
