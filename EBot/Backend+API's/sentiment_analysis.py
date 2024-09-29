import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

def analyze_sentiment(file_path):
    # Load the data
    df = pd.read_csv(file_path)
    
    # Initialize VADER sentiment analyzer
    analyzer = SentimentIntensityAnalyzer()

    # Function to get sentiment
    def get_sentiment(text):
        score = analyzer.polarity_scores(text)
        compound_score = score['compound']
        if compound_score >= 0.05:
            return 'Positive'
        elif compound_score <= -0.05:
            return 'Negative'
        else:
            return 'Neutral'

    # Apply the function to the review text
    df['Sentiment Class'] = df['Review Text'].apply(get_sentiment)
    
    # Save the DataFrame with sentiment analysis results
    df.to_csv('iphone_12_reviews_with_sentiment.csv', index=False)

if __name__ == '__main__':
    analyze_sentiment('iphone_12_reviews.csv')
