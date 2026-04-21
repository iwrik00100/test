# Nexus — Microsoft Unified Support · Incident Command

A professional incident command platform for L1 and L2 Microsoft Unified Support engineers. Structured scoping, probing, troubleshooting, data collection and step-by-step playbooks for Windows Server and Azure support scenarios.

**Live:** https://iwrik00100.github.io/nexus/src/

---

## 🎯 Purpose

Nexus instantly surfaces structured guidance for active support incidents across 7 disciplines and 11+ technologies — without needing to search documentation or recall commands under pressure.

---

## 🏛 Disciplines & Technologies

| Discipline | Technologies |
|---|---|
| **Networking** | DNS Server, DNS Client, DHCP Server, DHCP Client, TCP/IP, SMB, DFS, NPS (RADIUS), 802.1x Wired, 802.1x Wireless, VPN |
| **Directory Services** | AD DS, AD CS (PKI), AD FS, Azure AD / Entra ID, Kerberos, LDAP, Group Policy |
| **Performance** | CPU, Memory, Disk I/O, Network Throughput, WPA / ETW Tracing, PerfMon |
| **User Experience** | Logon & Authentication, User Profiles, App Compatibility, Azure Virtual Desktop, RDS, Printing |
| **Device & Deployment** | Microsoft Intune, SCCM / ConfigMgr, Windows Autopilot, WSUS, WDS / MDT, Co-Management |
| **Storage & High Availability** | Storage Spaces / S2D, Failover Clustering, Hyper-V, ReFS / NTFS, iSCSI / FC SAN, Windows Server Backup |
| **Collaboration** | Exchange Online, Microsoft Teams, SharePoint Online, OneDrive for Business, M365 Connectivity, Hybrid Mail Flow |

> Networking is fully populated. The remaining 6 disciplines are ready for tech lead contributions.

---

## ✨ Features

- **7 Disciplines** — click a discipline card to enter its technology workspace
- **Scoping, Probing, Troubleshooting, Data Collection** — structured question sets per technology, per tier
- **L1 / L2 / Both** — tier filter in the header
- **Playbooks** — symptom-driven Verify → Isolate → Fix → Confirm runbooks with per-step checkboxes
- **Search** — real-time keyword search with inline highlight (`Ctrl+F`)
- **Export** — `.txt`, `.md`, `.html` exports of any question set
- **Incident Log** — sliding panel for building structured ICM/SR case notes, auto-saved to localStorage
- **Themes** — Liquid Glass (default) and Dark Cyberpunk toggle
- **AI Advisor** — Phase 2 (hidden, code preserved)

---

## 📁 Repository Structure

```
nexus/
├── src/                        ← Application
│   ├── index.html              — UI (landing page + domain page)
│   ├── app.js                  — All application logic
│   └── styles.css              — Glass + dark themes
│
├── domains/                    ← Data (owned by tech leads)
│   ├── networking/
│   │   ├── _index.json         — Lists all 11 networking technologies
│   │   ├── dns_server.json
│   │   ├── dns_client.json
│   │   ├── dhcp_server.json
│   │   ├── dhcp_client.json
│   │   ├── tcpip.json
│   │   ├── smb.json
│   │   ├── dfs.json
│   │   ├── nps.json
│   │   ├── dot1x_wired.json
│   │   ├── dot1x_wireless.json
│   │   └── vpn.json
│   ├── directory_services/     — _index.json (stub, ready for contributions)
│   ├── performance/            — _index.json (stub)
│   ├── user_experience/        — _index.json (stub)
│   ├── device_deployment/      — _index.json (stub)
│   ├── storage_ha/             — _index.json (stub)
│   └── collaboration/          — _index.json (stub)
│
├── schema/                     ← JSON Schema contracts
│   ├── technology.schema.json  — Validates every technology JSON file
│   └── domain-index.schema.json — Validates every _index.json
│
├── docker/                     ← Containerization
│   ├── Dockerfile
│   ├── nginx.conf
│   └── docker-compose.yml
│
├── k8s/                        ← Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   └── kustomization.yaml
│
├── ansible/                    ← Automation
│   ├── inventory.ini
│   ├── setup-dev.yml
│   └── deploy-nginx.yml
│
├── grafana/                    ← Observability
│   ├── dashboards/
│   └── provisioning/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              — JSON validation, HTML lint, Lighthouse on every PR
│   │   ├── deploy.yml          — Auto-deploy to GitHub Pages on merge to main
│   │   └── codeql.yml          — Security scanning
│   ├── CODEOWNERS              — Domain ownership enforcement
│   ├── dependabot.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── CONTRIBUTING.md
└── README.md
```

---

## 🚀 Getting Started

### GitHub Pages (live)
```
https://iwrik00100.github.io/test/src/
```

### Local — Docker (recommended)
```bash
# App only
docker compose up
# → http://localhost:8080/src/

# App + Grafana observability
docker compose --profile monitoring up
# → App:     http://localhost:8080/src/
# → Grafana: http://localhost:3000  (admin / nexus)
```

### Local — Kubernetes (Docker Desktop)
```bash
# Enable Kubernetes in Docker Desktop Settings → Kubernetes

# Build image
docker build -t nexus:latest -f docker/Dockerfile .

# Deploy
kubectl apply -k k8s/

# Access
kubectl port-forward svc/netops-cockpit 8080:80
# → http://localhost:8080/src/
```

### Local — No Docker
```bash
# Python 3
cd src
python -m http.server 3000
# → http://localhost:3000
```

---

## 🏗️ Adding a New Technology

Tech leads edit only JSON files — no JavaScript required.

### Step 1 — Create the technology JSON

Create `domains/<discipline_key>/<tech_key>.json`:

```json
{
  "key": "ad_ds",
  "label": "AD DS",
  "icon": "🏛",
  "domain": "directory_services",
  "scoping": {
    "l1": ["Question 1 (min 10 chars)", "Question 2", "Question 3"],
    "l2": ["Advanced question 1", "Advanced question 2", "Advanced question 3"]
  },
  "probing":         { "l1": ["...","...","..."], "l2": ["...","...","..."] },
  "troubleshooting": { "l1": ["...","...","..."], "l2": ["...","...","..."] },
  "datacollection":  { "l1": ["...","...","..."], "l2": ["...","...","..."] },
  "playbooks": {
    "symptom_slug": {
      "title": "Short symptom description",
      "severity": "high",
      "phases": [
        { "name": "Verify",  "icon": "✅", "steps": [{ "action": "Command", "expect": "Expected result" }] },
        { "name": "Isolate", "icon": "🔍", "steps": [{ "action": "Command", "expect": "Expected result" }] },
        { "name": "Fix",     "icon": "🛠",  "steps": [{ "action": "Command", "expect": "Expected result" }] },
        { "name": "Confirm", "icon": "🎯", "steps": [{ "action": "Command", "expect": "Expected result" }] }
      ]
    }
  }
}
```

### Step 2 — Register in `_index.json`

Add your technology to `domains/<discipline_key>/_index.json`:

```json
{
  "technologies": [
    { "key": "ad_ds", "label": "AD DS", "icon": "🏛" }
  ]
}
```

### Step 3 — Validate locally

```bash
python -c "import json,os; [json.load(open(os.path.join(r,f),encoding='utf-8')) for r,d,fs in os.walk('domains') for f in fs if f.endswith('.json')]; print('All valid')"
```

### Step 4 — Open a Pull Request

CI will automatically validate JSON schema, HTML, and run Lighthouse. Your domain owner must approve before merge.

---

## 🔒 CI/CD Validation Rules

CI blocks a PR if any of these fail:

| Rule | Requirement |
|---|---|
| JSON syntax | Valid JSON — no trailing commas, no comments |
| `key` format | Snake_case: `a-z`, `0-9`, `_` only |
| `domain` field | Must match one of the 7 valid discipline keys |
| Minimum questions | At least **3 items** per `l1` and `l2` array |
| Question length | Each question at least **10 characters** |
| Severity | Must be `"high"`, `"medium"`, or `"low"` |

---

## 🗺️ DevOps Stack

| Layer | Tool | Purpose |
|---|---|---|
| Source control | GitHub | Branching, PRs, code review |
| CI | GitHub Actions | JSON validation, lint, Lighthouse on every PR |
| CD | GitHub Actions + Pages | Auto-deploy on merge to main |
| Security | CodeQL + Dependabot | SAST scanning + dependency alerts |
| Containerization | Docker + nginx | Local dev, reproducible environment |
| Orchestration | Kubernetes (local) | Deployment manifests, rolling updates |
| Config management | Ansible | Dev setup, self-hosted deploy |
| Observability | Grafana | CI/CD pipeline health, Lighthouse score trends |
| Governance | CODEOWNERS | Per-discipline ownership enforcement |

**Total cost: $0** — everything runs free locally or on GitHub.

---

## 📌 Usage Tips

1. **Click a discipline card** to enter its technology workspace
2. **Select a technology** from the grid
3. **Start with Scoping (L1)** — gather environment basics first
4. **Use Probing (L1)** for initial diagnostic commands
5. **Use Troubleshooting (L1)** before escalating
6. **Use Playbooks** for known symptoms — guided Verify → Fix → Confirm runbook
7. **Escalate with Probing (L2) + Data Collection (L2)** — advanced traces for L2 analysis
8. **Check off questions** as you go — progress bar tracks coverage
9. **Search with Ctrl+F** to filter instantly
10. **Build case notes in parallel** — open 📝 Incident Log, it auto-saves every keystroke
11. **Export to .md or .html** — attach to ICM/SR or paste into OneNote/Confluence

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+F` | Focus question search |
| `Esc` | Back to disciplines / close Incident Log |
| `Ctrl+L` | Clear AI chat (Phase 2) |

---

*Nexus · Microsoft Unified Support · Incident Command*
