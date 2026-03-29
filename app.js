// ─── State ───────────────────────────────────────────────────────────────────
const state = { tier: 'l1', qtype: 'scoping', activeTech: null };

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS = {
  get: (k, fallback = null) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

const SECTION_META = {
  scoping:         { label: 'Scoping',         icon: '🔍', desc: 'Environment & impact questions' },
  probing:         { label: 'Probing',          icon: '🧪', desc: 'Diagnostic commands & data requests' },
  troubleshooting: { label: 'Troubleshooting',  icon: '🛠',  desc: 'Resolution steps' },
  datacollection:  { label: 'Data Collection',  icon: '📦', desc: 'Logs, traces & exports' }
};

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Restore persisted state
  const savedTier  = LS.get('pcy_tier', 'l1');
  const savedQtype = LS.get('pcy_qtype', 'scoping');
  const savedTech  = LS.get('pcy_tech', null);
  const savedGlass = LS.get('pcy_glass', false);

  // Restore theme
  if (savedGlass) {
    _isGlass = true;
    document.body.classList.add('theme-glass');
    document.getElementById('themeIcon').textContent    = '☀️';
    document.getElementById('themeTooltip').textContent = 'Dark';
  }

  renderTechSection();

  // Restore tier
  state.tier = savedTier;
  document.querySelectorAll('.tier-btn').forEach(b => b.classList.toggle('active', b.dataset.tier === savedTier));

  // Restore qtype
  state.qtype = savedQtype;
  document.querySelectorAll('.qtype-tab').forEach(b => b.classList.toggle('active', b.dataset.type === savedQtype));

  // Restore selected tech
  if (savedTech && QUESTION_BANK[savedTech]) {
    state.activeTech = savedTech;
    document.querySelectorAll('.tech-btn').forEach(b => b.classList.toggle('active', b.dataset.tech === savedTech));
    renderQuestions();
  }

  // Restore case notes fields
  _cnFields.forEach(id => {
    const el = document.getElementById(id);
    const val = LS.get('pcy_cn_' + id, '');
    if (el && val) { el.value = val; }
  });
  updatePreview();

  // Restore AI provider
  const savedProvider = LS.get('pcy_ai_provider', 'gemini');
  setAiProvider(savedProvider);
});

function renderTechSection() {
  const container = document.getElementById('techSection');
  container.innerHTML = '';
  Object.entries(TECH_CATEGORIES).forEach(([cat, keys]) => {
    const group = document.createElement('div');
    group.className = 'tech-group';
    group.innerHTML = `<div class="tech-group-label">${cat}</div>`;
    const grid = document.createElement('div');
    grid.className = 'tech-grid';
    keys.forEach(key => {
      const tech = QUESTION_BANK[key];
      if (!tech) return;
      const btn = document.createElement('button');
      btn.className = 'tech-btn';
      btn.dataset.tech = key;
      btn.innerHTML = `<span class="tech-icon">${tech.icon}</span><span class="tech-label">${tech.label}</span>`;
      btn.onclick = () => selectTech(key);
      grid.appendChild(btn);
    });
    group.appendChild(grid);
    container.appendChild(group);
  });
}


// ─── Tier Selection ──────────────────────────────────────────────────────────
function setTier(tier) {
  state.tier = tier;
  LS.set('pcy_tier', tier);
  document.querySelectorAll('.tier-btn').forEach(b => b.classList.toggle('active', b.dataset.tier === tier));
  if (state.activeTech) renderQuestions();
}

// ─── Question Type ────────────────────────────────────────────────────────────
function setQtype(type) {
  state.qtype = type;
  LS.set('pcy_qtype', type);
  document.querySelectorAll('.qtype-tab').forEach(b => b.classList.toggle('active', b.dataset.type === type));
  if (state.activeTech) renderQuestions();
}

// ─── Tech Selection ───────────────────────────────────────────────────────────
function selectTech(techKey) {
  state.activeTech = techKey;
  LS.set('pcy_tech', techKey);
  document.querySelectorAll('.tech-btn').forEach(b => b.classList.toggle('active', b.dataset.tech === techKey));
  renderQuestions();
}

// ─── Render Questions ─────────────────────────────────────────────────────────
function renderQuestions() {
  const tech = QUESTION_BANK[state.activeTech];
  if (!tech) return;

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('questionsOutput').style.display = 'block';

  const tierLabel = { l1: 'L1 Support', l2: 'L2 Support', both: 'L1 + L2' }[state.tier];
  const qtypeLabel = state.qtype === 'all' ? 'All Sections' : (SECTION_META[state.qtype]?.label || state.qtype);

  document.getElementById('outputMeta').innerHTML =
    `<span class="meta-tag">${tech.icon} ${tech.label}</span>
     <span class="meta-tag tier-${state.tier}">${tierLabel}</span>
     <span class="meta-tag">${qtypeLabel}</span>`;

  const list = document.getElementById('questionsList');
  list.innerHTML = '';

  // Clear search on re-render
  const si = document.getElementById('searchInput');
  if (si) { si.value = ''; }
  const sc = document.getElementById('searchCount');
  if (sc) sc.textContent = '';
  const sb = document.getElementById('searchClear');
  if (sb) sb.style.display = 'none';
  const tiers  = state.tier === 'both' ? ['l1','l2'] : [state.tier];
  const qtypes = state.qtype === 'all' ? ['scoping','probing','troubleshooting','datacollection'] : [state.qtype];

  tiers.forEach(tier => {
    qtypes.forEach(qtype => {
      const items = tech[qtype]?.[tier];
      if (!items || !items.length) return;
      const meta = SECTION_META[qtype] || {};
      const section = document.createElement('div');
      section.className = 'question-section';
      section.innerHTML = `
        <div class="section-label">
          <span class="label-icon">${meta.icon || ''}</span>
          <span class="label-tier ${tier}">${tier.toUpperCase()}</span>
          <span class="label-type">${meta.label || qtype}</span>
          <span class="label-desc">${meta.desc || ''}</span>
          <span class="label-count">${items.length} items</span>
        </div>`;
      items.forEach((q, i) => {
        const item = document.createElement('div');
        item.className = 'question-item';

        // Checkbox
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'q-check';
        cb.id = `chk-${tier}-${qtype}-${i}`;
        cb.setAttribute('aria-label', 'Mark question as done');
        cb.addEventListener('change', function() {
          item.classList.toggle('checked', this.checked);
          updateProgress();
        });

        // Number
        const num = document.createElement('span');
        num.className = 'q-num';
        num.textContent = String(i+1).padStart(2,'0');

        // Question text
        const text = document.createElement('span');
        text.className = 'q-text';
        text.dataset.raw = q;
        text.textContent = q;

        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'q-copy';
        copyBtn.title = 'Copy';
        copyBtn.textContent = '⧉';
        copyBtn.addEventListener('click', () => copyQuestion(q));

        item.appendChild(cb);
        item.appendChild(num);
        item.appendChild(text);
        item.appendChild(copyBtn);
        section.appendChild(item);
      });
      list.appendChild(section);
    });
  });
  updateProgress();
}

// ─── Checkboxes & Progress ─────────────────────────────────────────────────────────
function onCheckChange(cb) {
  cb.closest('.question-item').classList.toggle('checked', cb.checked);
  updateProgress();
}

function updateProgress() {
  const all     = document.querySelectorAll('#questionsList .q-check');
  const checked = document.querySelectorAll('#questionsList .q-check:checked');
  const total   = all.length;
  const done    = checked.length;
  const row     = document.getElementById('progressRow');
  if (!row) return;
  row.style.display = total > 0 ? 'flex' : 'none';
  document.getElementById('progressLabel').textContent = `${done} / ${total} checked`;
  document.getElementById('progressFill').style.width  = total > 0 ? `${(done/total)*100}%` : '0%';
}

function clearChecked() {
  document.querySelectorAll('#questionsList .q-check').forEach(cb => {
    cb.checked = false;
    cb.closest('.question-item').classList.remove('checked');
  });
  updateProgress();
}

// ─── Search / Filter ────────────────────────────────────────────────────────────
function filterQuestions() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const clearBtn = document.getElementById('searchClear');
  const countEl  = document.getElementById('searchCount');
  clearBtn.style.display = q ? 'inline' : 'none';

  const items = document.querySelectorAll('#questionsList .question-item');
  let visible = 0;

  items.forEach(item => {
    const textEl = item.querySelector('.q-text');
    const raw    = textEl.dataset.raw || textEl.textContent;
    textEl.dataset.raw = raw; // cache original

    if (!q) {
      item.classList.remove('q-hidden');
      textEl.innerHTML = escapeHtml(raw);
      visible++;
      return;
    }

    const idx = raw.toLowerCase().indexOf(q);
    if (idx === -1) {
      item.classList.add('q-hidden');
    } else {
      item.classList.remove('q-hidden');
      // Highlight match
      const before = escapeHtml(raw.slice(0, idx));
      const match  = escapeHtml(raw.slice(idx, idx + q.length));
      const after  = escapeHtml(raw.slice(idx + q.length));
      textEl.innerHTML = `${before}<mark class="q-highlight">${match}</mark>${after}`;
      visible++;
    }
  });

  // Hide empty sections
  document.querySelectorAll('#questionsList .question-section').forEach(sec => {
    const anyVisible = [...sec.querySelectorAll('.question-item')].some(i => !i.classList.contains('q-hidden'));
    sec.style.display = anyVisible ? '' : 'none';
  });

  countEl.textContent = q ? `${visible} match${visible !== 1 ? 'es' : ''}` : '';
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  filterQuestions();
  document.getElementById('searchInput').focus();
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── Copy & Export ─────────────────────────────────────────────────────────────
function copyQuestion(text) {
  navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
}

function copyAll() {
  const lines = [...document.querySelectorAll('#questionsList .q-text')]
    .filter(el => !el.closest('.question-item').classList.contains('q-hidden'))
    .map(el => el.dataset.raw || el.textContent.trim());
  navigator.clipboard.writeText(lines.join('\n')).then(() => showToast(`Copied ${lines.length} items`));
}

function toggleExportMenu() {
  document.getElementById('exportMenu').classList.toggle('open');
}

document.addEventListener('click', e => {
  const dd = document.getElementById('exportDropdown');
  if (dd && !dd.contains(e.target)) document.getElementById('exportMenu')?.classList.remove('open');
});

function _buildExportData() {
  const tech      = QUESTION_BANK[state.activeTech];
  const tierLabel = { l1:'L1', l2:'L2', both:'L1+L2' }[state.tier];
  const secLabel  = state.qtype === 'all' ? 'All' : (SECTION_META[state.qtype]?.label || state.qtype);
  const tiers     = state.tier === 'both' ? ['l1','l2'] : [state.tier];
  const qtypes    = state.qtype === 'all' ? ['scoping','probing','troubleshooting','datacollection'] : [state.qtype];
  const sections  = [];
  tiers.forEach(tier => {
    qtypes.forEach(qtype => {
      const items = tech[qtype]?.[tier];
      if (!items?.length) return;
      sections.push({ tier, qtype, label: SECTION_META[qtype]?.label || qtype, items });
    });
  });
  return { tech, tierLabel, secLabel, sections };
}

function _download(content, filename, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = filename;
  a.click();
  document.getElementById('exportMenu')?.classList.remove('open');
}

function exportTxt() {
  const { tech, tierLabel, secLabel, sections } = _buildExportData();
  let txt = `MS Unified Support — PCY Question Engine\nTechnology : ${tech.label}\nTier       : ${tierLabel}\nSection    : ${secLabel}\nGenerated  : ${new Date().toLocaleString()}\n${'='.repeat(64)}\n\n`;
  sections.forEach(({ tier, label, items }) => {
    txt += `[${tier.toUpperCase()} — ${label.toUpperCase()}]\n${'-'.repeat(48)}\n`;
    items.forEach((q, i) => { txt += `${String(i+1).padStart(2,'0')}. ${q}\n`; });
    txt += '\n';
  });
  _download(txt, `pcy_${state.activeTech}_${state.tier}_${state.qtype}.txt`, 'text/plain');
}

function exportMd() {
  const { tech, tierLabel, secLabel, sections } = _buildExportData();
  let md = `# PCY Question Engine — ${tech.label}\n\n| Field | Value |\n|---|---|\n| Technology | ${tech.label} |\n| Tier | ${tierLabel} |\n| Section | ${secLabel} |\n| Generated | ${new Date().toLocaleString()} |\n\n---\n\n`;
  sections.forEach(({ tier, label, items }) => {
    md += `## ${tier.toUpperCase()} — ${label}\n\n`;
    items.forEach((q, i) => { md += `${i+1}. ${q}\n`; });
    md += '\n';
  });
  _download(md, `pcy_${state.activeTech}_${state.tier}_${state.qtype}.md`, 'text/markdown');
}

function exportHtml() {
  const { tech, tierLabel, secLabel, sections } = _buildExportData();
  const rows = sections.map(({ tier, label, items }) => {
    const lis = items.map((q,i) => `<li><span class="num">${String(i+1).padStart(2,'0')}</span>${escapeHtml(q)}</li>`).join('');
    return `<div class="section"><div class="sec-head"><span class="tier ${tier}">${tier.toUpperCase()}</span><span class="sec-title">${label}</span></div><ol>${lis}</ol></div>`;
  }).join('');
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>PCY — ${escapeHtml(tech.label)}</title><style>body{font-family:'Segoe UI',sans-serif;background:#f4f6fa;color:#1a2535;margin:0;padding:2rem}h1{font-size:1.4rem;margin-bottom:.25rem}p.meta{font-size:.8rem;color:#5a7090;margin-bottom:1.5rem}.section{background:#fff;border:1px solid #dde5f0;border-radius:10px;margin-bottom:1rem;overflow:hidden}.sec-head{display:flex;align-items:center;gap:10px;padding:10px 16px;background:#eef3fb;border-bottom:1px solid #dde5f0}.tier{font-size:.68rem;font-weight:700;padding:3px 9px;border-radius:4px;letter-spacing:.08em}.tier.l1{background:#dcfce7;color:#16a34a}.tier.l2{background:#fef3c7;color:#d97706}.sec-title{font-weight:700;font-size:.88rem}ol{margin:0;padding:0;list-style:none}li{display:flex;gap:12px;padding:10px 16px;border-bottom:1px solid #eef3fb;font-size:.85rem;line-height:1.6}li:last-child{border-bottom:none}.num{color:#94a3b8;font-weight:700;min-width:24px;flex-shrink:0}@media print{body{background:#fff}.section{break-inside:avoid}}</style></head><body><h1>${escapeHtml(tech.icon)} ${escapeHtml(tech.label)} — PCY Question Engine</h1><p class="meta">Tier: ${tierLabel} | Section: ${secLabel} | Generated: ${new Date().toLocaleString()}</p>${rows}</body></html>`;
  _download(html, `pcy_${state.activeTech}_${state.tier}_${state.qtype}.html`, 'text/html');
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
const _chatHistory = [];
let _aiProvider = 'gemini';

function setAiProvider(provider) {
  _aiProvider = provider;
  LS.set('pcy_ai_provider', provider);
  document.getElementById('providerGemini').classList.toggle('active', provider === 'gemini');
  document.getElementById('providerPollinations').classList.toggle('active', provider === 'pollinations');
  const status = document.getElementById('aiProviderStatus');
  if (provider === 'gemini') {
    status.textContent = '⚡ Google Gemini 2.5 Flash';
    status.style.color = 'var(--l1)';
  } else {
    status.textContent = '🌐 Pollinations AI — free, no key';
    status.style.color = 'var(--accent)';
  }
}

async function generateAiQuestions() {
  const input   = document.getElementById('aiInput');
  const query   = input.value.trim();
  if (!query) { showToast('Please enter a question or scenario.'); return; }

  const btn     = document.getElementById('aiGenerateBtn');
  const btnText = document.getElementById('aiBtnText');
  const spinner = document.getElementById('aiBtnSpinner');
  const output  = document.getElementById('aiOutput');

  _chatHistory.push({ role: 'user', content: query });
  _appendUserBubble(output, query);
  input.value = '';
  output.style.display = 'block';

  btn.disabled = true;
  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';

  // Create assistant bubble with streaming pre element
  const wrap = document.createElement('div');
  wrap.className = 'ai-bubble ai-bubble-assistant';
  const pre = document.createElement('pre');
  pre.className = 'ai-bubble-text';
  pre.textContent = '';
  wrap.appendChild(pre);
  output.appendChild(wrap);
  output.scrollTop = output.scrollHeight;

  try {
    const fullReply = await _invokeAnalysisStream(pre, output);
    _chatHistory.push({ role: 'assistant', content: fullReply });

    // Add copy button after streaming completes
    const copyBtn = document.createElement('button');
    copyBtn.className = 'action-btn';
    copyBtn.style.cssText = 'margin-top:8px;font-size:.68rem;';
    copyBtn.textContent = '⧉ Copy';
    copyBtn.onclick = () => navigator.clipboard.writeText(fullReply).then(() => showToast('Copied!'));
    wrap.appendChild(copyBtn);
  } catch (err) {
    console.error('AI fetch error:', err);
    pre.textContent = `⚠ ${err.name}: ${err.message}`;
    wrap.className = 'ai-bubble ai-bubble-error';
  } finally {
    btn.disabled = false;
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
    output.scrollTop = output.scrollHeight;
  }
}

const _SYSTEM_PROMPT = `You are a senior Microsoft Unified Support engineer specializing in Windows Networking (PCY practice area): DNS, DHCP, TCP/IP, SMB, DFS, NPS/RADIUS, 802.1x, VPN (SSTP/IKEv2/L2TP/AOVPN).

The engineer already has access to standard scoping, probing, troubleshooting, and data collection question banks for common scenarios. Your role is to go BEYOND those — provide deep expert analysis, root cause reasoning, edge cases, known bugs, hotfixes, registry tweaks, advanced PowerShell, packet capture interpretation, and anything else that a senior escalation engineer would know that is NOT covered by a standard question checklist.

Answer conversationally and directly. Be specific — reference exact Event IDs, KB articles, registry paths, PowerShell syntax, and command output interpretation where relevant. Do not repeat generic checklist items the engineer already knows.`;

async function _invokeAnalysisStream(pre, output) {
  if (_aiProvider === 'pollinations') {
    return await _invokeViaHuggingFace(pre, output);
  }
  return await _invokeViaGemini(pre, output);
}

async function _invokeViaGemini(pre, output) {
  const GEMINI_KEY = 'AIzaSyCxHMRyXNCMxAPnMQdDYmTpXpVpDfdmZmE';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

  const contents = [
    { role: 'user', parts: [{ text: _SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Understood. I am ready to assist as a senior Microsoft Unified Support escalation engineer.' }] },
    ..._chatHistory.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  let res;
  try {
    res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini returned HTTP ${res.status}: ${err.slice(0,200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
  pre.textContent = text;
  output.scrollTop = output.scrollHeight;
  return text.trim();
}

async function _invokeViaHuggingFace(pre, output) {
  const HF_KEY = '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';
  const HF_URL = 'https://router.huggingface.co/v1/chat/completions';

  const messages = [
    { role: 'system', content: _SYSTEM_PROMPT },
    ..._chatHistory
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  let res;
  try {
    res = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HF_KEY}`
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-72B-Instruct',
        messages,
        max_tokens: 2048
      }),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HuggingFace returned HTTP ${res.status}: ${err.slice(0,200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || 'No response received.';
  pre.textContent = text;
  output.scrollTop = output.scrollHeight;
  return text.trim();
}

function saveApiKey() {}

// ─── User bubble helper (assistant bubbles built inline during streaming) ──────
function _appendUserBubble(container, text) {
  const wrap = document.createElement('div');
  wrap.className = 'ai-bubble ai-bubble-user';
  const p = document.createElement('div');
  p.className = 'ai-bubble-text';
  p.textContent = text;
  wrap.appendChild(p);
  container.appendChild(wrap);
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function escapeAttr(str) {
  return str.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
}

function showToast(msg = 'Copied!') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// ─── Theme Toggle ──────────────────────────────────────────────────────────────────────────────
let _isGlass = false;

function toggleTheme() {
  _isGlass = !_isGlass;
  LS.set('pcy_glass', _isGlass);
  document.body.classList.toggle('theme-glass', _isGlass);
  document.getElementById('themeIcon').textContent    = _isGlass ? '☀️' : '🌙';
  document.getElementById('themeTooltip').textContent = _isGlass ? 'Dark' : 'Light';
}

// ─── Case Notes Panel ────────────────────────────────────────────────────────────────────
let _cnOpen = false;

const _cnFields = [
  'cn-sr','cn-date','cn-followup','cn-engineer','cn-customer','cn-tech',
  'cn-severity','cn-status','cn-contact',
  'cn-issue','cn-env','cn-assessment','cn-data','cn-repro',
  'cn-changes','cn-action-customer','cn-action-ms',
  'cn-resolution','cn-kb','cn-escalation','cn-related-sr','cn-notes'
];

function toggleCaseNotes() {
  _cnOpen = !_cnOpen;
  document.getElementById('cnPanel').classList.toggle('open', _cnOpen);
  document.getElementById('cnOverlay').classList.toggle('open', _cnOpen);
  document.getElementById('cnTab').style.display = _cnOpen ? 'none' : '';
}

function clearAllNotes() {
  _cnFields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  _cnFields.forEach(id => LS.set('pcy_cn_' + id, ''));
  updatePreview();
}

function _val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function _section(title, content) {
  if (!content) return '';
  return `\n${'='.repeat(60)}\n${title.toUpperCase()}\n${'='.repeat(60)}\n${content}\n`;
}

function updatePreview() {
  // Save all fields to localStorage
  _cnFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) LS.set('pcy_cn_' + id, el.value);
  });

  // Flash saved indicator
  const ind = document.getElementById('cnSavedIndicator');
  if (ind) {
    ind.textContent = '✓ Draft saved';
    ind.classList.add('show');
    clearTimeout(ind._t);
    ind._t = setTimeout(() => ind.classList.remove('show'), 1800);
  }

  const sr        = _val('cn-sr');
  const date       = _val('cn-date');
  const followup   = _val('cn-followup');
  const engineer   = _val('cn-engineer');
  const customer   = _val('cn-customer');
  const tech       = _val('cn-tech');
  const severity   = _val('cn-severity');
  const status     = _val('cn-status');
  const contact    = _val('cn-contact');

  const issue      = _val('cn-issue');
  const env        = _val('cn-env');
  const assess     = _val('cn-assessment');
  const data       = _val('cn-data');
  const repro      = _val('cn-repro');
  const changes    = _val('cn-changes');
  const actCust    = _val('cn-action-customer');
  const actMs      = _val('cn-action-ms');
  const resolution = _val('cn-resolution');
  const kb         = _val('cn-kb');
  const escalation = _val('cn-escalation');
  const relatedSr  = _val('cn-related-sr');
  const notes      = _val('cn-notes');

  const hasAny = [sr,date,followup,engineer,customer,tech,severity,status,contact,
                  issue,env,assess,data,repro,changes,actCust,actMs,
                  resolution,kb,escalation,relatedSr,notes].some(v => v);
  if (!hasAny) {
    document.getElementById('cnPreview').textContent =
      'Fill in the sections above to generate your formatted case note...';
    return;
  }

  let out = 'MS UNIFIED SUPPORT — CASE NOTE\n';
  out += '─'.repeat(60) + '\n';
  if (sr)         out += `SR / ICM     : ${sr}\n`;
  if (date)       out += `Date         : ${date}\n`;
  if (followup)   out += `Follow-up    : ${followup}\n`;
  if (engineer)   out += `Engineer     : ${engineer}\n`;
  if (customer)   out += `Customer     : ${customer}\n`;
  if (tech)       out += `Technology   : ${tech}\n`;
  if (severity)   out += `Severity     : ${severity}\n`;
  if (status)     out += `Status       : ${status}\n`;
  if (contact)    out += `Contact Type : ${contact}\n`;
  if (kb)         out += `KB / Bug Ref : ${kb}\n`;
  if (escalation) out += `Escalated To : ${escalation}\n`;
  if (relatedSr)  out += `Related SR   : ${relatedSr}\n`;

  out += _section('Issue', issue);
  out += _section('Environment Details', env);
  out += _section('Assessment / Troubleshooting Done', assess);
  out += _section('Data Collection', data);
  out += _section('Repro Steps', repro);
  out += _section('Recent Changes', changes);

  if (actCust || actMs) {
    out += `\n${'='.repeat(60)}\nACTION PLAN\n${'='.repeat(60)}\n`;
    if (actCust) out += `\n⏳ PENDING ON CUSTOMER\n${'─'.repeat(40)}\n${actCust}\n`;
    if (actMs)   out += `\n🔬 PENDING ON MICROSOFT\n${'─'.repeat(40)}\n${actMs}\n`;
  }

  out += _section('Resolution / Root Cause', resolution);
  out += _section('Additional Notes', notes);
  out += `\n${'─'.repeat(60)}\n[End of Case Note]`;

  document.getElementById('cnPreview').textContent = out;
}

function copyCaseNote() {
  const text = document.getElementById('cnPreview').textContent;
  if (!text || text.startsWith('Fill in')) { showToast('Nothing to copy yet.'); return; }
  navigator.clipboard.writeText(text).then(() => showToast('Case note copied!'));
}

// ─── AI Clear Chat ────────────────────────────────────────────────────────────
function clearAiChat() {
  _chatHistory.length = 0;
  const output = document.getElementById('aiOutput');
  output.innerHTML = '';
  output.style.display = 'none';
  showToast('Chat cleared');
}

// ─── Keyboard Shortcuts ─────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  // Escape — close case notes panel
  if (e.key === 'Escape' && _cnOpen) {
    toggleCaseNotes();
    return;
  }

  // Ctrl+F — focus search (only when questions are visible)
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    const si = document.getElementById('searchInput');
    if (si && document.getElementById('questionsOutput').style.display !== 'none') {
      e.preventDefault();
      si.focus();
      si.select();
    }
    return;
  }

  // Ctrl+L — clear AI chat
  if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
    e.preventDefault();
    clearAiChat();
    return;
  }
});

// Enter / Space on the case notes tab for keyboard accessibility
document.addEventListener('DOMContentLoaded', () => {}, true);
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.id === 'cnTab') {
    e.preventDefault();
    toggleCaseNotes();
  }
});