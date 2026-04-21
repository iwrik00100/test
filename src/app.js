// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  tier: 'l1',
  qtype: 'scoping',
  activeDomain: null,
  activeTech: null,
  activePlaybook: null,
  domainIndex: {},   // cache: domainKey -> _index.json data
  techData: {}       // cache: techKey -> technology.json data
};

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS = {
  get: (k, fallback = null) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

const SECTION_META = {
  scoping:         { label: 'Scoping',        icon: '🔍', desc: 'Environment & impact questions' },
  probing:         { label: 'Probing',         icon: '🧪', desc: 'Diagnostic commands & data requests' },
  troubleshooting: { label: 'Troubleshooting', icon: '🛠',  desc: 'Resolution steps' },
  datacollection:  { label: 'Data Collection', icon: '📦', desc: 'Logs, traces & exports' }
};

// Domain definitions — drives the landing page cards
const DOMAINS = [
  { key: 'networking',          label: 'Networking',              icon: '🌐', description: 'DNS, DHCP, TCP/IP, SMB, DFS, NPS, 802.1x, VPN' },
  { key: 'directory_services',  label: 'Directory Services',      icon: '🏛',  description: 'AD DS, AD CS, AD FS, Azure AD, Kerberos, LDAP, GPO' },
  { key: 'performance',         label: 'Performance',             icon: '⚡', description: 'CPU, Memory, Disk I/O, Network throughput, WPA, ETW' },
  { key: 'user_experience',     label: 'User Experience',         icon: '👤', description: 'Logon, Profiles, App Compat, AVD, RDS, Printing' },
  { key: 'device_deployment',   label: 'Device & Deployment',     icon: '📦', description: 'Intune, SCCM, Autopilot, WSUS, WDS, Co-Management' },
  { key: 'storage_ha',          label: 'Storage & High Availability', icon: '💾', description: 'Storage Spaces, Failover Cluster, Hyper-V, ReFS, iSCSI' },
  { key: 'collaboration',       label: 'Collaboration',           icon: '🤝', description: 'Exchange Online, Teams, SharePoint, OneDrive, M365' }
];

// ─── Base path for JSON files ─────────────────────────────────────────────────
function _basePath() {
  // Works on GitHub Pages (/test/) and locally (/)
  const base = document.location.pathname.replace(/\/[^/]*$/, '');
  return base.endsWith('/src') ? base.replace('/src', '') : base;
}

// ─── JSON Loader ──────────────────────────────────────────────────────────────
async function _fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path} (HTTP ${res.status})`);
  return res.json();
}

async function loadDomainIndex(domainKey) {
  if (state.domainIndex[domainKey]) return state.domainIndex[domainKey];
  const data = await _fetchJson(`${_basePath()}/domains/${domainKey}/_index.json`);
  state.domainIndex[domainKey] = data;
  return data;
}

async function loadTechData(domainKey, techKey) {
  if (state.techData[techKey]) return state.techData[techKey];
  const data = await _fetchJson(`${_basePath()}/domains/${domainKey}/${techKey}.json`);
  state.techData[techKey] = data;
  return data;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const savedGlass    = LS.get('pcy_glass', true);
  const savedTier     = LS.get('pcy_tier', 'l1');
  const savedQtype    = LS.get('pcy_qtype', 'scoping');
  const savedDomain   = LS.get('pcy_domain', null);
  const savedTech     = LS.get('pcy_tech', null);
  const savedProvider = LS.get('pcy_ai_provider', 'gemini');

  _isGlass = savedGlass;
  document.body.classList.remove('theme-glass', 'theme-dark');
  document.body.classList.add(_isGlass ? 'theme-glass' : 'theme-dark');
  const _initIcon = _isGlass ? '🌙' : '☀️';
  document.getElementById('themeIcon').textContent = _initIcon;
  const _ti2 = document.getElementById('themeIcon2');
  if (_ti2) _ti2.textContent = _initIcon;

  renderDomainGrid();

  state.tier = savedTier;
  document.querySelectorAll('.tier-btn').forEach(b => b.classList.toggle('active', b.dataset.tier === savedTier));

  state.qtype = savedQtype;
  document.querySelectorAll('.qtype-tab').forEach(b => b.classList.toggle('active', b.dataset.type === savedQtype));
  if (savedQtype === 'playbook') document.querySelector('.tier-toggle').style.display = 'none';

  setAiProvider(savedProvider === 'pollinations' ? 'huggingface' : savedProvider);

  // Restore case notes
  _cnFields.forEach(id => {
    const el = document.getElementById(id);
    const val = LS.get('pcy_cn_' + id, '');
    if (el && val) el.value = val;
  });
  updatePreview();

  // Restore chat history bubbles
  if (_chatHistory.length) {
    const output = document.getElementById('aiOutput');
    output.style.display = 'block';
    _chatHistory.forEach(m => {
      if (m.role === 'user') {
        _appendUserBubble(output, m.content);
      } else {
        const wrap = document.createElement('div');
        wrap.className = 'ai-bubble ai-bubble-assistant';
        const mdDiv = document.createElement('div');
        mdDiv.className = 'ai-bubble-text';
        mdDiv.innerHTML = _renderMarkdown(m.content);
        wrap.appendChild(mdDiv);
        output.appendChild(wrap);
      }
    });
    output.scrollTop = output.scrollHeight;
  }

  // Restore domain + tech selection
  if (savedDomain) {
    await selectDomain(savedDomain, false);
    if (savedTech) {
      await selectTech(savedTech, false);
      document.getElementById('questionTypeRow').style.display = '';
      if (savedQtype === 'playbook') renderPlaybook();
      else renderQuestions();
    }
  }
});

// ─── Page Navigation ──────────────────────────────────────────────────────────
function _showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// ─── Domain Grid ──────────────────────────────────────────────────────────────
const DOMAIN_TECH_COUNTS = {
  networking: '11 technologies',
  directory_services: '7 technologies',
  performance: '6 technologies',
  user_experience: '6 technologies',
  device_deployment: '6 technologies',
  storage_ha: '6 technologies',
  collaboration: '6 technologies'
};

function renderDomainGrid() {
  const grid = document.getElementById('domainGrid');
  grid.innerHTML = '';
  DOMAINS.forEach(d => {
    const card = document.createElement('button');
    card.className = 'domain-card';
    card.dataset.domain = d.key;
    card.innerHTML = `
      <div class="domain-card-bar"></div>
      <div class="domain-card-body">
        <div class="domain-card-icon-wrap">${d.icon}</div>
        <div class="domain-card-label">${d.label}</div>
        <div class="domain-card-desc">${d.description}</div>
        <div class="domain-card-footer">
          <span class="domain-card-count">${DOMAIN_TECH_COUNTS[d.key] || ''}</span>
          <span class="domain-card-arrow">→</span>
        </div>
      </div>`;
    card.onclick = () => selectDomain(d.key);
    grid.appendChild(card);
  });
}

// ─── Domain Selection ─────────────────────────────────────────────────────────
async function selectDomain(domainKey, persist = true) {
  state.activeDomain   = domainKey;
  state.activeTech     = null;
  state.activePlaybook = null;
  if (persist) LS.set('pcy_domain', domainKey);

  _showPage('domainPage');
  _showLoading(true);
  try {
    const index  = await loadDomainIndex(domainKey);
    const domain = DOMAINS.find(d => d.key === domainKey);
    // Update domain hero bar
    document.getElementById('domainHeroIdentity').innerHTML =
      `<span class="domain-hero-icon">${domain?.icon}</span>
       <span class="domain-hero-name">${domain?.label}</span>`;
    renderTechGrid(index);
    document.getElementById('questionTypeRow').style.display = 'none';
    document.getElementById('questionsOutput').style.display = 'none';
    document.getElementById('emptyState').style.display = '';
    document.getElementById('emptyState').querySelector('.empty-title').textContent = 'Select a Technology';
    document.getElementById('emptyState').querySelector('.empty-desc').textContent = 'Choose a technology from the list above';
  } catch (e) {
    showToast('Failed to load domain index');
    console.error(e);
  } finally {
    _showLoading(false);
  }
}

function backToLanding() {
  state.activeDomain   = null;
  state.activeTech     = null;
  state.activePlaybook = null;
  LS.set('pcy_domain', null);
  LS.set('pcy_tech', null);
  _showPage('landingPage');
}

function backToDomains() { backToLanding(); }

// ─── Tech Grid ────────────────────────────────────────────────────────────────
function renderTechGrid(index) {
  const grid = document.getElementById('techGrid');
  grid.innerHTML = '';
  index.technologies.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'tech-btn';
    btn.dataset.tech = t.key;
    btn.innerHTML = `<span class="tech-icon">${t.icon}</span><span class="tech-label">${t.label}</span>`;
    btn.onclick = () => selectTech(t.key);
    grid.appendChild(btn);
  });
}

// ─── Tech Selection ───────────────────────────────────────────────────────────
async function selectTech(techKey, persist = true) {
  state.activeTech     = techKey;
  state.activePlaybook = null;
  _checkedKeys.clear();
  _pbCheckedKeys.clear();
  if (persist) LS.set('pcy_tech', techKey);

  document.querySelectorAll('.tech-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tech === techKey));

  _showLoading(true);
  try {
    await loadTechData(state.activeDomain, techKey);
    document.getElementById('questionTypeRow').style.display = '';
    document.querySelector('.tier-toggle').style.display = state.qtype === 'playbook' ? 'none' : '';
    if (state.qtype === 'playbook') renderPlaybook();
    else renderQuestions();
  } catch (e) {
    showToast('Failed to load technology data');
    console.error(e);
  } finally {
    _showLoading(false);
  }
}

function _showLoading(show) {
  document.getElementById('loadingState').style.display = show ? 'flex' : 'none';
}

// ─── Tier & Qtype ─────────────────────────────────────────────────────────────
function setTier(tier) {
  state.tier = tier;
  LS.set('pcy_tier', tier);
  document.querySelectorAll('.tier-btn').forEach(b => b.classList.toggle('active', b.dataset.tier === tier));
  if (state.activeTech) renderQuestions();
}

function setQtype(type) {
  if (state.qtype === 'playbook' && type !== 'playbook') state.activePlaybook = null;
  if (state.qtype !== 'playbook' && type === 'playbook') state.activePlaybook = null;
  state.qtype = type;
  LS.set('pcy_qtype', type);
  document.querySelectorAll('.qtype-tab').forEach(b => b.classList.toggle('active', b.dataset.type === type));
  document.querySelector('.tier-toggle').style.display = type === 'playbook' ? 'none' : '';
  if (state.activeTech) {
    if (type === 'playbook') renderPlaybook();
    else renderQuestions();
  }
}

// ─── Render Questions ─────────────────────────────────────────────────────────
function renderQuestions() {
  const tech = state.techData[state.activeTech];
  if (!tech) return;

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('questionsOutput').style.display = 'block';

  const tierLabel  = { l1: 'L1 Support', l2: 'L2 Support', both: 'L1 + L2' }[state.tier];
  const qtypeLabel = state.qtype === 'all' ? 'All Sections' : (SECTION_META[state.qtype]?.label || state.qtype);

  document.getElementById('outputMeta').innerHTML =
    `<span class="meta-tag">${tech.icon} ${tech.label}</span>
     <span class="meta-tag tier-${state.tier}">${tierLabel}</span>
     <span class="meta-tag">${qtypeLabel}</span>`;

  const list = document.getElementById('questionsList');
  list.innerHTML = '';

  const si = document.getElementById('searchInput');
  if (si) si.value = '';
  const sc = document.getElementById('searchCount');
  if (sc) sc.textContent = '';
  const sb = document.getElementById('searchClear');
  if (sb) sb.style.display = 'none';

  const tiers  = state.tier === 'both' ? ['l1','l2'] : [state.tier];
  const qtypes = state.qtype === 'all'
    ? ['scoping','probing','troubleshooting','datacollection']
    : [state.qtype];

  tiers.forEach(tier => {
    qtypes.forEach(qtype => {
      const items = tech[qtype]?.[tier];
      if (!items || !items.length) return;
      const meta    = SECTION_META[qtype] || {};
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

        const cb  = document.createElement('input');
        cb.type   = 'checkbox';
        cb.className = 'q-check';
        cb.id     = `chk-${tier}-${qtype}-${i}`;
        cb.setAttribute('aria-label', 'Mark question as done');
        const ck  = _ckKey(tier, qtype, i);
        if (_checkedKeys.has(ck)) { cb.checked = true; item.classList.add('checked'); }
        cb.addEventListener('change', function() {
          item.classList.toggle('checked', this.checked);
          this.checked ? _checkedKeys.add(ck) : _checkedKeys.delete(ck);
          updateProgress();
        });

        const num = document.createElement('span');
        num.className   = 'q-num';
        num.textContent = String(i + 1).padStart(2, '0');

        const text = document.createElement('span');
        text.className    = 'q-text';
        text.dataset.raw  = q;
        text.textContent  = q;

        const copyBtn = document.createElement('button');
        copyBtn.className   = 'q-copy';
        copyBtn.title       = 'Copy';
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

// ─── Playbook Render ──────────────────────────────────────────────────────────
function renderPlaybook() {
  const tech = state.techData[state.activeTech];
  if (!tech) return;

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('questionsOutput').style.display = 'block';

  document.getElementById('outputMeta').innerHTML =
    `<span class="meta-tag">${tech.icon} ${tech.label}</span>
     <span class="meta-tag">🗺 Playbook</span>`;

  const list = document.getElementById('questionsList');
  list.innerHTML = '';

  const playbooks = tech.playbooks;
  if (!playbooks || !Object.keys(playbooks).length) {
    list.innerHTML = '<div class="pb-empty">No playbooks available for this technology yet.</div>';
    updateProgress();
    return;
  }

  if (!state.activePlaybook) {
    renderSymptomPicker(list, playbooks);
    updateProgress();
    return;
  }

  const pb = playbooks[state.activePlaybook];
  if (!pb) { state.activePlaybook = null; renderPlaybook(); return; }

  // Back button + title
  const back = document.createElement('div');
  back.className = 'pb-back';
  back.innerHTML =
    `<button class="action-btn" onclick="state.activePlaybook=null;renderPlaybook()">← All Playbooks</button>
     <span class="pb-title">${pb.title}</span>
     <span class="pb-severity pb-sev-${pb.severity}">${pb.severity.toUpperCase()}</span>
     <button class="action-btn" onclick="copyPlaybook()" style="margin-left:auto">📋 Copy Playbook</button>`;
  list.appendChild(back);

  pb.phases.forEach((phase, pi) => {
    const phaseEl = document.createElement('div');
    phaseEl.className = 'pb-phase';
    phaseEl.innerHTML =
      `<div class="pb-phase-header">
         <span class="pb-phase-icon">${phase.icon}</span>
         <span class="pb-phase-name">${phase.name}</span>
         <span class="pb-phase-count">${phase.steps.length} step${phase.steps.length !== 1 ? 's' : ''}</span>
       </div>`;

    phase.steps.forEach((step, si) => {
      const item = document.createElement('div');
      item.className = 'question-item pb-step';

      const cb = document.createElement('input');
      cb.type  = 'checkbox';
      cb.className = 'q-check';
      cb.id    = `pbchk-${pi}-${si}`;
      cb.setAttribute('aria-label', 'Mark step done');
      const pbck = _pbCkKey(pi, si);
      if (_pbCheckedKeys.has(pbck)) { cb.checked = true; item.classList.add('checked'); }
      cb.addEventListener('change', function() {
        item.classList.toggle('checked', this.checked);
        this.checked ? _pbCheckedKeys.add(pbck) : _pbCheckedKeys.delete(pbck);
        updateProgress();
      });

      const num = document.createElement('span');
      num.className   = 'q-num';
      num.textContent = String(si + 1).padStart(2, '0');

      const body = document.createElement('div');
      body.className = 'pb-step-body';
      body.innerHTML =
        `<code class="pb-action">${escapeHtml(step.action)}</code>` +
        `<span class="pb-expect">Expected: ${escapeHtml(step.expect)}</span>`;

      const copyBtn = document.createElement('button');
      copyBtn.className   = 'q-copy';
      copyBtn.title       = 'Copy command';
      copyBtn.textContent = '⧉';
      copyBtn.addEventListener('click', () => copyQuestion(step.action));

      item.appendChild(cb);
      item.appendChild(num);
      item.appendChild(body);
      item.appendChild(copyBtn);
      phaseEl.appendChild(item);
    });
    list.appendChild(phaseEl);
  });
  updateProgress();
}

function renderSymptomPicker(container, playbooks) {
  const grid = document.createElement('div');
  grid.className = 'pb-symptom-grid';
  Object.entries(playbooks).forEach(([slug, pb]) => {
    const card = document.createElement('button');
    card.className = 'pb-symptom-card';
    card.innerHTML =
      `<span class="pb-sev-dot pb-sev-${pb.severity}"></span>` +
      `<span class="pb-symptom-title">${escapeHtml(pb.title)}</span>` +
      `<span class="pb-symptom-meta">${pb.phases.length} phases · ${pb.phases.reduce((a, p) => a + p.steps.length, 0)} steps</span>`;
    card.addEventListener('click', () => {
      state.activePlaybook = slug;
      renderPlaybook();
    });
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

function copyPlaybook() {
  const tech = state.techData[state.activeTech];
  const pb   = tech?.playbooks?.[state.activePlaybook];
  if (!pb) return;

  let out = `NETOPS COCKPIT — PLAYBOOK\n`;
  out += `Technology : ${tech.label}\n`;
  out += `Symptom    : ${pb.title}\n`;
  out += `Severity   : ${pb.severity.toUpperCase()}\n`;
  out += `Generated  : ${new Date().toLocaleString()}\n`;
  out += '='.repeat(60) + '\n\n';

  pb.phases.forEach(phase => {
    out += `${phase.icon} ${phase.name.toUpperCase()}\n`;
    out += '-'.repeat(40) + '\n';
    phase.steps.forEach((step, i) => {
      out += `${String(i + 1).padStart(2, '0')}. ${step.action}\n`;
      out += `    Expected: ${step.expect}\n`;
    });
    out += '\n';
  });
  navigator.clipboard.writeText(out).then(() => showToast('Playbook copied!'));
}

// ─── Checkboxes & Progress ────────────────────────────────────────────────────
const _checkedKeys   = new Set();
const _pbCheckedKeys = new Set();

function _ckKey(tier, qtype, i)  { return `${state.activeTech}_${tier}_${qtype}_${i}`; }
function _pbCkKey(pi, si)        { return `${state.activeTech}_${state.activePlaybook}_${pi}_${si}`; }

function updateProgress() {
  const all     = document.querySelectorAll('#questionsList .q-check');
  const checked = document.querySelectorAll('#questionsList .q-check:checked');
  const total   = all.length;
  const done    = checked.length;
  const row     = document.getElementById('progressRow');
  if (!row) return;
  row.style.display = total > 0 ? 'flex' : 'none';
  document.getElementById('progressLabel').textContent = `${done} / ${total} checked`;
  document.getElementById('progressFill').style.width  = total > 0 ? `${(done / total) * 100}%` : '0%';
}

function clearChecked() {
  document.querySelectorAll('#questionsList .q-check').forEach(cb => {
    cb.checked = false;
    cb.closest('.question-item').classList.remove('checked');
  });
  _checkedKeys.clear();
  _pbCheckedKeys.clear();
  updateProgress();
}

// ─── Search / Filter ──────────────────────────────────────────────────────────
function filterQuestions() {
  const q        = document.getElementById('searchInput').value.trim().toLowerCase();
  const clearBtn = document.getElementById('searchClear');
  const countEl  = document.getElementById('searchCount');
  clearBtn.style.display = q ? 'inline' : 'none';

  const items = document.querySelectorAll('#questionsList .question-item');
  let visible = 0;

  items.forEach(item => {
    const textEl = item.querySelector('.q-text');
    if (!textEl) return;
    const raw = textEl.dataset.raw || textEl.textContent;
    textEl.dataset.raw = raw;

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
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      textEl.innerHTML = escapeHtml(raw).replace(regex, m => `<mark class="q-highlight">${m}</mark>`);
      visible++;
    }
  });

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

// ─── Utilities ────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function escapeAttr(str) {
  return str.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
}

function showToast(msg = 'Copied!') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// ─── Copy & Export ────────────────────────────────────────────────────────────
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
  const tech      = state.techData[state.activeTech];
  const tierLabel = { l1:'L1', l2:'L2', both:'L1+L2' }[state.tier];
  const secLabel  = state.qtype === 'all' ? 'All' : (SECTION_META[state.qtype]?.label || state.qtype);
  const tiers     = state.tier === 'both' ? ['l1','l2'] : [state.tier];
  const qtypes    = state.qtype === 'all'
    ? ['scoping','probing','troubleshooting','datacollection']
    : [state.qtype];
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
  a.href  = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = filename;
  a.click();
  document.getElementById('exportMenu')?.classList.remove('open');
}

function exportTxt() {
  const { tech, tierLabel, secLabel, sections } = _buildExportData();
  let txt = `NetOps Cockpit — Incident Command\nTechnology : ${tech.label}\nTier       : ${tierLabel}\nSection    : ${secLabel}\nGenerated  : ${new Date().toLocaleString()}\n${'='.repeat(64)}\n\n`;
  sections.forEach(({ tier, label, items }) => {
    txt += `[${tier.toUpperCase()} — ${label.toUpperCase()}]\n${'-'.repeat(48)}\n`;
    items.forEach((q, i) => { txt += `${String(i+1).padStart(2,'0')}. ${q}\n`; });
    txt += '\n';
  });
  _download(txt, `netops_${state.activeTech}_${state.tier}_${state.qtype}.txt`, 'text/plain');
}

function exportMd() {
  const { tech, tierLabel, secLabel, sections } = _buildExportData();
  let md = `# NetOps Cockpit — ${tech.label}\n\n| Field | Value |\n|---|---|\n| Technology | ${tech.label} |\n| Tier | ${tierLabel} |\n| Section | ${secLabel} |\n| Generated | ${new Date().toLocaleString()} |\n\n---\n\n`;
  sections.forEach(({ tier, label, items }) => {
    md += `## ${tier.toUpperCase()} — ${label}\n\n`;
    items.forEach((q, i) => { md += `${i+1}. ${q}\n`; });
    md += '\n';
  });
  _download(md, `netops_${state.activeTech}_${state.tier}_${state.qtype}.md`, 'text/markdown');
}

function exportHtml() {
  const { tech, tierLabel, secLabel, sections } = _buildExportData();
  const rows = sections.map(({ tier, label, items }) => {
    const lis = items.map((q,i) =>
      `<li><span class="num">${String(i+1).padStart(2,'0')}</span>${escapeHtml(q)}</li>`).join('');
    return `<div class="section"><div class="sec-head"><span class="tier ${tier}">${tier.toUpperCase()}</span><span class="sec-title">${label}</span></div><ol>${lis}</ol></div>`;
  }).join('');
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>NetOps Cockpit — ${escapeHtml(tech.label)}</title><style>body{font-family:'Segoe UI',sans-serif;background:#f4f6fa;color:#1a2535;margin:0;padding:2rem}h1{font-size:1.4rem;margin-bottom:.25rem}p.meta{font-size:.8rem;color:#5a7090;margin-bottom:1.5rem}.section{background:#fff;border:1px solid #dde5f0;border-radius:10px;margin-bottom:1rem;overflow:hidden}.sec-head{display:flex;align-items:center;gap:10px;padding:10px 16px;background:#eef3fb;border-bottom:1px solid #dde5f0}.tier{font-size:.68rem;font-weight:700;padding:3px 9px;border-radius:4px}.tier.l1{background:#dcfce7;color:#16a34a}.tier.l2{background:#fef3c7;color:#d97706}.sec-title{font-weight:700;font-size:.88rem}ol{margin:0;padding:0;list-style:none}li{display:flex;gap:12px;padding:10px 16px;border-bottom:1px solid #eef3fb;font-size:.85rem;line-height:1.6}li:last-child{border-bottom:none}.num{color:#94a3b8;font-weight:700;min-width:24px;flex-shrink:0}@media print{body{background:#fff}.section{break-inside:avoid}}</style></head><body><h1>${escapeHtml(tech.icon)} ${escapeHtml(tech.label)} — NetOps Cockpit</h1><p class="meta">Tier: ${tierLabel} | Section: ${secLabel} | Generated: ${new Date().toLocaleString()}</p>${rows}</body></html>`;
  _download(html, `netops_${state.activeTech}_${state.tier}_${state.qtype}.html`, 'text/html');
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
const _chatHistory = LS.get('pcy_chat_history', []);
let _aiProvider = 'gemini';

function _persistChat() {
  LS.set('pcy_chat_history', _chatHistory.slice(-20));
}

function setAiProvider(provider) {
  _aiProvider = provider;
  LS.set('pcy_ai_provider', provider);
  document.getElementById('providerGemini').classList.toggle('active', provider === 'gemini');
  document.getElementById('providerHuggingFace').classList.toggle('active', provider === 'huggingface');
  const status       = document.getElementById('aiProviderStatus');
  const geminiKeyRow = document.getElementById('geminiKeyRow');
  const hfKeyRow     = document.getElementById('hfKeyRow');
  if (provider === 'gemini') {
    status.textContent = '⚡ Google Gemini 2.5 Flash';
    status.style.color = 'var(--l1)';
    if (geminiKeyRow) {
      geminiKeyRow.style.display = 'flex';
      const saved = LS.get('pcy_gemini_key', '');
      if (saved) document.getElementById('geminiKeyInput').value = saved;
    }
    if (hfKeyRow) hfKeyRow.style.display = 'none';
  } else {
    status.textContent = '🤗 HuggingFace — Qwen2.5-72B';
    status.style.color = 'var(--accent)';
    if (geminiKeyRow) geminiKeyRow.style.display = 'none';
    if (hfKeyRow) {
      hfKeyRow.style.display = 'flex';
      const saved = LS.get('pcy_hf_key', '');
      if (saved) document.getElementById('hfKeyInput').value = saved;
    }
  }
}

function saveApiKey(provider) {
  if (provider === 'gemini') {
    const key = document.getElementById('geminiKeyInput')?.value.trim();
    if (!key) { showToast('Enter a key first.'); return; }
    LS.set('pcy_gemini_key', key);
    showToast('Gemini key saved!');
  } else {
    const key = document.getElementById('hfKeyInput')?.value.trim();
    if (!key) { showToast('Enter a key first.'); return; }
    LS.set('pcy_hf_key', key);
    showToast('HuggingFace key saved!');
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
  _persistChat();
  _appendUserBubble(output, query);
  input.value = '';
  output.style.display = 'block';

  btn.disabled          = true;
  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';

  const wrap  = document.createElement('div');
  wrap.className = 'ai-bubble ai-bubble-assistant';
  const mdDiv = document.createElement('div');
  mdDiv.className = 'ai-bubble-text';
  wrap.appendChild(mdDiv);
  output.appendChild(wrap);
  output.scrollTop = output.scrollHeight;

  try {
    const fullReply = await _invokeAnalysisStream(mdDiv, output);
    _chatHistory.push({ role: 'assistant', content: fullReply });
    _persistChat();
    const copyBtn = document.createElement('button');
    copyBtn.className       = 'action-btn';
    copyBtn.style.cssText   = 'margin-top:8px;font-size:.68rem;';
    copyBtn.textContent     = '⧉ Copy';
    copyBtn.onclick = () => navigator.clipboard.writeText(fullReply).then(() => showToast('Copied!'));
    wrap.appendChild(copyBtn);
  } catch (err) {
    console.error('AI fetch error:', err);
    mdDiv.textContent  = `⚠ ${err.name}: ${err.message}`;
    wrap.className     = 'ai-bubble ai-bubble-error';
  } finally {
    btn.disabled          = false;
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
    output.scrollTop      = output.scrollHeight;
  }
}

function clearAiChat() {
  _chatHistory.length = 0;
  LS.set('pcy_chat_history', []);
  const output = document.getElementById('aiOutput');
  output.innerHTML     = '';
  output.style.display = 'none';
  showToast('Chat cleared');
}

function _appendUserBubble(container, text) {
  const wrap = document.createElement('div');
  wrap.className = 'ai-bubble ai-bubble-user';
  const p = document.createElement('div');
  p.className   = 'ai-bubble-text';
  p.textContent = text;
  wrap.appendChild(p);
  container.appendChild(wrap);
}

// ─── System Prompt ────────────────────────────────────────────────────────────
const _SYSTEM_PROMPT = `You are a senior Microsoft Unified Support incident response engineer covering all PCY practice areas: Networking (DNS, DHCP, TCP/IP, SMB, DFS, NPS/RADIUS, 802.1x, VPN), Directory Services (AD DS, AD CS, AD FS, Azure AD, Kerberos, LDAP, GPO), Performance (CPU, Memory, Disk I/O, WPA, ETW), User Experience (Logon, Profiles, App Compat, AVD, RDS), Device & Deployment (Intune, SCCM, Autopilot, WSUS), Storage & HA (Storage Spaces, Failover Cluster, Hyper-V, ReFS), and Collaboration (Exchange Online, Teams, SharePoint, OneDrive).

The engineer already has access to standard scoping, probing, troubleshooting, and data collection playbooks. Your role is to go BEYOND those — provide deep expert analysis, root cause reasoning, edge cases, known bugs, hotfixes, registry tweaks, advanced PowerShell, packet capture interpretation, and anything a senior escalation engineer would know that is NOT covered by a standard question checklist.

Answer conversationally and directly. Be specific — reference exact Event IDs, KB articles, registry paths, PowerShell syntax, and command output interpretation where relevant. Do not repeat generic checklist items the engineer already knows.`;

function _buildSystemPrompt() {
  let ctx = '';
  if (state.activeTech && state.techData[state.activeTech]) {
    const tech      = state.techData[state.activeTech];
    const tierLabel = { l1: 'L1', l2: 'L2', both: 'L1 + L2' }[state.tier] || state.tier;
    const domain    = DOMAINS.find(d => d.key === state.activeDomain);
    ctx = `\n\nCURRENT INCIDENT CONTEXT: The engineer is working on a ${tech.label} case (domain: ${domain?.label || state.activeDomain}) at ${tierLabel} tier. Tailor your response specifically to ${tech.label} — prioritise ${tech.label}-specific Event IDs, commands, registry paths, and known issues.`;
  }
  return _SYSTEM_PROMPT + ctx;
}

async function _invokeAnalysisStream(mdDiv, output) {
  if (_aiProvider === 'huggingface') return await _invokeViaHuggingFace(mdDiv, output);
  return await _invokeViaGemini(mdDiv, output);
}

async function _invokeViaGemini(mdDiv, output) {
  const GEMINI_KEY = LS.get('pcy_gemini_key', '');
  if (!GEMINI_KEY) {
    mdDiv.textContent = '⚠ No Gemini API key set. Enter your key above and click 💾 Save Key.';
    return '';
  }
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_KEY}`;
  const contents = [
    { role: 'user',  parts: [{ text: _buildSystemPrompt() }] },
    { role: 'model', parts: [{ text: 'Understood. Ready to assist as a senior incident response engineer.' }] },
    ..._chatHistory.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
  ];
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 120000);
  let res;
  try {
    res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
      signal: controller.signal
    });
  } finally { clearTimeout(timeout); }
  if (!res.ok) { const err = await res.text(); throw new Error(`Gemini HTTP ${res.status}: ${err.slice(0,200)}`); }
  return await _readStream(res, mdDiv, output, chunk => chunk.candidates?.[0]?.content?.parts?.[0]?.text || '');
}

async function _invokeViaHuggingFace(mdDiv, output) {
  const HF_KEY = LS.get('pcy_hf_key', '');
  if (!HF_KEY) {
    mdDiv.textContent = '⚠ No HuggingFace API key set. Enter your key above and click 💾 Save Key.';
    return '';
  }
  const HF_URL  = 'https://router.huggingface.co/v1/chat/completions';
  const messages = [{ role: 'system', content: _buildSystemPrompt() }, ..._chatHistory];
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 120000);
  let res;
  try {
    res = await fetch(HF_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${HF_KEY}` },
      body: JSON.stringify({ model: 'Qwen/Qwen2.5-72B-Instruct', messages, max_tokens: 2048, stream: true }),
      signal: controller.signal
    });
  } finally { clearTimeout(timeout); }
  if (!res.ok) { const err = await res.text(); throw new Error(`HuggingFace HTTP ${res.status}: ${err.slice(0,200)}`); }
  return await _readStream(res, mdDiv, output, chunk => chunk.choices?.[0]?.delta?.content || '');
}

async function _readStream(res, mdDiv, output, extractor) {
  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText  = '';
  let buffer    = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (!json || json === '[DONE]') continue;
      try {
        const piece = extractor(JSON.parse(json));
        if (piece) {
          fullText += piece;
          mdDiv.innerHTML  = _renderMarkdown(fullText);
          output.scrollTop = output.scrollHeight;
        }
      } catch { /* malformed chunk — skip */ }
    }
  }
  return fullText.trim() || 'No response received.';
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function _renderMarkdown(raw) {
  const esc    = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const parts  = raw.split(/(```[\s\S]*?```)/g);
  let html     = '';
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      const inner = part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '');
      html += `<pre class="md-code">${esc(inner)}</pre>`;
      return;
    }
    const lines = part.split('\n');
    let inList  = false;
    lines.forEach(line => {
      const h1 = line.match(/^#\s+(.+)/);
      const h2 = line.match(/^##\s+(.+)/);
      const h3 = line.match(/^###\s+(.+)/);
      if (h1) { if (inList) { html += '</ul>'; inList = false; } html += `<h3 class="md-h1">${esc(h1[1])}</h3>`; return; }
      if (h2) { if (inList) { html += '</ul>'; inList = false; } html += `<h4 class="md-h2">${esc(h2[1])}</h4>`; return; }
      if (h3) { if (inList) { html += '</ul>'; inList = false; } html += `<h5 class="md-h3">${esc(h3[1])}</h5>`; return; }
      const li = line.match(/^[-*]\s+(.+)/);
      const ol = line.match(/^\d+\.\s+(.+)/);
      if (li || ol) {
        if (!inList) { html += '<ul class="md-ul">'; inList = true; }
        html += `<li>${_inlineMarkdown(esc((li || ol)[1]))}</li>`;
        return;
      }
      if (inList) { html += '</ul>'; inList = false; }
      if (line.trim() === '') { html += '<br>'; return; }
      html += `<p class="md-p">${_inlineMarkdown(esc(line))}</p>`;
    });
    if (inList) { html += '</ul>'; inList = false; }
  });
  return html;
}

function _inlineMarkdown(escaped) {
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/`([^`]+)`/g,     '<code class="md-inline">$1</code>');
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
let _isGlass = true;

function toggleTheme() {
  _isGlass = !_isGlass;
  LS.set('pcy_glass', _isGlass);
  document.body.classList.remove('theme-glass', 'theme-dark');
  document.body.classList.add(_isGlass ? 'theme-glass' : 'theme-dark');
  const icon = _isGlass ? '🌙' : '☀️';
  document.getElementById('themeIcon').textContent = icon;
  const ti2 = document.getElementById('themeIcon2');
  if (ti2) ti2.textContent = icon;
}

// ─── Case Notes Panel ─────────────────────────────────────────────────────────
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
  _cnFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  _cnFields.forEach(id => LS.set('pcy_cn_' + id, ''));
  _doUpdatePreview();
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
  clearTimeout(updatePreview._t);
  updatePreview._t = setTimeout(_doUpdatePreview, 300);
  const ind = document.getElementById('cnSavedIndicator');
  if (ind) {
    ind.textContent = '✓ Draft saved';
    ind.classList.add('show');
    clearTimeout(ind._t);
    ind._t = setTimeout(() => ind.classList.remove('show'), 1800);
  }
}

function _doUpdatePreview() {
  _cnFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) LS.set('pcy_cn_' + id, el.value);
  });

  const sr         = _val('cn-sr');
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

  let out = 'NETOPS COCKPIT — INCIDENT LOG\n';
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

function toggleCnPreview() {
  const pre  = document.getElementById('cnPreview');
  const icon = document.getElementById('cnPreviewToggleIcon');
  const open = pre.style.display === 'none';
  pre.style.display = open ? 'block' : 'none';
  icon.textContent  = open ? '▼' : '▶';
  if (open) pre.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── Keyboard Shortcuts ───────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (_cnOpen) { toggleCaseNotes(); return; }
    if (state.activeDomain) { backToLanding(); return; }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    const si = document.getElementById('searchInput');
    if (si && document.getElementById('questionsOutput').style.display !== 'none') {
      e.preventDefault();
      si.focus();
      si.select();
    }
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
    e.preventDefault();
    clearAiChat();
    return;
  }
});

document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.id === 'cnTab') {
    e.preventDefault();
    toggleCaseNotes();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const aiInput = document.getElementById('aiInput');
  if (aiInput) {
    aiInput.addEventListener('keydown', e => {
      if ((e.key === 'Enter' && !e.shiftKey) || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        generateAiQuestions();
      }
    });
  }
});
