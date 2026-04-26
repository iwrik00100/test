# Contributing to Nexus

This guide is for **tech leads** adding questions, playbooks, and technologies to the platform. You do not need to know JavaScript — you only edit JSON files.

---

## Branch Strategy

```
feature/your-work  →  PR  →  ver1.8 (staging)  →  PR  →  main (production / live site)
```

- All contributor PRs target **`ver1.8`** — never `main` directly
- `ver1.8` is the staging branch — CI validates here, repo owner reviews here
- `main` is production — only the repo owner promotes `ver1.8` → `main`

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/iwrik00100/nexus.git
cd nexus

# 2. Branch off ver1.8 (not main)
git checkout ver1.8
git checkout -b feature/directory-services-ad-ds

# 3. Edit your domain JSON file
# See structure below

# 4. Validate your JSON locally
python3 -c "import json; json.load(open('domains/directory_services/ad_ds.json'))"

# 5. Commit and push
git add domains/directory_services/ad_ds.json
git commit -m "feat(ds): add AD DS questions and playbooks"
git push origin feature/directory-services-ad-ds

# 6. Open a Pull Request — set base branch to ver1.8 (not main)
# GitHub will default to ver1.8 since it is the repo default branch
```

---

## Domain Ownership

| Domain | Folder | Owner |
|---|---|---|
| Networking | `domains/networking/` | @iwrik00100 |
| Directory Services | `domains/directory_services/` | TBD |
| Performance | `domains/performance/` | TBD |
| User Experience | `domains/user_experience/` | TBD |
| Device & Deployment | `domains/device_deployment/` | TBD |
| Storage & HA | `domains/storage_ha/` | TBD |
| Collaboration | `domains/collaboration/` | TBD |

You only need approval from your domain owner to merge.

---

## Adding a New Technology

### Step 1 — Create the JSON file

Create `domains/<domain_key>/<tech_key>.json` following this structure:

```json
{
  "key": "ad_ds",
  "label": "AD DS",
  "icon": "🏛",
  "domain": "directory_services",
  "scoping": {
    "l1": [
      "Question 1 — minimum 10 characters",
      "Question 2",
      "Question 3"
    ],
    "l2": [
      "Advanced question 1",
      "Advanced question 2",
      "Advanced question 3"
    ]
  },
  "probing": {
    "l1": ["Run command X and share output...", "...", "..."],
    "l2": ["Advanced diagnostic command...", "...", "..."]
  },
  "troubleshooting": {
    "l1": ["Resolution step 1...", "...", "..."],
    "l2": ["Advanced fix...", "...", "..."]
  },
  "datacollection": {
    "l1": ["Export log X...", "...", "..."],
    "l2": ["Capture trace Y...", "...", "..."]
  },
  "playbooks": {
    "symptom_slug": {
      "title": "Short symptom description",
      "severity": "high",
      "phases": [
        {
          "name": "Verify",
          "icon": "✅",
          "steps": [
            { "action": "Command to run", "expect": "Expected outcome" }
          ]
        },
        {
          "name": "Isolate",
          "icon": "🔍",
          "steps": [
            { "action": "Diagnostic command", "expect": "What to look for" }
          ]
        },
        {
          "name": "Fix",
          "icon": "🛠",
          "steps": [
            { "action": "Fix command", "expect": "Confirmation of fix" }
          ]
        },
        {
          "name": "Confirm",
          "icon": "🎯",
          "steps": [
            { "action": "Verification command", "expect": "Healthy state" }
          ]
        }
      ]
    }
  }
}
```

### Step 2 — Register in `_index.json`

Add your technology to `domains/<domain_key>/_index.json`:

```json
{
  "key": "directory_services",
  "label": "Directory Services",
  "icon": "🏛",
  "description": "...",
  "technologies": [
    { "key": "ad_ds", "label": "AD DS", "icon": "🏛" }
  ]
}
```

---

## Rules & Validation

CI will **block your PR** if any of these fail:

| Rule | Requirement |
|---|---|
| JSON syntax | Must be valid JSON — no trailing commas, no comments |
| `key` format | Snake_case only: `a-z`, `0-9`, `_` |
| `domain` field | Must match one of the 7 valid domain keys |
| Minimum questions | At least **3 items** in every `l1` and `l2` array |
| Question length | Each question must be at least **10 characters** |
| Severity values | Must be `"high"`, `"medium"`, or `"low"` |
| Playbook phases | At least 1 phase with at least 1 step |

---

## Adding Questions to an Existing Technology

Open the existing JSON file and add to the relevant array:

```json
"scoping": {
  "l1": [
    "Existing question 1",
    "Existing question 2",
    "Your new question here"   ← add here
  ]
}
```

---

## Playbook Guidelines

- Use **4 phases**: Verify → Isolate → Fix → Confirm
- `action` — exact command or action to perform
- `expect` — what a healthy/fixed result looks like
- Keep actions concise — one command per step
- Severity: `high` = production impact, `medium` = degraded, `low` = cosmetic

---

## Local Validation

```bash
# Validate JSON syntax (Python — no install needed)
python3 -c "import json; json.load(open('domains/networking/dns_server.json', encoding='utf-8'))"

# Validate all files at once (syntax only)
python3 -c "
import json, os, sys
errors = []
for root, dirs, files in os.walk('domains'):
    for f in files:
        if f.endswith('.json'):
            path = os.path.join(root, f)
            try:
                json.load(open(path, encoding='utf-8'))
            except json.JSONDecodeError as e:
                errors.append(f'{path}: {e}')
if errors:
    [print(e) for e in errors]; sys.exit(1)
print(f'All JSON files valid')
"

# Validate against JSON Schema (matches what CI uses)
npm install -g ajv-cli ajv-formats

# Validate a technology file against the schema contract
ajv validate -s schema/technology.schema.json -d domains/networking/dns_server.json --spec=draft7 --strict=false

# Validate a domain index file
ajv validate -s schema/domain-index.schema.json -d domains/networking/_index.json --spec=draft7 --strict=false

# Run app locally with Docker
docker compose up
# → http://localhost:8080/src/
```

> **Note:** CI uses `ajv` against `schema/technology.schema.json` and `schema/domain-index.schema.json`. Run the ajv commands locally before opening a PR to avoid CI surprises.

---

## Branch Protection & Governance

The `main` branch is protected. All contributor changes must go through `ver1.8`:

```
feature branch → PR → ver1.8 → CI pass → 1 approval → merge to ver1.8
                                                              ↓
                                                    repo owner promotes
                                                    ver1.8 → main → auto-deploy
```

| Rule | Requirement |
|---|---|
| Pull request required | No direct pushes to `main` or `ver1.8` |
| Base branch | Always target `ver1.8` — never `main` |
| Status checks | All CI jobs must pass |
| Approvals | At least 1 approving review |
| Force push | Blocked |
| Branch deletion | Blocked |

Domain ownership is enforced via `CODEOWNERS` — your PR must be approved by your domain owner before it can merge.

---

## Commit Message Format

```
feat(networking): add SMB multichannel playbook
feat(ds): add AD CS scoping questions
fix(vpn): correct IKEv2 probing command typo
docs: update CONTRIBUTING.md
```

---

## Need Help?

- Open a GitHub Issue with the `question` label
- Tag `@iwrik00100` in your PR for review
