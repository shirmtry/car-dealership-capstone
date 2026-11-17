import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../AuthContext';

export default function Dealers() {
  const [dealers, setDealers] = useState([]);
  const [states, setStates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useSearchParams();
  const selected = search.get('state') || 'All';
  const { user } = useAuth();
  useEffect(() => {
    let active = true;
    api('get_dealers').then((data) => {
      if (active) {
        setStates([...new Set(data.dealers.map((dealer) => dealer.state))].sort());
        setTotal(data.dealers.length);
      }
    }).catch((failure) => { if (active) { setError(failure.message); } });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const endpoint = 'get_dealers' + (selected === 'All' ? '' : '/' + encodeURIComponent(selected));
    api(endpoint).then((data) => {
      if (active) { setDealers(data.dealers); setLoading(false); }
    }).catch((failure) => {
      if (active) { setError(failure.message); setLoading(false); }
    });
    return () => { active = false; };
  }, [selected]);
  return <main className="page">
    <div className="page-heading">
      <div><p className="eyebrow">Explore the network</p><h1>Find a dealership</h1>
        <p className="lead-copy">Compare dealers and discover what other car buyers have to say.</p>
      </div>
      <label className="state-filter" htmlFor="state">Filter by state
        <select id="state" name="state" value={selected}
          onChange={(event) => setSearch(event.target.value === 'All' ? {} : { state: event.target.value })}>
          <option value="All">All States</option>
          {states.map((state) => <option key={state} value={state}>{state}</option>)}
        </select>
      </label>
    </div>
    <div className="results-bar">
      <span>{loading ? 'Loading dealerships...' : dealers.length + (dealers.length === 1 ? ' dealership' : ' dealerships')}
        {selected !== 'All' && ' in ' + selected}</span>
      <span>{total > 0 && total + ' dealers in our network'}</span>
    </div>
    {error && <p className="notice error" role="alert">{error}</p>}
    {!error && <div className="table-wrap">
      <table className="dealer-table">
        <thead><tr><th>ID</th><th>Dealer Name</th><th>City</th><th>Address</th><th>ZIP</th><th>State</th>
          {user && <th>Review Dealer</th>}
        </tr></thead>
        <tbody>{dealers.map((dealer) => <tr key={dealer.id}>
          <td>{dealer.id}</td><td><Link className="dealer-name" to={'/dealer/' + dealer.id}>{dealer.full_name}</Link></td>
          <td>{dealer.city}</td><td>{dealer.address}</td><td>{dealer.zip}</td><td>{dealer.state}</td>
          {user && <td><Link className="review-link" to={'/postreview/' + dealer.id}>Review Dealer</Link></td>}
        </tr>)}</tbody>
      </table>
      {!loading && dealers.length === 0 && <p className="notice">No dealerships match this state.</p>}
    </div>}
    {!user && <p className="form-hint"><Link to="/login">Login</Link> to write your own dealer review.</p>}
  </main>;
}
