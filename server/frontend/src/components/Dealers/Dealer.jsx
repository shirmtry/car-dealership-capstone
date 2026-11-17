import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../AuthContext';
import positiveIcon from '../assets/positive.png';
import neutralIcon from '../assets/neutral.png';
import negativeIcon from '../assets/negative.png';

const icons = { positive: positiveIcon, neutral: neutralIcon, negative: negativeIcon };

export default function Dealer() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api('dealer/' + id), api('reviews/dealer/' + id)]).then(([details, feedback]) => {
      if (active) {
        setDealer(details.dealer[0]);
        setReviews(feedback.reviews);
        setLoading(false);
      }
    }).catch((failure) => {
      if (active) { setError(failure.message); setLoading(false); }
    });
    return () => { active = false; };
  }, [id]);
  if (loading) { return <main className="page"><p>Loading dealership and reviews...</p></main>; }
  if (error || !dealer) { return <main className="page"><p className="notice error" role="alert">{error || 'Dealer not found'}</p></main>; }
  return <main className="page">
    <Link className="back-link" to="/dealers">← All dealerships</Link>
    <div className="page-heading dealer-heading">
      <div><p className="eyebrow">{dealer.state} · Dealer #{dealer.id}</p><h1>{dealer.full_name}</h1>
        <p className="lead-copy">{dealer.address}, {dealer.city}, {dealer.st} {dealer.zip}</p>
      </div>
      {user && <Link className="button" to={'/postreview/' + id}>Write a Review</Link>}
    </div>
    {search.get('added') && <p className="notice success" role="status">Your review was added successfully.</p>}
    <div className="section-heading"><h2>Customer reviews</h2><span>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span></div>
    {!reviews.length && <p className="notice">No reviews yet. Share your experience with this dealer.</p>}
    <div className="review-grid">{reviews.map((review) => <article className="review-card" key={review.id} data-review-id={review.id}>
      <span className={'sentiment ' + review.sentiment}>
        <img src={icons[review.sentiment]} alt="" />{review.sentiment}
      </span>
      <p className="review-text">{review.review}</p>
      <div className="review-meta"><strong>{review.name}</strong>
        {review.purchase && <span>{review.car_make} {review.car_model} · {review.car_year}<br />Purchased {review.purchase_date}</span>}
      </div>
    </article>)}</div>
  </main>;
}
