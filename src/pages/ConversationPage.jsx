import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const initialForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  projectType: 'Website',
  description: '',
  budget: '',
  deadline: '',
};

export default function ConversationPage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submitRequest(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { data: conversationId, error: requestError } = await supabase.rpc(
      'submit_project_request',
      {
        p_customer_name: form.name.trim(),
        p_company_name: form.company.trim() || null,
        p_customer_email: form.email.trim(),
        p_customer_phone: form.phone.trim() || null,
        p_project_type: form.projectType,
        p_budget: form.budget.trim() || null,
        p_requested_deadline: form.deadline || null,
        p_description: form.description.trim(),
      }
    );

    if (requestError) {
      console.error('Supabase request error:', requestError);
      setError(requestError.message);
      setLoading(false);
      return;
    }

    // Resend doit être appelé côté serveur via une Supabase Edge Function.
    const { error: emailError } = await supabase.functions.invoke(
      'notify-new-project',
      { body: { conversationId } }
    );

    if (emailError) {
      // La demande est déjà enregistrée dans Supabase.
      console.error('Developer notification failed:', emailError);
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <main className="conversation-page success-state">
        <div className="conversation-card">
          <p className="kicker">REQUEST RECEIVED</p>
          <h1>Thank you, {form.name}.</h1>
          <p>
            Your project request has been received. We will contact you at{' '}
            {form.email}.
          </p>
          <a className="button button-outline" href="/">
            Back to home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="conversation-page">
      <div className="conversation-card">
        <a className="text-link" href="/">
          ← Back to home
        </a>
        <p className="kicker">START A REQUEST</p>
        <h1>Tell us about your project.</h1>
        <p>
          Share the details below. We will prepare a realistic timeline and
          price proposal.
        </p>

        <form onSubmit={submitRequest}>
          <label>
            Your name *
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              required
              minLength={2}
            />
          </label>

          <label>
            Company name
            <input name="company" value={form.company} onChange={updateField} />
          </label>

          <label>
            Email *
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Phone
            <input name="phone" value={form.phone} onChange={updateField} />
          </label>

          <label>
            Project type *
            <select
              name="projectType"
              value={form.projectType}
              onChange={updateField}
            >
              <option>Website</option>
              <option>Web application</option>
              <option>Mobile application</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            Desired deadline
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={updateField}
            />
          </label>

          <label>
            Estimated budget
            <input
              name="budget"
              value={form.budget}
              onChange={updateField}
              placeholder="Example: 300 TND"
            />
          </label>

          <label>
            Project description *
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              required
              minLength={10}
              rows={7}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="button button-primary"
          >
            {loading ? 'Sending...' : 'Send project request'}
          </button>
        </form>
      </div>
    </main>
  );
}