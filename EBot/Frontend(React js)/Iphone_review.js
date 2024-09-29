import React, { useEffect, useState } from 'react';
import './Iphone_reviews.css';

export default function IphoneReview() {
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [colorFilter, setColorFilter] = useState('');
    const [storageFilter, setStorageFilter] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [sentimentPopup, setSentimentPopup] = useState({ visible: false, sentiment: '', sentimentClass: '' });
    const [isFiltered, setIsFiltered] = useState(false);
    const [activeCardIndex, setActiveCardIndex] = useState(null); // State to manage the active card

    useEffect(() => {
        fetch('http://127.0.0.1:8000/reviews')
            .then(response => response.json())
            .then(data => {
                setReviews(data);
                setFilteredReviews(data);
            })
            .catch(error => console.error('Error fetching reviews:', error));
    }, []);

    const applyFilters = () => {
        let updatedReviews = [...reviews];

        if (colorFilter) {
            updatedReviews = updatedReviews.filter(review => review.Colour === colorFilter);
        }
        if (storageFilter) {
            updatedReviews = updatedReviews.filter(review => review['Storage Size'] === storageFilter);
        }
        if (ratingFilter) {
            updatedReviews = updatedReviews.filter(review => review.Rating >= parseFloat(ratingFilter));
        }

        setFilteredReviews(updatedReviews);
        setIsFiltered(true);
    };

    const resetFilters = () => {
        setColorFilter('');
        setStorageFilter('');
        setRatingFilter('');
        setFilteredReviews(reviews);
        setIsFiltered(false);
        setActiveCardIndex(null); // Reset active card
    };

    const getAvailableOptions = (field) => {
        const options = new Set();
        reviews.forEach(review => {
            if (review[field]) {
                options.add(review[field]);
            }
        });
        return Array.from(options);
    };

    const analyzeSentiment = (review, event) => {
        event.stopPropagation(); // Prevent click event from bubbling up to the card
        fetch('http://127.0.0.1:8000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ review }),
        })
            .then(response => response.json())
            .then(data => {
                setSentimentPopup({ 
                    visible: true, 
                    sentiment: data.sentiment,
                    sentimentClass: `sentiment-${data.sentiment}` 
                });
            })
            .catch(error => console.error('Error analyzing sentiment:', error));
    };

    const closePopup = () => {
        setSentimentPopup({ visible: false, sentiment: '', sentimentClass: '' });
    };

    const handleCardClick = (index) => {
        setActiveCardIndex(index === activeCardIndex ? null : index); // Toggle active card
    };

    return (
        <div className="review-container">
            <h1>IPhone Reviews</h1>

            <div className="filter-section">
                <select onChange={e => setColorFilter(e.target.value)} value={colorFilter}>
                    <option value="">Select Color</option>
                    {getAvailableOptions('Colour').map((color, index) => (
                        <option key={index} value={color}>{color}</option>
                    ))}
                </select>
                <select onChange={e => setStorageFilter(e.target.value)} value={storageFilter}>
                    <option value="">Select Storage Size</option>
                    {getAvailableOptions('Storage Size').map((size, index) => (
                        <option key={index} value={size}>{size}</option>
                    ))}
                </select>
                <select onChange={e => setRatingFilter(e.target.value)} value={ratingFilter}>
                    <option value="">Select Rating</option>
                    {getAvailableOptions('Rating').map((rating, index) => (
                        <option key={index} value={rating}>{rating}</option>
                    ))}
                </select>
                <button onClick={isFiltered ? resetFilters : applyFilters}>
                    {isFiltered ? 'Reset Filter' : 'Apply Filter'}
                </button>
            </div>

            <div className="reviews">
                {filteredReviews.length > 0 ? (
                    filteredReviews.map((review, index) => (
                        <div 
                            key={index} 
                            className={`review-card ${activeCardIndex === index ? 'active' : ''}`} 
                            onClick={() => handleCardClick(index)} // Handle card click
                            onMouseEnter={() => setActiveCardIndex(index)} // Set active on hover
                            onMouseLeave={() => setActiveCardIndex(null)} // Remove active on mouse leave
                        >
                            <h2>{review['Review Title']}</h2>
                            <p>{review['Review Text']}</p>
                            <div className="review-details">
                                <span>Storage: {review['Storage Size']}</span>
                                <span>Color: {review['Colour']}</span>
                                <span>Rating: {review['Rating'] || 'N/A'}</span>
                            </div>
                            <button onClick={(e) => analyzeSentiment(review['Review Text'], e)}>Analyze Sentiment</button>
                        </div>
                    ))
                ) : (
                    <p>No reviews found for the selected filters.</p>
                )}
            </div>

            {sentimentPopup.visible && (
                <div className="popup">
                    <div className={`popup-content ${sentimentPopup.sentimentClass}`}>
                        <span className="close" onClick={closePopup}>&times;</span>
                        <h2>Sentiment Analysis Result</h2>
                        <p>This review is: <strong className={sentimentPopup.sentimentClass}>{sentimentPopup.sentiment}</strong></p>
                    </div>
                </div>
            )}
        </div>
    );
}
