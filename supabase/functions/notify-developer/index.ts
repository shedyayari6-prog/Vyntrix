// supabase/functions/notify-developer/index.ts
// Triggered by a Database Webhook on INSERT into public.conversations.
// Emails the developer the details of the new project request via Resend.

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const DEVELOPER_EMAIL = Deno.env.get('DEVELOPER_EMAIL')!;
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')!;

const esc = (v: unknown) =>
  String(v ?? '—').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );

Deno.serve(async (req) => {
  // Only accept calls that carry our shared secret
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = await req.json();
  if (payload.type !== 'INSERT') return new Response('Ignored');
  const r = payload.record;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px">
      <h2>New project request from ${esc(r.customer_name)}</h2>
      <p><b>Company:</b> ${esc(r.company_name)}</p>
      <p><b>Email:</b> ${esc(r.customer_email)}</p>
      <p><b>Phone:</b> ${esc(r.customer_phone)}</p>
      <p><b>Project:</b> ${esc(r.project_type)}</p>
      <p><b>Budget:</b> ${esc(r.budget)}</p>
      <p><b>Deadline:</b> ${esc(r.requested_deadline)}</p>
      <p><b>Description:</b></p>
      <p style="white-space:pre-wrap">${esc(r.project_description)}</p>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Vyntrix <onboarding@resend.dev>',
      to: [DEVELOPER_EMAIL],
      reply_to: r.customer_email, // pressing "Reply" goes straight to the client
      subject: `New request: ${r.customer_name} (${r.project_type})`,
      html,
    }),
  });

  if (!res.ok) return new Response(await res.text(), { status: 500 });
  return new Response('Sent');
});