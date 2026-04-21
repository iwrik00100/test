# Changelog

All notable changes to Nexus are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.0.0] — 2025-04-21

### Added
- 7-discipline landing page with Microsoft-branded domain cards
- Liquid Glass default theme with Dark Cyberpunk toggle
- Per-discipline JSON data architecture — tech leads edit JSON only, no JavaScript required
- `domains/` folder with one JSON file per technology
- `schema/technology.schema.json` and `schema/domain-index.schema.json` — AJV-validated contracts
- `src/index.html`, `src/app.js`, `src/styles.css` — full rewrite into `/src`
- Two-page navigation — landing page (7 disciplines) → domain page (technologies)
- Logo click navigates back to landing page
- Incident Log sliding panel with full ICM/SR documentation builder
- Docker containerization — `docker/Dockerfile`, `docker/nginx.conf`, `docker-compose.yml`
- Kubernetes manifests — `k8s/deployment.yaml`, `k8s/service.yaml`, `k8s/ingress.yaml`, `k8s/configmap.yaml`, `k8s/kustomization.yaml`
- Ansible playbooks — `ansible/setup-dev.yml`, `ansible/deploy-nginx.yml`
- Grafana dashboards — CI/CD pipeline health and Lighthouse score trends
- GitHub Actions CI — JSON schema validation (AJV), HTML validate, ESLint, Lighthouse CI, Unit Test scaffold
- GitHub Actions CD — auto-deploy to GitHub Pages on merge to `main`
- CodeQL security scanning with SHA-pinned actions
- Dependabot for automated GitHub Actions dependency updates
- `CODEOWNERS` — per-discipline ownership enforcement
- `CONTRIBUTING.md` — tech lead guide for adding JSON, AJV validation, branch protection docs
- Branch protection on `main` — PR required, CI must pass, no force push
- UptimeRobot monitoring on live GitHub Pages URL

### Changed
- Renamed from **NetOps Cockpit** to **Nexus**
- All branding updated across exports, incident log, page titles, footer
- "Practice Areas" renamed to "Disciplines"
- Removed "Select a practice area" instruction text — UI is self-explanatory
- AI Advisor hidden from UI (code preserved for Phase 2)
- Removed PCY practice branding

### Removed
- Legacy root-level `app.js`, `index.html`, `styles.css`, `questions.js`
- `launch.bat`, `patch.py`
- Monolithic `questions.js` — replaced by individual technology JSON files

---

## [1.8.0] — 2025-04-01

### Added
- Playbooks — symptom-driven Verify → Isolate → Fix → Confirm runbooks
- 42 playbooks across all 11 networking technologies
- Incident Log (case notes builder) with localStorage persistence
- AI Advisor — Gemini 2.5 Flash and HuggingFace Qwen2.5-72B with real streaming
- Dark Cyberpunk theme
- Liquid Glass theme
- Export to `.txt`, `.md`, `.html`
- Real-time search with keyword highlight (`Ctrl+F`)
- Progress bar with per-question checkboxes
- L1 / L2 / Both tier filter
- Tier toggle hide on Playbook tab

### Technologies Covered (Networking)
- DNS Server, DNS Client
- DHCP Server, DHCP Client
- TCP/IP, SMB, DFS
- NPS (RADIUS), 802.1x Wired, 802.1x Wireless
- VPN (SSTP, IKEv2, L2TP, Always On VPN)

---

## Upcoming

### [2.1.0] — Planned
- Directory Services discipline — AD DS, AD CS, AD FS, Azure AD, Kerberos, LDAP, Group Policy
- Performance discipline — CPU, Memory, Disk I/O, Network Throughput, WPA/ETW, PerfMon
- User Experience discipline — Logon, Profiles, App Compat, AVD, RDS, Printing
- Device & Deployment discipline — Intune, SCCM, Autopilot, WSUS, WDS, Co-Management
- Storage & HA discipline — Storage Spaces, Failover Cluster, Hyper-V, ReFS, iSCSI
- Collaboration discipline — Exchange Online, Teams, SharePoint, OneDrive, M365

### [3.0.0] — Planned
- AI Advisor Phase 2 — enable for end users
- GitHub Releases with auto-generated release notes
