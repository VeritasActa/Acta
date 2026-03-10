/**
 * Acta Web UI
 *
 * Server-rendered HTML. Read-first interface with:
 * - Topic list (home)
 * - Topic feed with typed contributions and computed states
 * - Entry detail page with linked responses (graph display)
 * - Response forms (evidence, challenge, update, resolution)
 * - Charter page
 * - Moderation transparency log
 */

// ── CSS ─────────────────────────────────────────────────────────────

const CSS = `
:root {
  --bg: #0a0a0b;
  --surface: #141416;
  --surface-2: #1c1c20;
  --surface-3: #222228;
  --border: #2a2a30;
  --border-hover: #3a3a42;
  --text: #e4e4e7;
  --text-muted: #8a8a94;
  --text-dim: #5a5a64;
  --accent: #22c55e;
  --accent-dim: rgba(34, 197, 94, 0.15);
  --red: #ef4444;
  --red-dim: rgba(239, 68, 68, 0.15);
  --amber: #f59e0b;
  --amber-dim: rgba(245, 158, 11, 0.15);
  --blue: #3b82f6;
  --blue-dim: rgba(59, 130, 246, 0.15);
  --purple: #a855f7;
  --purple-dim: rgba(168, 85, 247, 0.15);
  --radius: 8px;
  --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.6; min-height: 100vh; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.container { max-width: 820px; margin: 0 auto; padding: 0 20px; }

/* Header */
header { border-bottom: 1px solid var(--border); padding: 14px 0; position: sticky; top: 0; background: rgba(10,10,11,0.92); backdrop-filter: blur(12px); z-index: 100; }
header .container { display: flex; align-items: center; justify-content: space-between; }
.logo { font-size: 18px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text); }
.logo span { color: var(--accent); }
nav a { color: var(--text-muted); margin-left: 20px; font-size: 13px; font-weight: 500; transition: color 0.15s; }
nav a:hover { color: var(--text); text-decoration: none; }

/* Hero */
.hero { padding: 64px 0 48px; text-align: center; }
.hero h1 { font-size: 38px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 14px; }
.hero h1 em { font-style: normal; background: linear-gradient(135deg, var(--accent), #4ade80); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero p { color: var(--text-muted); font-size: 16px; max-width: 540px; margin: 0 auto; }

/* Cards */
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; margin-bottom: 10px; transition: border-color 0.15s; }
.card:hover { border-color: var(--border-hover); }
.card-header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
.card-body { color: var(--text); font-size: 14px; line-height: 1.65; }
.card-body p { margin-bottom: 8px; }
.card-meta { display: flex; gap: 10px; margin-top: 10px; font-size: 11px; color: var(--text-dim); flex-wrap: wrap; }
.card-actions { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; }
.card-actions button { font-size: 11px; padding: 4px 10px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text-muted); border-radius: 4px; cursor: pointer; font-family: var(--font); transition: all 0.15s; }
.card-actions button:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

/* Badges */
.badge { display: inline-flex; align-items: center; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.badge-question { background: var(--blue-dim); color: var(--blue); }
.badge-claim { background: var(--purple-dim); color: var(--purple); }
.badge-prediction { background: var(--amber-dim); color: var(--amber); }
.badge-evidence { background: var(--accent-dim); color: var(--accent); }
.badge-challenge { background: var(--red-dim); color: var(--red); }
.badge-update { background: var(--blue-dim); color: var(--blue); }
.badge-resolution { background: var(--accent-dim); color: var(--accent); }
.badge-open { background: var(--accent-dim); color: var(--accent); }
.badge-contested { background: var(--red-dim); color: var(--red); }
.badge-supported { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(34,197,94,0.25); }
.badge-superseded { background: var(--amber-dim); color: var(--amber); }
.badge-resolved, .badge-resolved_confirmed { background: var(--accent-dim); color: var(--accent); }
.badge-resolved_refuted { background: var(--red-dim); color: var(--red); }
.badge-unsubstantiated { background: var(--amber-dim); color: var(--amber); }
.badge-human { background: var(--surface-2); color: var(--text-dim); }
.badge-agent { background: var(--purple-dim); color: var(--purple); }
.badge-tombstoned { background: var(--red-dim); color: var(--red); }

/* Linked responses */
.responses-section { margin-left: 24px; border-left: 2px solid var(--border); padding-left: 16px; margin-top: 8px; }
.response-card { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; margin-bottom: 8px; }
.response-line { display: flex; align-items: flex-start; gap: 8px; }
.response-line .badge { flex-shrink: 0; margin-top: 2px; }

/* Topic list */
.topic-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 8px; transition: border-color 0.15s; }
.topic-item:hover { border-color: var(--border-hover); }
.topic-name { font-weight: 600; font-size: 14px; }
.topic-stats { color: var(--text-dim); font-size: 12px; }

/* Forms */
.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
select, input, textarea { width: 100%; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 8px 10px; color: var(--text); font-family: var(--font); font-size: 13px; transition: border-color 0.15s; }
select:focus, input:focus, textarea:focus { outline: none; border-color: var(--accent); }
textarea { min-height: 80px; resize: vertical; }
.btn { background: var(--accent); color: #000; border: none; padding: 8px 20px; border-radius: var(--radius); font-family: var(--font); font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
.btn:hover { opacity: 0.9; }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-secondary { background: var(--surface-2); color: var(--text-muted); border: 1px solid var(--border); }
.btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

/* Response form (inline) */
.response-form { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-top: 12px; display: none; }
.response-form.active { display: block; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* Result box */
.result-box { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; margin-top: 12px; font-family: var(--mono); font-size: 12px; white-space: pre-wrap; display: none; }
.result-box.success { border-color: rgba(34,197,94,0.3); }
.result-box.error { border-color: rgba(239,68,68,0.3); }

/* Budget indicator */
.budget-bar { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 16px; font-size: 12px; color: var(--text-muted); }
.budget-dots { display: flex; gap: 3px; }
.budget-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
.budget-dot.spent { background: var(--surface-3); }

/* Moderation log */
.mod-entry { padding: 12px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 8px; font-size: 13px; }
.mod-entry .mod-action { font-weight: 600; }
.mod-entry .mod-time { color: var(--text-dim); font-size: 11px; }

/* Empty state */
.empty { text-align: center; padding: 48px 20px; color: var(--text-muted); }
.empty h3 { margin-bottom: 6px; font-weight: 600; }
.empty p { font-size: 13px; color: var(--text-dim); }
code { background: var(--surface-2); padding: 1px 5px; border-radius: 3px; font-family: var(--mono); font-size: 12px; }

/* Charter */
.invariant { display: flex; gap: 10px; padding: 12px 0; border-bottom: 1px solid var(--border); }
.invariant:last-child { border-bottom: none; }
.invariant-num { color: var(--accent); font-family: var(--mono); font-size: 12px; font-weight: 700; min-width: 20px; }
.invariant-text { font-size: 13px; color: var(--text-muted); }
.invariant-text strong { color: var(--text); font-weight: 600; }

/* Tiers */
.tier-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; font-size: 12px; }

footer { border-top: 1px solid var(--border); padding: 20px 0; margin-top: 48px; text-align: center; font-size: 12px; color: var(--text-dim); }
footer a { color: var(--text-muted); }

/* Verified banner */
.verify-banner { background: var(--accent-dim); border: 1px solid rgba(34,197,94,0.2); border-radius: var(--radius); padding: 10px 14px; margin-bottom: 16px; font-size: 12px; color: var(--accent); display: flex; align-items: center; gap: 6px; }

@media (max-width: 600px) {
  .hero h1 { font-size: 26px; }
  .tier-grid { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}
`;

// ── Shared JS ───────────────────────────────────────────────────────

const CLIENT_JS = `
let budgetTokens = null;

function updateFormFields() {
  const type = document.getElementById('c-type').value;
  document.querySelectorAll('.type-fields').forEach(el => el.style.display = 'none');
  const fields = document.getElementById(type + '-fields');
  if (fields) fields.style.display = 'block';
}

function showResponseForm(entryId, formType) {
  // Hide all open forms first
  document.querySelectorAll('.response-form').forEach(f => f.classList.remove('active'));
  const form = document.getElementById('resp-form-' + entryId);
  if (form) {
    form.classList.add('active');
    // Set the response type
    const typeSelect = form.querySelector('.resp-type');
    if (typeSelect && formType) typeSelect.value = formType;
    updateResponseFields(form);
  }
}

function updateResponseFields(form) {
  const type = form.querySelector('.resp-type').value;
  form.querySelectorAll('.resp-type-fields').forEach(el => el.style.display = 'none');
  const fields = form.querySelector('.' + type + '-resp-fields');
  if (fields) fields.style.display = 'block';
}

function showResult(el, data, success) {
  el.style.display = 'block';
  el.className = 'result-box ' + (success ? 'success' : 'error');
  el.textContent = JSON.stringify(data, null, 2);
  if (success && data.tokens_remaining !== undefined) {
    budgetTokens = data.tokens_remaining;
    updateBudgetDisplay();
  }
}

function updateBudgetDisplay() {
  const dots = document.querySelectorAll('.budget-dot');
  if (!dots.length || budgetTokens === null) return;
  dots.forEach((dot, i) => {
    dot.className = 'budget-dot' + (i >= budgetTokens ? ' spent' : '');
  });
  const label = document.getElementById('budget-label');
  if (label) label.textContent = budgetTokens + ' tokens remaining';
}

async function submitContribution(e) {
  e.preventDefault();
  const type = document.getElementById('c-type').value;
  const payload = { body: document.getElementById('c-body').value };

  if (type === 'claim') {
    payload.category = document.getElementById('c-category').value;
    const src = document.getElementById('c-source')?.value;
    if (src) payload.source = src;
    const unc = document.getElementById('c-uncertainty')?.value;
    if (unc) payload.uncertainty = unc;
    const reasoning = document.getElementById('c-reasoning')?.value;
    if (reasoning) payload.reasoning = reasoning;
  }
  if (type === 'prediction') {
    payload.resolution_criteria = document.getElementById('c-criteria').value;
    const dateVal = document.getElementById('c-date').value;
    payload.resolution_date = dateVal ? new Date(dateVal).toISOString() : '';
    payload.resolution_source = document.getElementById('c-resolution-source').value;
  }

  const resultEl = document.getElementById('contribute-result');
  try {
    const res = await fetch('/api/contribute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, topic: document.getElementById('c-topic').value, payload }),
    });
    const data = await res.json();
    showResult(resultEl, data, res.ok);
    if (res.ok) setTimeout(() => location.reload(), 1200);
  } catch (err) {
    showResult(resultEl, { error: err.message }, false);
  }
}

async function submitResponse(entryId, topic) {
  const form = document.getElementById('resp-form-' + entryId);
  const type = form.querySelector('.resp-type').value;
  const payload = {
    target_id: entryId,
    body: form.querySelector('.resp-body').value,
  };

  if (type === 'evidence') {
    payload.source = form.querySelector('.resp-source')?.value || '';
    payload.stance = form.querySelector('.resp-stance')?.value || 'supporting';
  }
  if (type === 'challenge') {
    payload.target_assertion = form.querySelector('.resp-target-assertion')?.value || '';
    payload.basis = form.querySelector('.resp-basis')?.value || '';
    payload.argument = form.querySelector('.resp-argument')?.value || '';
    const src = form.querySelector('.resp-challenge-source')?.value;
    if (src) payload.source = src;
  }
  if (type === 'update') {
    payload.update_type = form.querySelector('.resp-update-type')?.value || '';
  }
  if (type === 'resolution') {
    payload.outcome = form.querySelector('.resp-outcome')?.value || '';
    payload.source = form.querySelector('.resp-resolution-source')?.value || '';
    payload.resolution_type = form.querySelector('.resp-resolution-type')?.value || '';
  }

  const resultEl = form.querySelector('.resp-result');
  try {
    const res = await fetch('/api/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, topic, payload }),
    });
    const data = await res.json();
    showResult(resultEl, data, res.ok);
    if (res.ok) setTimeout(() => location.reload(), 1200);
  } catch (err) {
    showResult(resultEl, { error: err.message }, false);
  }
}
`;

// ── Layout ──────────────────────────────────────────────────────────

function layout(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} — Acta</title>
  <meta name="description" content="A contestable, checkable, versioned public record for epistemically accountable coordination.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>${CSS}</style>
</head>
<body>
  <header>
    <div class="container">
      <a href="/" class="logo">A<span>C</span>TA</a>
      <nav>
        <a href="/">Feed</a>
        <a href="/about">Charter</a>
        <a href="/moderation-log">Moderation</a>
        <a href="https://github.com/VeritasActa/acta" target="_blank">GitHub</a>
      </nav>
    </div>
  </header>
  ${body}
  <footer>
    <div class="container">
      Typed contributions · Hash-chained · Identity by <a href="https://scopeblind.com">ScopeBlind</a> · <a href="/api/charter">API</a>
    </div>
  </footer>
  <script>${CLIENT_JS}</script>
</body>
</html>`;
}

// ── Pages ───────────────────────────────────────────────────────────

function homePage(data) {
  const topics = data.topics || [];
  const topicsList = topics.length > 0
    ? topics.map(t => `
        <a href="/topic/${encodeURIComponent(t.topic)}" style="text-decoration:none;color:inherit;">
          <div class="topic-item">
            <span class="topic-name">${esc(t.topic)}</span>
            <span class="topic-stats">${t.entry_count} entries · ${timeAgo(t.last_entry_at)}</span>
          </div>
        </a>`).join('')
    : `<div class="empty"><h3>No topics yet</h3><p>POST to <code>/api/contribute</code> or use the form below.</p></div>`;

  return layout('Feed', `
    <main class="container">
      <div class="hero">
        <h1>The <em>public record</em></h1>
        <p>Typed contributions. Explicit burdens. Tamper-evident. Challengeable.</p>
      </div>
      <div class="verify-banner">⛓ Every entry is hash-chained. Verify: <code>GET /api/verify?topic=…</code></div>
      <h2 style="font-size:16px;font-weight:700;margin-bottom:12px;">Topics</h2>
      ${topicsList}
      ${contributeForm('')}
    </main>
  `);
}

function topicPage(data) {
  const { topic, entries, responses_map } = data;

  // Group: contributions with their linked responses
  const contributions = entries.filter(e => e.type === 'contribution');
  const allResponses = entries.filter(e => e.type === 'response');

  const entriesHtml = contributions.length > 0
    ? contributions.map(c => {
      const linkedResponses = allResponses.filter(r =>
        (r.linked_to || []).includes(c.entry_id)
      );
      return renderEntry(c, linkedResponses, topic);
    }).join('')
    : `<div class="empty"><h3>No contributions yet</h3></div>`;

  return layout(topic, `
    <main class="container" style="padding-top:32px;">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:6px;">${esc(topic)}</h1>
      <p style="color:var(--text-muted);font-size:13px;margin-bottom:20px;">
        ${entries.length} entries · <a href="/api/verify?topic=${encodeURIComponent(topic)}">Verify chain ⛓</a>
      </p>
      ${entriesHtml}
      ${contributeForm(topic)}
    </main>
  `);
}

function renderEntry(entry, linkedResponses, topic) {
  const state = entry.computed_state || entry.state || 'open';
  const hint = entry.display_hint;
  const stateLabel = hint === 'supported' ? 'supported' : state;

  const responseCounts = {};
  for (const r of linkedResponses) {
    responseCounts[r.subtype] = (responseCounts[r.subtype] || 0) + 1;
  }

  const countsHtml = Object.entries(responseCounts).map(([type, count]) =>
    `<span class="badge badge-${type}">${count} ${type}</span>`
  ).join(' ');

  const responsesHtml = linkedResponses.length > 0
    ? `<div class="responses-section">
        ${linkedResponses.map(r => `
          <div class="response-card">
            <div class="response-line">
              <span class="badge badge-${r.subtype}">${r.subtype}</span>
              ${r.author_type === 'agent' ? '<span class="badge badge-agent">agent</span>' : ''}
              <span style="font-size:13px;">${esc(r.body_preview || r.payload?.body || '')}</span>
            </div>
            ${r.payload?.source ? `<div style="margin-top:6px;font-size:11px;color:var(--text-dim);">Source: ${esc(r.payload.source)}</div>` : ''}
            ${r.subtype === 'challenge' ? `
              <div style="margin-top:6px;font-size:11px;color:var(--red);">
                Basis: ${esc(r.payload?.basis || '')} · Target: "${esc((r.payload?.target_assertion || '').slice(0, 80))}"
              </div>` : ''}
            ${r.subtype === 'evidence' ? `<div style="margin-top:4px;font-size:11px;color:var(--text-dim);">Stance: ${r.payload?.stance || ''}</div>` : ''}
            <div class="card-meta">
              <span>#${r.sequence}</span>
              <span>${timeAgo(r.timestamp)}</span>
              <span>${(r.entry_hash || '').slice(0, 10)}…</span>
            </div>
          </div>
        `).join('')}
      </div>`
    : '';

  return `
    <div class="card">
      <div class="card-header">
        <span class="badge badge-${entry.subtype}">${entry.subtype}</span>
        <span class="badge badge-${stateLabel}">${stateLabel}</span>
        ${entry.author_type === 'agent' ? '<span class="badge badge-agent">agent</span>' : ''}
        ${(entry.moderation_tags || entry.tags || []).map(t => `<span class="badge badge-unsubstantiated">${esc(t)}</span>`).join('')}
        ${entry.category ? `<span style="font-size:11px;color:var(--text-dim);">${entry.category}</span>` : ''}
      </div>
      <div class="card-body">${esc(entry.body_preview || entry.payload?.body || '')}</div>
      ${entry.payload?.source ? `<div style="margin-top:6px;font-size:12px;color:var(--text-dim);">📎 ${esc(entry.payload.source)}</div>` : ''}
      ${entry.payload?.uncertainty ? `<div style="margin-top:6px;font-size:12px;color:var(--amber);">⚖ ${esc(entry.payload.uncertainty)}</div>` : ''}
      ${entry.subtype === 'prediction' ? `<div style="margin-top:6px;font-size:12px;color:var(--amber);">📅 Resolves: ${entry.payload?.resolution_date || '?'} · Source: ${esc(entry.payload?.resolution_source || '?')}</div>` : ''}
      <div class="card-meta">
        <span>#${entry.sequence}</span>
        <span>${timeAgo(entry.timestamp)}</span>
        <span title="${entry.entry_hash}">${(entry.entry_hash || '').slice(0, 10)}…</span>
        ${countsHtml}
      </div>
      <div class="card-actions">
        <button onclick="showResponseForm('${entry.entry_id}','evidence')">+ Evidence</button>
        <button onclick="showResponseForm('${entry.entry_id}','challenge')">+ Challenge</button>
        <button onclick="showResponseForm('${entry.entry_id}','update')">+ Update</button>
        ${entry.subtype === 'question' || entry.subtype === 'prediction' ? `<button onclick="showResponseForm('${entry.entry_id}','resolution')">+ Resolution</button>` : ''}
      </div>
      ${responseForm(entry.entry_id, topic)}
      ${responsesHtml}
    </div>`;
}

function responseForm(entryId, topic) {
  return `
    <div class="response-form" id="resp-form-${entryId}">
      <div class="form-group">
        <label>Response Type</label>
        <select class="resp-type" onchange="updateResponseFields(this.closest('.response-form'))">
          <option value="evidence">Evidence</option>
          <option value="challenge">Challenge</option>
          <option value="update">Update</option>
          <option value="resolution">Resolution</option>
        </select>
      </div>
      <div class="form-group">
        <label>Body</label>
        <textarea class="resp-body" placeholder="Your response…"></textarea>
      </div>

      <!-- Evidence fields -->
      <div class="resp-type-fields evidence-resp-fields">
        <div class="form-row">
          <div class="form-group">
            <label>Source</label>
            <input type="text" class="resp-source" placeholder="https://…">
          </div>
          <div class="form-group">
            <label>Stance</label>
            <select class="resp-stance">
              <option value="supporting">Supporting</option>
              <option value="refuting">Refuting</option>
              <option value="contextual">Contextual</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Challenge fields -->
      <div class="resp-type-fields challenge-resp-fields" style="display:none;">
        <div class="form-group">
          <label>Specific assertion being challenged</label>
          <input type="text" class="resp-target-assertion" placeholder="Quote the exact claim…">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Basis</label>
            <select class="resp-basis">
              <option value="counter_evidence">Counter Evidence</option>
              <option value="logical_error">Logical Error</option>
              <option value="source_unreliable">Source Unreliable</option>
              <option value="missing_context">Missing Context</option>
            </select>
          </div>
          <div class="form-group">
            <label>Source (if counter_evidence or source_unreliable)</label>
            <input type="text" class="resp-challenge-source" placeholder="https://…">
          </div>
        </div>
        <div class="form-group">
          <label>Argument (substantive refutation, min 20 chars)</label>
          <textarea class="resp-argument" placeholder="Explain why this assertion is wrong…"></textarea>
        </div>
      </div>

      <!-- Update fields -->
      <div class="resp-type-fields update-resp-fields" style="display:none;">
        <div class="form-group">
          <label>Update Type</label>
          <select class="resp-update-type">
            <option value="correction">Correction</option>
            <option value="additional_context">Additional Context</option>
            <option value="scope_change">Scope Change</option>
            <option value="alternative_source">Alternative Source</option>
          </select>
        </div>
      </div>

      <!-- Resolution fields -->
      <div class="resp-type-fields resolution-resp-fields" style="display:none;">
        <div class="form-group">
          <label>Outcome</label>
          <textarea class="resp-outcome" placeholder="What happened…"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Source</label>
            <input type="text" class="resp-resolution-source" placeholder="https://…">
          </div>
          <div class="form-group">
            <label>Resolution Type</label>
            <select class="resp-resolution-type">
              <option value="answered">Answered (questions)</option>
              <option value="confirmed">Confirmed</option>
              <option value="refuted">Refuted</option>
              <option value="partially_confirmed">Partially Confirmed</option>
              <option value="unresolvable">Unresolvable</option>
            </select>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="btn" onclick="submitResponse('${entryId}','${esc(topic)}')">Submit Response</button>
        <button class="btn btn-secondary" onclick="this.closest('.response-form').classList.remove('active')">Cancel</button>
      </div>
      <div class="resp-result result-box"></div>
    </div>`;
}

function contributeForm(defaultTopic) {
  return `
    <div style="padding:32px 0;">
      <h2 style="font-size:16px;font-weight:700;margin-bottom:12px;">Contribute</h2>
      <form onsubmit="return submitContribution(event)">
        <div class="form-row">
          <div class="form-group">
            <label>Topic</label>
            <input type="text" id="c-topic" value="${esc(defaultTopic)}" placeholder="e.g., scopeblind, acta-protocol" required>
          </div>
          <div class="form-group">
            <label>Type</label>
            <select id="c-type" onchange="updateFormFields()">
              <option value="question">Question</option>
              <option value="claim">Claim</option>
              <option value="prediction">Prediction</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Body</label>
          <textarea id="c-body" placeholder="Your contribution…" required></textarea>
        </div>
        <div class="type-fields" id="claim-fields" style="display:none;">
          <div class="form-row">
            <div class="form-group">
              <label>Category</label>
              <select id="c-category">
                <option value="opinion">Opinion</option>
                <option value="factual">Factual</option>
                <option value="hypothesis">Hypothesis</option>
              </select>
            </div>
            <div class="form-group">
              <label>Source (required for factual)</label>
              <input type="text" id="c-source" placeholder="https://…">
            </div>
          </div>
          <div class="form-group">
            <label>Reasoning (alternative to source for factual)</label>
            <textarea id="c-reasoning" placeholder="Logical argument…"></textarea>
          </div>
          <div class="form-group">
            <label>Uncertainty (required for opinion/hypothesis)</label>
            <textarea id="c-uncertainty" placeholder="Confidence, limitations, what would change your mind…"></textarea>
          </div>
        </div>
        <div class="type-fields" id="prediction-fields" style="display:none;">
          <div class="form-group">
            <label>Resolution Criteria</label>
            <textarea id="c-criteria" placeholder="How to determine if confirmed or refuted…"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Resolution Date</label>
              <input type="date" id="c-date">
            </div>
            <div class="form-group">
              <label>Resolution Source</label>
              <input type="text" id="c-resolution-source" placeholder="URL of authoritative source">
            </div>
          </div>
        </div>
        <button type="submit" class="btn">Submit Contribution</button>
      </form>
      <div id="contribute-result" class="result-box"></div>
    </div>`;
}

function aboutPage() {
  const invariants = [
    { t: 'Typed Contributions', d: 'A question has no evidence burden. A claim requires evidence. A prediction requires resolution criteria.' },
    { t: 'Provenance & History', d: 'Who contributed it, when, in response to what, how it has been updated — all public.' },
    { t: 'Challengeability', d: 'No contribution and no moderation decision is beyond challenge.' },
    { t: 'Anti-Scale-Dominance', d: 'No entity can use volume or resources to drown out others.' },
    { t: 'Agents as Delegates', d: 'AI agents are disclosed tools with bounded budgets, not default peers.' },
    { t: 'Record Integrity', d: 'No entity — including the operator — can silently alter the record.' },
    { t: 'Explicit Lifecycle', d: 'Resolution and supersession are visible, auditable, and challengeable.' },
  ];

  return layout('Charter', `
    <main class="container" style="padding-top:40px;">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="font-size:28px;font-weight:800;margin-bottom:8px;">Charter</h1>
        <p style="color:var(--text-muted);font-size:15px;">These do not change. They define what Acta is.</p>
      </div>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:32px;text-align:center;">
        <div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Mission</div>
        <p style="font-size:20px;font-weight:700;">Shared reality for coordination.</p>
      </div>
      <h2 style="font-size:16px;font-weight:700;margin-bottom:16px;">Permanent Invariants</h2>
      ${invariants.map((inv, i) => `
        <div class="invariant">
          <span class="invariant-num">${i + 1}</span>
          <div class="invariant-text"><strong>${inv.t}.</strong> ${inv.d}</div>
        </div>`).join('')}
      <div style="margin-top:32px;padding:18px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);">
        <h3 style="font-size:13px;color:var(--text-muted);margin-bottom:10px;">How content is handled</h3>
        <div class="tier-grid">
          <div>
            <div style="color:var(--accent);font-weight:600;margin-bottom:3px;">Tier 1: Deterministic</div>
            <div style="color:var(--text-muted);">Schema, budget, spam detection. Code, not judgment.</div>
          </div>
          <div>
            <div style="color:var(--amber);font-weight:600;margin-bottom:3px;">Tier 2: LLM-Assisted</div>
            <div style="color:var(--text-muted);">Tags only. Never irreversible epistemic decisions.</div>
          </div>
          <div>
            <div style="color:var(--red);font-weight:600;margin-bottom:3px;">Tier 3: Human Review</div>
            <div style="color:var(--text-muted);">Appeals, hard-reject confirmation. Final but challengeable.</div>
          </div>
        </div>
      </div>
    </main>
  `);
}

function moderationLogPage(data) {
  const entries = data.entries || [];
  const entriesHtml = entries.length > 0
    ? entries.map(e => `
        <div class="mod-entry">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="mod-action">
              <span class="badge badge-${e.action || 'open'}">${esc(e.action || 'unknown')}</span>
              ${e.category ? `<span class="badge badge-tombstoned">${esc(e.category)}</span>` : ''}
            </span>
            <span class="mod-time">${timeAgo(e.timestamp || e.queued_at)}</span>
          </div>
          ${e.reasoning ? `<div style="margin-top:6px;font-size:12px;color:var(--text-muted);">${esc(e.reasoning)}</div>` : ''}
          ${e.status ? `<div style="margin-top:4px;font-size:11px;color:var(--text-dim);">Status: ${esc(e.status)}</div>` : ''}
        </div>`).join('')
    : `<div class="empty"><h3>No moderation events</h3><p>All clear. Transparency is a permanent invariant.</p></div>`;

  return layout('Moderation Log', `
    <main class="container" style="padding-top:40px;">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:6px;">Moderation Transparency Log</h1>
      <p style="color:var(--text-muted);font-size:13px;margin-bottom:20px;">
        All moderation actions are publicly visible. Charter §3: No decision is beyond challenge.
      </p>
      ${entriesHtml}
    </main>
  `);
}

function notFoundPage() {
  return layout('Not Found', `
    <main class="container">
      <div class="empty" style="padding:80px 20px;">
        <h3>404</h3>
        <p><a href="/">Go home</a></p>
      </div>
    </main>
  `);
}

// ── Helpers ──────────────────────────────────────────────────────────

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function timeAgo(isoDate) {
  if (!isoDate) return '';
  const s = Math.floor((Date.now() - new Date(isoDate)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

// ── Export ───────────────────────────────────────────────────────────

export function renderHTML(page, data = {}) {
  switch (page) {
    case 'home': return homePage(data);
    case 'topic': return topicPage(data);
    case 'about': return aboutPage(data);
    case 'moderation': return moderationLogPage(data);
    case '404': return notFoundPage();
    default: return notFoundPage();
  }
}
