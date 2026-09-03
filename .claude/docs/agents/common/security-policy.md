# security-policy — common security rules for dev-interview + sub-skills / sub-agents

> Referenced identically by the dev-interview body / the parse-spec-doc sub-skill / the 3 sub-agents (`.claude/agents/{code-investigator,db-meta-manager,security-auditor}.md`).
> Per-organization differences are absorbed by swapping this file.

---

## 1. Workspace access mode

- **read-only**. Writes only under `outputDir`·`tempDir` of `.claude/config/project.yaml`.
- A Write attempt to any other path → self-abort + report to the caller.

---

## 2. Forbidden file patterns

| Pattern | Reason |
|------|------|
| `**/*.yml` · `**/*.yaml` · `**/*.properties` (except `.claude/**` config) | Exposure of configuration, DB connections, secrets |
| `**/*.env` · `**/*.env.*` | Plaintext environment variables |
| `**/secrets/**` | Credentials / key material |

**Exception**: configs under `.claude/**` (`project.yaml`·`scope.yaml`·`project-meta.yaml`) are allowed because the harness needs them to operate. However, secret values must never be printed, quoted, logged, or committed. Packs/projects add organization/stack-specific extra locations. On detecting a Read attempt of a forbidden file, self-abort. (Actual enforcement is the `check-file-access.sh` hook.)

**Not exempt**: `config/system.yaml` and `*.local.*` under `.claude/**` hold secrets (access tokens, API keys) and stay blocked by `settings.json` `permissions.deny` — the hook whitelists them, the deny list does not. Only hooks and scripts read them (they run as OS processes, so no permission check applies). Non-secret behavior knobs therefore live in `project.yaml`, never in `system.yaml`.

---

## 3. Handling encryption markers

| Marker | Policy |
|------|------|
| Encryption token formats (defined per language pack — e.g. wrapping-token patterns) | When found, quote the evidence as-is. **Never attempt decryption** |
| `${...}` placeholder | Quote as-is. Do not trace environment-variable values |
| `BCrypt` / `Argon2` / `PBKDF2` hashes | Do not trace plaintext |

> Add organization-specific markers to the table if any (e.g. `Vault`, `KMS:`, `aws:kms:`).

---

## 4. DB access constraints

- **Metadata only**: `information_schema` / `pg_catalog` / `all_tab_columns` / `INFORMATION_SCHEMA` (per vendor).
- **No real-data SELECT**: on finding `SELECT * FROM <비메타테이블>`, self-abort.
- Access only the schema in `db.schema` of `.claude/config/project.yaml`. On detecting access to another schema, self-abort.

---

## 5. No self-reference

So that dev-interview does not take its own outputs/simulations back in as input:

| Path | Policy |
|------|------|
| `target/designs/` | ❌ Read forbidden |
| `target/sim/` | ❌ Read forbidden |
| `target/samples/` | ❌ Read forbidden |
| `{{config.outputDir}}/` | ⚠️ Read allowed only to consult past briefs |
| Workspace root `HANDOFF.md` | ✅ Read allowed |
| Project `CLAUDE.md` | ✅ Read allowed |
| `.claude/rules/`, `.claude/docs/guideline/` | ✅ Read allowed |

---

## 6. Evidence quoting constraints

- Never quote plaintext keys/secrets/passwords themselves (mask them, or variable names only).
- Never quote PII (personal information) in plaintext. Formats/field names only.
- Q&A log appendix: never quote the user's original wording (paraphrase decided facts only).

---

## 7. Behavior on violation

1. **self-abort**: stop the current tool call.
2. **Report to the caller**: state one line `[SECURITY] {위반 항목}` in the output contract's `status` or evidence section.
3. **Main thread**: notify the user of safe mode, then pause the work.

---

## 8. Per-organization customization points

Check when forking this file:

- [ ] Whether to add `.tfvars`, `kubeconfig`, `id_rsa`, etc. to the forbidden file patterns
- [ ] Additional encryption markers (`Vault`, `KMS:`, `aws:kms:`, etc.)
- [ ] Self-reference paths (build output directories other than `target/`)
- [ ] DB meta catalogs (per-vendor differences)
- [ ] Log masking policy
