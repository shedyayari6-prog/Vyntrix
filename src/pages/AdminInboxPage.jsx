import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Opens a Gmail compose window addressed to the client
const gmailLink = (r) =>
  'https://mail.google.com/mail/?view=cm&fs=1' +
  `&to=${encodeURIComponent(r.customer_email)}` +
  `&su=${encodeURIComponent('Re: Your project request')}` +
  `&body=${encodeURIComponent(
    `Hi ${r.customer_name},\n\nThanks for reaching out about your ${r.project_type} project.\n\n`
  )}`;

export default function AdminInboxPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadRequests();
  }, [session]);

  async function loadRequests() {
    setLoading(true);
    setError('');
    const { data, error: loadError } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false });

    if (loadError) setError(loadError.message);
    else setRequests(data || []);
    setLoading(false);
  }

  async function login(event) {
    event.preventDefault();
    setError('');
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (loginError) setError(loginError.message);
  }

  async function deleteRequest(request) {
    const confirmed = window.confirm(
      `Delete the request from ${request.customer_name}? This cannot be undone.`
    );
    if (!confirmed) return;

    const { data: deleted, error: deleteError } = await supabase.rpc(
      'delete_project_request',
      { p_request_id: request.id }
    );

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (!deleted) {
      setError('The request was not found or was already deleted.');
      return;
    }

    setRequests((current) => current.filter((item) => item.id !== request.id));
    setSelected(null);
  }

  if (!session) {
    return (
      <main className="conversation-page">
        <div className="conversation-card">
          <p className="kicker">DEVELOPER ACCESS</p>
          <h1>Sign in</h1>
          <form onSubmit={login}>
            <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {error && <p className="form-error">{error}</p>}
            <button className="button button-primary">Open requests</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-inbox">
      <header className="admin-header">
        <div><p className="kicker">DEVELOPER INBOX</p><h1>Project requests</h1></div>
        <div>
          <button className="button button-outline" onClick={loadRequests} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>{' '}
          <button className="button button-outline" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </header>
      {error && <p className="form-error">{error}</p>}

      <div className="inbox-grid">
        <aside className="conversation-list">
          {requests.map((request) => (
            <button key={request.id} className="conversation-list-item" onClick={() => setSelected(request)}>
              <strong>{request.customer_name}</strong>
              <span>{request.company_name || request.project_type}</span>
              <small>{new Date(request.created_at).toLocaleString()}</small>
            </button>
          ))}
          {!requests.length && !loading && <p>No project requests yet.</p>}
        </aside>

        <section className="conversation-detail">
          {selected ? (
            <>
              <div className="request-detail-header">
                <div>
                  <p className="kicker">PROJECT REQUEST</p>
                  <h2>{selected.customer_name}</h2>
                </div>
                <button className="button button-danger" onClick={() => deleteRequest(selected)}>
                  Delete request
                </button>
              </div>
              <p><strong>Company:</strong> {selected.company_name || 'Not provided'}</p>
              <p><strong>Email:</strong> {selected.customer_email}</p>
              <p><strong>Phone:</strong> {selected.customer_phone || 'Not provided'}</p>
              <p><strong>Project:</strong> {selected.project_type}</p>
              <p><strong>Budget:</strong> {selected.budget || 'Not provided'}</p>
              <p><strong>Deadline:</strong> {selected.requested_deadline || 'Not provided'}</p>
              <div className="request-description">
                <strong>Description</strong>
                <p>{selected.project_description || 'No description provided.'}</p>
              </div>
              <a
                className="button button-primary"
                href={gmailLink(selected)}
                target="_blank"
                rel="noreferrer"
              >
                Email customer
              </a>
            </>
          ) : <p>Select a project request.</p>}
        </section>
      </div>
    </main>
  );
}