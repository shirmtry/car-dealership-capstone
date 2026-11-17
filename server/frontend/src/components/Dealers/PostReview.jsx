import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../AuthContext';

export default function PostReview() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [dealer, setDealer] = useState(null);
  const [cars, setCars] = useState([]);
  const [review, setReview] = useState('');
  const [purchase, setPurchase] = useState(true);
  const [modelId, setModelId] = useState('');
  const [year, setYear] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  useEffect(() => {
    let active = true;
    Promise.all([api('dealer/' + id), api('get_cars')]).then(([details, inventory]) => {
      if (active) { setDealer(details.dealer[0]); setCars(inventory.CarModels); }
    }).catch((failure) => { if (active) { setError(failure.message); } });
    return () => { active = false; };
  }, [id]);
  const chooseModel = (event) => {
    setModelId(event.target.value);
    const selected = cars.find((car) => car.id === Number(event.target.value));
    if (selected) { setYear(String(selected.Year)); }
  };
  const submit = async (event) => {
    event.preventDefault();
    const model = cars.find((car) => car.id === Number(modelId));
    if (purchase && !model) { setError('Choose a car make and model.'); return; }
    setBusy(true);
    setError('');
    try {
      const payload = {
        dealership: Number(id), review, purchase,
        purchase_date: purchase ? date : '',
        car_make: purchase ? model.CarMake : '',
        car_model: purchase ? model.CarModel : '',
        car_year: purchase ? Number(year) : null
      };
      const data = await api('add_review', { method: 'POST', body: JSON.stringify(payload) });
      navigate('/dealer/' + id + '?added=' + data.review.id, { replace: true });
    } catch (failure) {
      setError(failure.message); setBusy(false);
    }
  };
  if (authLoading) { return <main className="page">Checking your session...</main>; }
  if (!user) { return <Navigate to="/login" state={{ from: location.pathname }} replace />; }
  return <main className="page review-page">
    <Link className="back-link" to={'/dealer/' + id}>← Back to dealership</Link>
    <p className="eyebrow">Share your experience</p><h1>Write a Review</h1>
    <p className="review-dealer-name">{dealer ? dealer.full_name : 'Loading dealership...'}</p>
    <form className="review-form" onSubmit={submit}>
      <p className="posting-as">Posting as <strong>{[user.firstName, user.lastName].filter(Boolean).join(' ') || user.userName}</strong> ({user.userName})</p>
      <label className="field" htmlFor="review">Your Review
        <textarea id="review" name="review" value={review} onChange={(event) => setReview(event.target.value)}
          placeholder="Tell other buyers about your experience..." maxLength={5000} required />
      </label>
      <label className="purchase-toggle"><input id="purchase" type="checkbox" checked={purchase}
        onChange={(event) => setPurchase(event.target.checked)} /> I purchased a car from this dealership</label>
      {purchase && <>
        <label className="field" htmlFor="cars">Car Make and Model
          <select id="cars" name="cars" value={modelId} onChange={chooseModel} required>
            <option value="">Choose Car Make and Model</option>
            {cars.map((car) => <option key={car.id} value={car.id}>{car.CarMake} {car.CarModel}</option>)}
          </select>
        </label>
        <div className="form-grid">
          <label className="field" htmlFor="purchase-date">Purchase Date
            <input id="purchase-date" type="date" value={date} max={today} onChange={(event) => setDate(event.target.value)} required />
          </label>
          <label className="field" htmlFor="car-year">Car Year
            <input id="car-year" type="number" min={1900} max={new Date().getFullYear() + 1}
              value={year} onChange={(event) => setYear(event.target.value)} required />
          </label>
        </div>
      </>}
      {error && <p className="notice error" role="alert">{error}</p>}
      <button className="button postreview" type="submit" disabled={busy || !dealer}>
        {busy ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  </main>;
}
