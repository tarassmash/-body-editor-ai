document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target, s = document.getElementById('contactStatus');
  const r = await fetch('/api/contact', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: f.email.value, message: f.message.value }),
  }).catch(() => null);
  if (r && r.ok) { f.reset(); s.textContent = 'Thanks! Your message was sent.'; }
  else s.textContent = 'Could not send. Please email us instead.';
});
