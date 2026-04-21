## Summary
<!-- What does this PR add or change? -->

## Domain / Technology
<!-- Which domain and technology JSON file(s) are affected? -->
- Domain: `networking` / `directory_services` / `performance` / `user_experience` / `device_deployment` / `storage_ha` / `collaboration`
- Technology file(s): `domains/<domain>/<tech_key>.json`

## Type of Change
- [ ] New technology JSON file
- [ ] Added questions to existing technology
- [ ] Added/updated playbook
- [ ] Bug fix (broken JSON, typo, wrong structure)
- [ ] App code change (`src/`)
- [ ] Infrastructure change (`docker/`, `k8s/`, `ansible/`)

## Checklist
- [ ] JSON is valid (no syntax errors)
- [ ] All 4 sections present: `scoping`, `probing`, `troubleshooting`, `datacollection`
- [ ] Both `l1` and `l2` arrays have at least 3 items each
- [ ] Technology `key` matches the filename (e.g. `dns_server` → `dns_server.json`)
- [ ] Technology `domain` field matches the parent folder name
- [ ] If adding a new technology: entry added to `domains/<domain>/_index.json`
- [ ] CI checks pass (JSON schema validation, HTML validate)

## Questions / Notes
<!-- Anything the reviewer should know -->
