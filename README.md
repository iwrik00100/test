# MS Unified Support — PCY Question Generator

A professional web application for L1 and L2 Microsoft Unified Support engineers supporting Windows Networking (PCY practice).

## 🎯 Purpose

Instantly generate relevant **scoping**, **probing**, **troubleshooting**, and **data collection** questions for support cases across all major Windows Networking and Authentication technologies.

---

## 🔧 Technologies Covered

| Category | Technology | Scope |
|---|---|---|
| **Core Networking** | **DNS Server** | Windows DNS Server service, zones, AD integration, forwarders |
| **Core Networking** | **DNS Client** | Windows DNS resolver, cache, NRPT, suffix search |
| **Core Networking** | **DHCP Server** | Scopes, failover, policies, leases, audit logs |
| **Core Networking** | **DHCP Client** | IP acquisition, service state, relay path |
| **Core Networking** | **TCP/IP** | Connectivity, routing, NIC offloads, firewall, IPv6 |
| **Core Networking** | **SMB** | File share access, authentication, signing, Multichannel |
| **Core Networking** | **DFS** | DFS Namespaces, DFS Replication, SYSVOL |
| **Authentication** | **NPS (RADIUS)** | RADIUS auth, EAP-TLS, PEAP-MSCHAPv2, policies, proxy |
| **Authentication** | **802.1x Wired** | Switchport auth, Wired AutoConfig, EAP, MAB fallback |
| **Authentication** | **802.1x Wireless** | SSID auth, WLAN AutoConfig, EAP, WAP controller |
| **Remote Access** | **VPN** | SSTP, IKEv2, L2TP/IPsec, Always On VPN (AOVPN) |

---

## 🚀 Getting Started

### Option 1 — Open directly in browser
Simply open `index.html` in any modern browser. No server required.

```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

### Option 2 — Serve locally
```bash
# Python 3
python -m http.server 3000

# Node.js (npx)
npx serve .
```
Then open `http://localhost:3000`

---

## 📁 Repository Structure

```
ms-support-question-generator/
├── index.html      — Main application UI
├── app.js          — Application logic, state management, AI integration
├── questions.js    — Question bank (all technologies, all tiers)
├── styles.css      — UI styles
└── README.md       — This file
```

---

## ✨ Features

### Question Bank
- **Scoping Questions** — Gather environment, configuration, and impact context
- **Probing Questions** — Specific diagnostic commands and data collection steps
- **Troubleshooting Steps** — Resolution guidance and remediation actions
- **Data Collection** — Logs, traces, and exports to attach to ICM/SR
- **L1 Tier** — Foundational questions for first-level triage
- **L2 Tier** — Advanced technical deep-dive questions
- Filter by technology, tier (L1 / L2 / Both), and question type

### Question Search & Filter
- Real-time keyword search across all visible questions
- Matching keyword highlighted inline in cyan
- Match count displayed (e.g. "7 matches")
- Non-matching questions and empty sections hidden automatically
- Search clears automatically when switching technology or question type
- Shortcut: `Ctrl+F` focuses the search input

### Question Completion Checkboxes
- Checkbox on every question to mark it as asked/answered
- Checked questions are struck through with a green tint
- Progress bar shows `X / Y checked` with animated fill
- "Clear Checks" button resets all checkboxes in one click

### Export & Copy
- Copy individual questions with one click
- Copy all visible questions to clipboard (respects active search filter)
- **Export .txt** — plain text with metadata header
- **Export .md** — Markdown with metadata table, renders in OneNote / Confluence / Azure DevOps
- **Export .html** — self-contained styled HTML with L1/L2 colour-coded badges, print-ready

### AI-Powered Assistant
- Paste any customer scenario description or ask any technical question
- Multi-turn conversational chat — context preserved across messages
- **Streaming responses** — tokens render as they arrive, no waiting for full response
- Two AI provider options — switch between them with the provider toggle:
  - ⚡ **Google Gemini 2.5 Flash** — fast, high quality (requires free API key)
  - 🤗 **HuggingFace Qwen2.5-72B** — powerful open model (requires free API key)
- API keys entered in-app and stored in `localStorage` — never hardcoded or committed
- Goes beyond the question bank — root cause analysis, known bugs, KB articles, registry fixes, packet capture interpretation, advanced PowerShell
- Clear Chat button resets conversation history (`Ctrl+L`)

### Theme Toggle
- **Dark mode** (default) — deep navy/cyan engineering theme
- **Light mode** — Apple liquid glass design with frosted panels and soft sky gradient
- Toggle button in the header (🌙 / ☀️), tooltip shows "Light" or "Dark" on hover
- Theme preference saved and restored across sessions

### Case Notes Builder
Sliding panel (📝 tab on the right edge) for building structured ICM/SR documentation:

**Meta fields:**
- SR / ICM Number, Date, Follow-up Date
- Engineer, Customer, Technology
- Severity (Sev A–D), Case Status, Contact Type

**Content sections:**
- 🔴 Issue — symptom, error messages, business impact
- 🖥 Environment Details — OS, topology, roles, infrastructure
- 🔍 Assessment / Troubleshooting Done — steps taken, findings, hypotheses
- 📦 Data Collection — traces, logs, files collected or pending
- 🔁 Repro Steps — baseline, actions, repro rate, workarounds
- 🕐 Recent Changes — patches, GPO, network, certificates, hardware
- 📋 Action Plan — split view: ⏳ Pending on Customer / 🔬 Pending on Microsoft
- ✅ Resolution / Root Cause — fix applied, KB reference, verification steps
- 🔗 KB / Escalation References — KB article, bug number, escalated-to, related SRs
- 💬 Additional Notes — internal notes, customer sentiment, escalation context

**Behaviour:**
- All fields auto-saved to `localStorage` on every keystroke — "✓ Draft saved" indicator flashes
- Fully restored on page reload — no data lost on refresh
- "Copy Note" formats all filled fields into a clean structured text block ready to paste into ICM/SR
- "Clear" resets all fields and clears saved draft

### Persistence (localStorage)
All of the following survive page refresh:
- Selected technology, tier, and question type
- Theme preference (dark / glass)
- All case notes fields

### Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl+F` | Focus question search input |
| `Ctrl+L` | Clear AI chat history |
| `Esc` | Close the Case Notes panel |
| `Enter` / `Space` | Open Case Notes panel (when tab is focused) |

---

## 🤖 AI Assistant Setup

No installation required. Just get a free API key for your preferred provider:

### Option A — Google Gemini (recommended)
1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create a free API key
3. Open the app, select **⚡ Gemini 2.5 Flash**, paste the key, and click **💾 Save Key**

### Option B — HuggingFace Qwen2.5-72B
1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create a new token (Read access is sufficient)
3. Open the app, select **🤗 HuggingFace**, paste the key, and click **💾 Save Key**

Keys are saved in your browser's `localStorage` and never leave your machine.

---

## 🏗️ Adding Questions

Edit `questions.js` to add new questions or technologies. Follow the existing structure:

```javascript
technology_key: {
  label: "Display Name",
  icon: "🔧",
  category: "Category Name",
  scoping: {
    l1: ["Question 1...", "Question 2..."],
    l2: ["Advanced question 1...", ...]
  },
  probing: {
    l1: ["Run command X and share...", ...],
    l2: ["Advanced diagnostic command...", ...]
  },
  troubleshooting: {
    l1: ["Resolution step 1...", ...],
    l2: ["Advanced fix...", ...]
  },
  datacollection: {
    l1: ["Export log X...", ...],
    l2: ["Capture trace Y...", ...]
  }
}
```

Also add the new key to `TECH_CATEGORIES` at the bottom of `questions.js`:

```javascript
const TECH_CATEGORIES = {
  "Core Networking":  ["dns_server", "dns_client", ...],
  "Authentication":   ["nps", "dot1x_wired", "dot1x_wireless"],
  "Remote Access":    ["vpn", "your_new_key"]
};
```

---

## 📋 Question Categories Explained

### Scoping Questions
Used to **understand the environment** before diagnosing:
- What versions, roles, and topology are involved?
- When did it start? What changed?
- What is the blast radius (1 user vs. all users)?

### Probing Questions
Used to **gather diagnostic data**:
- Specific PowerShell/CMD commands to run
- Log files and event IDs to collect
- Network traces and configuration exports

### Troubleshooting Steps
Used to **resolve the issue**:
- Step-by-step remediation actions
- Known fixes, registry changes, and service restarts
- Workarounds and escalation triggers

### Data Collection
Used to **package evidence for escalation**:
- ETL traces, event log exports, config exports
- Commands to run and files to collect before escalating to L2/L3

---

## 🛠️ Customization

- **Add new technologies**: Extend `QUESTION_BANK` and `TECH_CATEGORIES` in `questions.js`
- **Modify UI theme**: Edit CSS variables in `styles.css` (`:root` block)
- **Change AI model**: Update `model` in `_invokeViaGemini()` or `_invokeViaHuggingFace()` in `app.js`
- **Adjust AI prompt**: Edit `_SYSTEM_PROMPT` in `app.js` to change tone or focus area

---

## 📌 Usage Tips for Support Engineers

1. **Start with Scoping (L1)** — Always gather environment basics first
2. **Use Probing (L1) for initial data** — Get ipconfig, event logs, and service status
3. **Use Troubleshooting (L1)** — Apply common fixes before escalating
4. **Escalate with Probing (L2) + Data Collection (L2)** — Collect traces and advanced cmdlets for L2 analysis
5. **Use AI Assistant for complex cases** — Paste the customer's exact description for tailored expert guidance
6. **Check off questions as you go** — Use checkboxes to track what's been asked; progress bar shows coverage
7. **Search when you know what you need** — `Ctrl+F` to filter hundreds of questions instantly
8. **Build case notes in parallel** — Open the 📝 panel and fill sections as the call progresses; it auto-saves
9. **Export to .md or .html** — Attach to ICM/SR or paste into OneNote/Confluence for documentation

---

## 🤝 Contributing

To add questions or improve coverage:
1. Edit `questions.js` with your additions
2. Follow the existing JSON structure
3. Include all four sections (`scoping`, `probing`, `troubleshooting`, `datacollection`) with both `l1` and `l2` entries
4. Add the technology key to the correct category in `TECH_CATEGORIES`
5. Prefer PowerShell cmdlets over legacy `cmd` tools where applicable

---

*Built for Microsoft Unified Support — PCY Practice*
*Technologies: Windows DNS · DHCP · TCP/IP · SMB · DFS · NPS · 802.1x · VPN*
